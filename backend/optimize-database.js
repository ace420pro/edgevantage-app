// Database Optimization Script
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const { User, Lead } = require('./models');
const Admin = require('./models/Admin');

class DatabaseOptimizer {
  constructor() {
    this.results = {
      indexesCreated: 0,
      indexesAlreadyExist: 0,
      optimizationsApplied: 0,
      warnings: [],
      errors: []
    };
  }

  log(level, message, details = null) {
    const timestamp = new Date().toISOString();
    const emoji = level === 'info' ? 'ℹ️' : level === 'success' ? '✅' : level === 'warning' ? '⚠️' : '❌';

    console.log(`${emoji} [${timestamp}] ${message}`);

    if (details) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }

    if (level === 'warning') {
      this.results.warnings.push({ message, details, timestamp });
    } else if (level === 'error') {
      this.results.errors.push({ message, details, timestamp });
    }
  }

  async checkIndexes(model, modelName) {
    try {
      this.log('info', `Checking indexes for ${modelName}...`);

      const indexes = await model.collection.getIndexes();
      const indexNames = Object.keys(indexes);

      this.log('success', `${modelName} has ${indexNames.length} indexes`, indexNames);

      // Check for recommended indexes
      const recommendations = this.getIndexRecommendations(modelName);

      for (const rec of recommendations) {
        const exists = indexNames.some(name =>
          name.includes(rec.field) || indexes[name] && JSON.stringify(indexes[name]).includes(rec.field)
        );

        if (!exists) {
          this.log('warning', `Missing recommended index for ${modelName}: ${rec.field}`, rec);
        }
      }

      return indexes;
    } catch (error) {
      this.log('error', `Failed to check indexes for ${modelName}`, error.message);
      return {};
    }
  }

  getIndexRecommendations(modelName) {
    const recommendations = {
      User: [
        { field: 'email', type: 'single', reason: 'Login queries' },
        { field: 'status', type: 'single', reason: 'Active user filtering' },
        { field: 'emailVerificationToken', type: 'single', reason: 'Email verification' },
        { field: 'passwordResetToken', type: 'single', reason: 'Password reset' }
      ],
      Lead: [
        { field: 'email', type: 'single', reason: 'Duplicate prevention' },
        { field: 'phone', type: 'single', reason: 'Contact lookup' },
        { field: 'status', type: 'single', reason: 'Status filtering' },
        { field: 'qualified', type: 'single', reason: 'Qualification queries' },
        { field: 'createdAt', type: 'single', reason: 'Date sorting' },
        { field: 'state', type: 'single', reason: 'Geographic filtering' },
        { field: 'referralCode', type: 'single', reason: 'Referral tracking' },
        { field: '{ status: 1, qualified: 1 }', type: 'compound', reason: 'Admin dashboard queries' },
        { field: '{ createdAt: -1, status: 1 }', type: 'compound', reason: 'Recent qualified leads' }
      ],
      Admin: [
        { field: 'username', type: 'single', reason: 'Login queries' },
        { field: 'email', type: 'single', reason: 'Account lookup' },
        { field: 'isActive', type: 'single', reason: 'Active admin filtering' }
      ]
    };

    return recommendations[modelName] || [];
  }

  async createOptimalIndexes() {
    this.log('info', 'Creating optimal indexes...');

    try {
      // Lead model indexes
      await this.createIndexIfNotExists(Lead, { email: 1 }, { unique: true });
      await this.createIndexIfNotExists(Lead, { phone: 1 });
      await this.createIndexIfNotExists(Lead, { status: 1 });
      await this.createIndexIfNotExists(Lead, { qualified: 1 });
      await this.createIndexIfNotExists(Lead, { createdAt: -1 });
      await this.createIndexIfNotExists(Lead, { state: 1 });
      await this.createIndexIfNotExists(Lead, { referralCode: 1 });

      // Compound indexes for complex queries
      await this.createIndexIfNotExists(Lead, { status: 1, qualified: 1 });
      await this.createIndexIfNotExists(Lead, { createdAt: -1, status: 1 });
      await this.createIndexIfNotExists(Lead, { qualified: 1, createdAt: -1 });

      // User model indexes
      await this.createIndexIfNotExists(User, { email: 1 }, { unique: true });
      await this.createIndexIfNotExists(User, { status: 1 });
      await this.createIndexIfNotExists(User, { emailVerificationToken: 1 });
      await this.createIndexIfNotExists(User, { passwordResetToken: 1 });
      await this.createIndexIfNotExists(User, { createdAt: -1 });

      // Admin model indexes
      await this.createIndexIfNotExists(Admin, { username: 1 }, { unique: true });
      await this.createIndexIfNotExists(Admin, { email: 1 }, { unique: true });
      await this.createIndexIfNotExists(Admin, { isActive: 1 });

      this.log('success', `Created ${this.results.indexesCreated} new indexes`);

    } catch (error) {
      this.log('error', 'Failed to create optimal indexes', error.message);
    }
  }

  async createIndexIfNotExists(model, indexSpec, options = {}) {
    try {
      const indexName = Object.keys(indexSpec).join('_');

      // Check if index already exists
      const indexes = await model.collection.getIndexes();
      const existingIndex = Object.keys(indexes).find(name =>
        name.includes(indexName) || JSON.stringify(indexes[name]).includes(JSON.stringify(indexSpec))
      );

      if (existingIndex) {
        this.results.indexesAlreadyExist++;
        return;
      }

      await model.collection.createIndex(indexSpec, options);
      this.results.indexesCreated++;
      this.log('success', `Created index: ${JSON.stringify(indexSpec)}`);

    } catch (error) {
      if (error.code === 11000 || error.message.includes('already exists')) {
        this.results.indexesAlreadyExist++;
      } else {
        this.log('error', `Failed to create index ${JSON.stringify(indexSpec)}`, error.message);
      }
    }
  }

  async analyzeQueryPatterns() {
    this.log('info', 'Analyzing query patterns...');

    try {
      // Check for slow operations (requires profiling to be enabled)
      const db = mongoose.connection.db;

      // Get database stats
      const stats = await db.stats();
      this.log('info', 'Database statistics', {
        collections: stats.collections,
        objects: stats.objects,
        avgObjSize: Math.round(stats.avgObjSize),
        dataSize: Math.round(stats.dataSize / 1024 / 1024) + 'MB',
        storageSize: Math.round(stats.storageSize / 1024 / 1024) + 'MB',
        indexes: stats.indexes,
        indexSize: Math.round(stats.indexSize / 1024 / 1024) + 'MB'
      });

      // Check collection stats
      const collections = ['users', 'leads', 'admins'];
      for (const collName of collections) {
        try {
          const collStats = await db.collection(collName).stats();
          this.log('info', `${collName} collection stats`, {
            count: collStats.count,
            size: Math.round(collStats.size / 1024) + 'KB',
            avgObjSize: Math.round(collStats.avgObjSize),
            storageSize: Math.round(collStats.storageSize / 1024) + 'KB',
            totalIndexSize: Math.round(collStats.totalIndexSize / 1024) + 'KB'
          });
        } catch (error) {
          this.log('warning', `Could not get stats for ${collName}`, error.message);
        }
      }

    } catch (error) {
      this.log('error', 'Failed to analyze query patterns', error.message);
    }
  }

  async optimizeConfiguration() {
    this.log('info', 'Optimizing database configuration...');

    try {
      // Check current connection settings
      const db = mongoose.connection.db;

      // Get server status
      const serverStatus = await db.admin().serverStatus();

      this.log('info', 'MongoDB server info', {
        version: serverStatus.version,
        uptime: Math.round(serverStatus.uptime / 3600) + ' hours',
        connections: serverStatus.connections,
        memory: {
          resident: Math.round(serverStatus.mem.resident) + 'MB',
          virtual: Math.round(serverStatus.mem.virtual) + 'MB',
          mapped: Math.round(serverStatus.mem.mapped || 0) + 'MB'
        }
      });

      // Performance recommendations
      const recommendations = [];

      if (serverStatus.connections.current > 100) {
        recommendations.push('Consider increasing connection pool size');
      }

      if (serverStatus.mem.resident > 1000) {
        recommendations.push('Monitor memory usage - consider adding more RAM');
      }

      if (recommendations.length > 0) {
        this.log('warning', 'Performance recommendations', recommendations);
      } else {
        this.log('success', 'Database configuration looks optimal');
      }

      this.results.optimizationsApplied++;

    } catch (error) {
      this.log('error', 'Failed to optimize configuration', error.message);
    }
  }

  async checkDataIntegrity() {
    this.log('info', 'Checking data integrity...');

    try {
      // Check for duplicate emails in leads
      const duplicateLeads = await Lead.aggregate([
        { $group: { _id: '$email', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ]);

      if (duplicateLeads.length > 0) {
        this.log('warning', `Found ${duplicateLeads.length} duplicate lead emails`,
          duplicateLeads.slice(0, 5));
      }

      // Check for orphaned references
      const leadsWithUsers = await Lead.find({ userId: { $exists: true } });
      let orphanedLeads = 0;

      for (const lead of leadsWithUsers) {
        const user = await User.findById(lead.userId);
        if (!user) {
          orphanedLeads++;
        }
      }

      if (orphanedLeads > 0) {
        this.log('warning', `Found ${orphanedLeads} leads with non-existent user references`);
      }

      // Check for incomplete data
      const incompleteLeads = await Lead.countDocuments({
        $or: [
          { name: { $exists: false } },
          { email: { $exists: false } },
          { phone: { $exists: false } }
        ]
      });

      if (incompleteLeads > 0) {
        this.log('warning', `Found ${incompleteLeads} leads with missing required fields`);
      }

      if (duplicateLeads.length === 0 && orphanedLeads === 0 && incompleteLeads === 0) {
        this.log('success', 'Data integrity check passed');
      }

    } catch (error) {
      this.log('error', 'Failed to check data integrity', error.message);
    }
  }

  async runOptimization() {
    console.log('🚀 Starting Database Optimization...\n');

    try {
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edgevantage', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000
      });

      this.log('success', 'Connected to MongoDB');

      // Run optimization steps
      await this.checkIndexes(User, 'User');
      await this.checkIndexes(Lead, 'Lead');
      await this.checkIndexes(Admin, 'Admin');

      await this.createOptimalIndexes();
      await this.analyzeQueryPatterns();
      await this.optimizeConfiguration();
      await this.checkDataIntegrity();

      // Summary
      console.log('\n📊 Optimization Summary:');
      console.log(`✅ Indexes created: ${this.results.indexesCreated}`);
      console.log(`ℹ️  Indexes already exist: ${this.results.indexesAlreadyExist}`);
      console.log(`🔧 Optimizations applied: ${this.results.optimizationsApplied}`);
      console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
      console.log(`❌ Errors: ${this.results.errors.length}`);

      if (this.results.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        this.results.warnings.forEach((w, i) =>
          console.log(`   ${i + 1}. ${w.message}`)
        );
      }

      if (this.results.errors.length > 0) {
        console.log('\n❌ Errors:');
        this.results.errors.forEach((e, i) =>
          console.log(`   ${i + 1}. ${e.message}`)
        );
      }

      console.log('\n✅ Database optimization completed!');

    } catch (error) {
      this.log('error', 'Database optimization failed', error.message);
      throw error;
    } finally {
      await mongoose.connection.close();
      this.log('info', 'Database connection closed');
    }

    return this.results;
  }
}

// Main execution
async function main() {
  try {
    const optimizer = new DatabaseOptimizer();
    const results = await optimizer.runOptimization();

    if (results.errors.length > 0) {
      console.log('\n⚠️  Optimization completed with errors. Please review.');
      process.exit(1);
    } else {
      console.log('\n🎉 Database optimization successful!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n💥 Optimization failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DatabaseOptimizer };