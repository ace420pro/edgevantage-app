#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Runs a series of checks to ensure the deployment is safe and functional
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n${'='.repeat(msg.length)}`)
};

class DeploymentVerifier {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
  }

  // Check if build directory exists
  checkBuildDirectory() {
    log.header('Checking Build Directory');
    const buildPath = path.join(process.cwd(), 'build');
    
    if (fs.existsSync(buildPath)) {
      log.success('Build directory exists');
      
      // Check build size
      const buildSize = this.getDirectorySize(buildPath);
      const sizeMB = (buildSize / 1024 / 1024).toFixed(2);
      
      if (sizeMB > 50) {
        this.warnings.push(`Build size is large: ${sizeMB}MB`);
        log.warning(`Build size is large: ${sizeMB}MB`);
      } else {
        log.success(`Build size: ${sizeMB}MB`);
      }
      
      // Check for index.html
      if (fs.existsSync(path.join(buildPath, 'index.html'))) {
        log.success('index.html found');
      } else {
        this.errors.push('index.html not found in build directory');
        log.error('index.html not found in build directory');
      }
      
      // Check for static assets
      const staticPath = path.join(buildPath, 'static');
      if (fs.existsSync(staticPath)) {
        const jsFiles = fs.readdirSync(path.join(staticPath, 'js')).length;
        const cssFiles = fs.readdirSync(path.join(staticPath, 'css')).length;
        log.success(`Found ${jsFiles} JS files and ${cssFiles} CSS files`);
      } else {
        this.errors.push('Static assets directory not found');
        log.error('Static assets directory not found');
      }
    } else {
      this.errors.push('Build directory does not exist');
      log.error('Build directory does not exist. Run npm run build first.');
    }
  }

  // Check for environment variables
  checkEnvironmentVariables() {
    log.header('Checking Environment Variables');
    
    const requiredEnvVars = [
      'REACT_APP_API_URL',
      'REACT_APP_GA_TRACKING_ID',
      'REACT_APP_FB_PIXEL_ID'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      this.warnings.push(`Missing environment variables: ${missingVars.join(', ')}`);
      log.warning(`Missing environment variables: ${missingVars.join(', ')}`);
    } else {
      log.success('All required environment variables are set');
    }
  }

  // Check package.json for security vulnerabilities
  checkSecurityVulnerabilities() {
    log.header('Checking Security Vulnerabilities');
    
    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.metadata.vulnerabilities.total === 0) {
        log.success('No security vulnerabilities found');
      } else {
        const { high, critical } = audit.metadata.vulnerabilities;
        if (critical > 0) {
          this.errors.push(`${critical} critical vulnerabilities found`);
          log.error(`${critical} critical vulnerabilities found`);
        }
        if (high > 0) {
          this.warnings.push(`${high} high vulnerabilities found`);
          log.warning(`${high} high vulnerabilities found`);
        }
        log.info(`Run 'npm audit' for details`);
      }
    } catch (error) {
      log.warning('Could not run security audit');
    }
  }

  // Check for console.log statements in production build
  checkConsoleStatements() {
    log.header('Checking for Console Statements');
    
    const buildPath = path.join(process.cwd(), 'build', 'static', 'js');
    
    if (fs.existsSync(buildPath)) {
      const jsFiles = fs.readdirSync(buildPath).filter(f => f.endsWith('.js'));
      let consoleCount = 0;
      
      jsFiles.forEach(file => {
        const content = fs.readFileSync(path.join(buildPath, file), 'utf8');
        const matches = content.match(/console\.(log|error|warn|info)/g);
        if (matches) {
          consoleCount += matches.length;
        }
      });
      
      if (consoleCount > 0) {
        this.warnings.push(`Found ${consoleCount} console statements in production build`);
        log.warning(`Found ${consoleCount} console statements in production build`);
      } else {
        log.success('No console statements found in production build');
      }
    }
  }

  // Check if tests pass
  checkTests() {
    log.header('Running Tests');
    
    try {
      execSync('npm test -- --watchAll=false --passWithNoTests', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      log.success('All tests passed');
    } catch (error) {
      this.errors.push('Tests failed');
      log.error('Tests failed. Run npm test for details.');
    }
  }

  // Check build performance metrics
  checkBuildPerformance() {
    log.header('Checking Build Performance');
    
    const buildPath = path.join(process.cwd(), 'build', 'static');
    
    if (fs.existsSync(buildPath)) {
      // Check main bundle size
      const jsPath = path.join(buildPath, 'js');
      const mainBundle = fs.readdirSync(jsPath).find(f => f.startsWith('main.'));
      
      if (mainBundle) {
        const size = fs.statSync(path.join(jsPath, mainBundle)).size;
        const sizeKB = (size / 1024).toFixed(2);
        
        if (sizeKB > 500) {
          this.warnings.push(`Main bundle is large: ${sizeKB}KB`);
          log.warning(`Main bundle is large: ${sizeKB}KB (consider code splitting)`);
        } else {
          log.success(`Main bundle size: ${sizeKB}KB`);
        }
      }
      
      // Check for source maps
      const sourceMaps = fs.readdirSync(jsPath).filter(f => f.endsWith('.map'));
      if (sourceMaps.length > 0) {
        this.warnings.push('Source maps found in production build');
        log.warning('Source maps found. Consider disabling for production.');
      } else {
        log.success('No source maps in production build');
      }
    }
  }

  // Check critical functionality
  checkCriticalFunctionality() {
    log.header('Checking Critical Functionality');
    
    const criticalFiles = [
      'src/App.js',
      'src/AdminDashboard.js',
      'src/components/pages/Overview.jsx',
      'src/components/pages/Application.jsx',
      'src/components/pages/Confirmation.jsx'
    ];
    
    const missingFiles = criticalFiles.filter(file => !fs.existsSync(path.join(process.cwd(), file)));
    
    if (missingFiles.length > 0) {
      this.errors.push(`Critical files missing: ${missingFiles.join(', ')}`);
      log.error(`Critical files missing: ${missingFiles.join(', ')}`);
    } else {
      log.success('All critical files present');
    }
  }

  // Helper function to get directory size
  getDirectorySize(dir) {
    let size = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        size += this.getDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    });
    
    return size;
  }

  // Run all checks
  async runAllChecks() {
    console.log(`${colors.bright}🚀 Deployment Verification Starting...${colors.reset}\n`);
    
    this.checkBuildDirectory();
    this.checkEnvironmentVariables();
    this.checkSecurityVulnerabilities();
    this.checkConsoleStatements();
    this.checkTests();
    this.checkBuildPerformance();
    this.checkCriticalFunctionality();
    
    // Summary
    log.header('Verification Summary');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      log.success('✨ All checks passed! Ready for deployment.');
      process.exit(0);
    } else {
      if (this.errors.length > 0) {
        console.log(`\n${colors.red}Errors (${this.errors.length}):${colors.reset}`);
        this.errors.forEach(err => log.error(err));
      }
      
      if (this.warnings.length > 0) {
        console.log(`\n${colors.yellow}Warnings (${this.warnings.length}):${colors.reset}`);
        this.warnings.forEach(warn => log.warning(warn));
      }
      
      if (this.errors.length > 0) {
        console.log(`\n${colors.red}❌ Deployment blocked due to errors.${colors.reset}`);
        process.exit(1);
      } else {
        console.log(`\n${colors.yellow}⚠ Deployment possible but review warnings.${colors.reset}`);
        process.exit(0);
      }
    }
  }
}

// Run verifier
const verifier = new DeploymentVerifier();
verifier.runAllChecks();