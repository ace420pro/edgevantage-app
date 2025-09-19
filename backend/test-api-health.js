// API Health Check Script
const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

class APIHealthChecker {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  log(type, test, message, details = null) {
    const result = { type, test, message, details, timestamp: new Date().toISOString() };
    this.results.tests.push(result);

    const emoji = type === 'pass' ? '✅' : type === 'fail' ? '❌' : '⚠️ ';
    console.log(`${emoji} ${test}: ${message}`);

    if (details && process.env.VERBOSE) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }

    this.results[type === 'pass' ? 'passed' : type === 'fail' ? 'failed' : 'warnings']++;
  }

  async testEndpoint(name, method, endpoint, expectedStatus = 200, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        timeout: 10000,
        validateStatus: () => true // Accept any status
      };

      if (data) {
        config.data = data;
      }

      const startTime = Date.now();
      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      if (response.status === expectedStatus) {
        this.log('pass', name, `${response.status} in ${responseTime}ms`, {
          status: response.status,
          responseTime,
          dataSize: JSON.stringify(response.data).length
        });
        return response;
      } else {
        this.log('fail', name, `Expected ${expectedStatus}, got ${response.status}`, {
          status: response.status,
          responseTime,
          data: response.data
        });
        return null;
      }
    } catch (error) {
      this.log('fail', name, `Request failed: ${error.message}`, {
        error: error.code || error.message
      });
      return null;
    }
  }

  async runAllTests() {
    console.log('🔍 Starting API Health Check Tests...\n');

    // Test 1: Basic Health Check
    await this.testEndpoint('Health Check', 'GET', '/api/health');

    // Test 2: CORS Preflight
    await this.testEndpoint('CORS Preflight', 'OPTIONS', '/api/health', 200, null, {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'GET'
    });

    // Test 3: Root Endpoint
    await this.testEndpoint('Root Endpoint', 'GET', '/');

    // Test 4: Invalid Endpoint (404 Test)
    await this.testEndpoint('404 Handler', 'GET', '/api/nonexistent', 404);

    // Test 5: Admin Authentication
    const adminAuthResponse = await this.testEndpoint(
      'Admin Authentication',
      'POST',
      '/api/admin/auth',
      200,
      {
        username: 'edgevantage_admin',
        password: 'EdgeVantage2024!Secure'
      }
    );

    let adminToken = null;
    if (adminAuthResponse && adminAuthResponse.data.token) {
      adminToken = adminAuthResponse.data.token;
      this.log('pass', 'Admin Token', 'Successfully retrieved admin token');
    } else {
      this.log('fail', 'Admin Token', 'Failed to retrieve admin token');
    }

    // Test 6: Protected Route (without token)
    await this.testEndpoint('Protected Route (No Auth)', 'GET', '/api/leads', 401);

    // Test 7: Protected Route (with token)
    if (adminToken) {
      await this.testEndpoint(
        'Protected Route (With Auth)',
        'GET',
        '/api/leads-stats',
        200,
        null,
        { 'Authorization': `Bearer ${adminToken}` }
      );
    }

    // Test 8: Lead Submission
    const testLead = {
      name: 'Test User ' + Date.now(),
      email: `test.${Date.now()}@example.com`,
      phone: '(555) 123-4567',
      state: 'TX',
      city: 'Dallas',
      hasResidence: 'yes',
      hasInternet: 'yes',
      hasSpace: 'yes',
      referralSource: 'api_test'
    };

    const leadResponse = await this.testEndpoint(
      'Lead Submission',
      'POST',
      '/api/leads',
      201,
      testLead
    );

    // Test 9: Duplicate Lead Submission
    if (leadResponse) {
      await this.testEndpoint(
        'Duplicate Lead Prevention',
        'POST',
        '/api/leads',
        400,
        testLead
      );
    }

    // Test 10: Referral Code Validation
    await this.testEndpoint('Valid Referral Code', 'GET', '/api/referral/SAVE50');
    await this.testEndpoint('Invalid Referral Code', 'GET', '/api/referral/INVALID123', 404);

    // Test 11: Rate Limiting
    console.log('\n🚦 Testing Rate Limiting...');
    let rateLimitHit = false;
    for (let i = 0; i < 5; i++) {
      const response = await this.testEndpoint(
        `Rate Limit Test ${i + 1}`,
        'GET',
        '/api/health',
        200
      );
      if (response && response.status === 429) {
        rateLimitHit = true;
        break;
      }
    }

    if (!rateLimitHit) {
      this.log('warning', 'Rate Limiting', 'Rate limits appear to be very generous or disabled');
    }

    // Test 12: Error Handling
    await this.testEndpoint(
      'Invalid JSON Handling',
      'POST',
      '/api/leads',
      400,
      'invalid json string'
    );

    // Test 13: User Registration (if available)
    const testUser = {
      name: 'Test User',
      email: `testuser.${Date.now()}@example.com`,
      password: 'testpass123'
    };

    await this.testEndpoint(
      'User Registration',
      'POST',
      '/api/auth/register',
      201,
      testUser
    );

    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📋 Total Tests: ${this.results.tests.length}`);

    const successRate = (this.results.passed / this.results.tests.length * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(t => t.type === 'fail')
        .forEach(t => console.log(`   • ${t.test}: ${t.message}`));
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.tests
        .filter(t => t.type === 'warning')
        .forEach(t => console.log(`   • ${t.test}: ${t.message}`));
    }

    return {
      success: this.results.failed === 0,
      results: this.results
    };
  }
}

// Performance benchmarks
async function runPerformanceBenchmarks() {
  console.log('\n⚡ Running Performance Benchmarks...\n');

  const endpoints = [
    { name: 'Health Check', endpoint: '/api/health' },
    { name: 'Root Endpoint', endpoint: '/' }
  ];

  for (const { name, endpoint } of endpoints) {
    const times = [];
    const iterations = 10;

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      try {
        await axios.get(`${BASE_URL}${endpoint}`, { timeout: 5000 });
        times.push(Date.now() - startTime);
      } catch (error) {
        console.log(`❌ ${name} failed on iteration ${i + 1}`);
      }
    }

    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);

      console.log(`📊 ${name}:`);
      console.log(`   Average: ${avg.toFixed(1)}ms`);
      console.log(`   Min: ${min}ms`);
      console.log(`   Max: ${max}ms`);
      console.log(`   Samples: ${times.length}/${iterations}`);

      if (avg > 1000) {
        console.log(`   ⚠️  High latency detected`);
      } else if (avg < 100) {
        console.log(`   ✅ Excellent performance`);
      } else {
        console.log(`   ✅ Good performance`);
      }
    }
  }
}

// Main execution
async function main() {
  try {
    const checker = new APIHealthChecker();
    const healthResult = await checker.runAllTests();

    await runPerformanceBenchmarks();

    console.log('\n🎉 API Health Check Completed');

    if (!healthResult.success) {
      console.log('⚠️  Some tests failed. Please review the results above.');
      process.exit(1);
    } else {
      console.log('✅ All critical tests passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('💥 Health check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { APIHealthChecker, runPerformanceBenchmarks };