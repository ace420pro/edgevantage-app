// Database Performance Test Script
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const { User, Lead } = require('./models');
const Admin = require('./models/Admin');

async function runPerformanceTests() {
  console.log('🧪 Starting Database Performance Tests...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edgevantage', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}\n`);

    // Test 1: Health Check
    console.log('🔍 Test 1: Database Health Check');
    const dbState = mongoose.connection.readyState;
    const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState];
    console.log(`   Database Status: ${dbStatus}`);
    console.log(`   Connection Pool Size: ${mongoose.connection.db.serverConfig?.s?.pool?.totalConnectionCount || 'N/A'}`);

    // Test 2: Model Counts
    console.log('\n📈 Test 2: Collection Statistics');
    const userCount = await User.countDocuments();
    const leadCount = await Lead.countDocuments();
    const adminCount = await Admin.countDocuments();

    console.log(`   Users: ${userCount}`);
    console.log(`   Leads: ${leadCount}`);
    console.log(`   Admins: ${adminCount}`);

    // Test 3: Index Performance
    console.log('\n⚡ Test 3: Index Performance Test');
    const startTime = Date.now();

    // Test email query (should use index)
    const testLead = await Lead.findOne({ email: /.*@.*/ });
    const emailQueryTime = Date.now() - startTime;

    console.log(`   Email query time: ${emailQueryTime}ms`);
    console.log(`   Sample lead found: ${testLead ? 'Yes' : 'No'}`);

    // Test 4: Aggregation Performance
    console.log('\n📊 Test 4: Aggregation Performance');
    const aggStartTime = Date.now();

    const stats = await Lead.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          qualified: {
            $sum: { $cond: [{ $eq: ['$qualified', true] }, 1, 0] }
          },
          avgCreatedTime: { $avg: { $subtract: [new Date(), '$createdAt'] } }
        }
      }
    ]);

    const aggTime = Date.now() - aggStartTime;
    console.log(`   Aggregation time: ${aggTime}ms`);
    console.log(`   Results: ${JSON.stringify(stats[0], null, 2)}`);

    // Test 5: Memory Usage
    console.log('\n💾 Test 5: Memory Usage');
    const memUsage = process.memoryUsage();
    console.log(`   RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
    console.log(`   Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
    console.log(`   Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);

    // Test 6: Connection Pool
    console.log('\n🔗 Test 6: Connection Pool Health');
    console.log(`   Ready State: ${mongoose.connection.readyState}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    console.log(`   Name: ${mongoose.connection.name}`);

    // Test 7: Performance Recommendations
    console.log('\n💡 Test 7: Performance Recommendations');

    if (emailQueryTime > 100) {
      console.log('   ⚠️  Email queries are slow. Consider adding compound indexes.');
    } else {
      console.log('   ✅ Email query performance is good.');
    }

    if (aggTime > 500) {
      console.log('   ⚠️  Aggregation queries are slow. Consider optimizing pipelines.');
    } else {
      console.log('   ✅ Aggregation performance is good.');
    }

    if (memUsage.heapUsed > 512 * 1024 * 1024) {
      console.log('   ⚠️  High memory usage detected. Monitor for memory leaks.');
    } else {
      console.log('   ✅ Memory usage is within normal range.');
    }

    // Test 8: Critical Query Tests
    console.log('\n🔍 Test 8: Critical Query Performance');

    // Test qualified leads query
    const qualifiedStartTime = Date.now();
    const qualifiedLeads = await Lead.find({ qualified: true }).limit(10);
    const qualifiedQueryTime = Date.now() - qualifiedStartTime;
    console.log(`   Qualified leads query: ${qualifiedQueryTime}ms (${qualifiedLeads.length} results)`);

    // Test recent leads query
    const recentStartTime = Date.now();
    const recentLeads = await Lead.find().sort({ createdAt: -1 }).limit(10);
    const recentQueryTime = Date.now() - recentStartTime;
    console.log(`   Recent leads query: ${recentQueryTime}ms (${recentLeads.length} results)`);

    console.log('\n✅ All database performance tests completed successfully!');

  } catch (error) {
    console.error('❌ Database performance test failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  runPerformanceTests()
    .then(() => {
      console.log('\n🎉 Performance test suite completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Performance test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runPerformanceTests };