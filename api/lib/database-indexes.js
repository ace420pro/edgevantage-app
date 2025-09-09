// Database indexing for performance optimization
import { connectToDatabase } from './database.js';

// Define indexes for all collections
const INDEXES = {
  users: [
    // Basic indexes
    { key: { email: 1 }, options: { unique: true, background: true } },
    { key: { createdAt: -1 }, options: { background: true } },
    
    // Compound indexes for common queries
    { key: { email: 1, emailVerified: 1 }, options: { background: true } },
    { key: { emailVerificationToken: 1, emailVerificationExpires: 1 }, options: { background: true, sparse: true } },
    { key: { passwordResetToken: 1, passwordResetExpires: 1 }, options: { background: true, sparse: true } },
    
    // Performance indexes
    { key: { updatedAt: -1 }, options: { background: true } },
    { key: { role: 1, createdAt: -1 }, options: { background: true } }
  ],
  
  leads: [
    // Basic indexes
    { key: { email: 1 }, options: { background: true } },
    { key: { createdAt: -1 }, options: { background: true } },
    { key: { status: 1 }, options: { background: true } },
    
    // Compound indexes for dashboard queries
    { key: { status: 1, createdAt: -1 }, options: { background: true } },
    { key: { qualified: 1, status: 1 }, options: { background: true } },
    { key: { email: 1, status: 1 }, options: { background: true } },
    
    // Geographic and referral indexes
    { key: { state: 1, city: 1 }, options: { background: true } },
    { key: { referralCode: 1 }, options: { background: true, sparse: true } },
    { key: { referralSource: 1, createdAt: -1 }, options: { background: true } },
    
    // Analytics indexes
    { key: { sessionId: 1 }, options: { background: true } },
    { key: { utmSource: 1, utmCampaign: 1, utmMedium: 1 }, options: { background: true, sparse: true } },
    
    // Admin dashboard indexes
    { key: { monthlyEarnings: -1 }, options: { background: true, sparse: true } },
    { key: { equipmentShipped: 1, status: 1 }, options: { background: true } }
  ],
  
  affiliates: [
    // Basic indexes
    { key: { email: 1 }, options: { unique: true, background: true } },
    { key: { affiliateCode: 1 }, options: { unique: true, background: true } },
    { key: { createdAt: -1 }, options: { background: true } },
    
    // Performance indexes
    { key: { status: 1, createdAt: -1 }, options: { background: true } },
    { key: { totalCommissions: -1 }, options: { background: true } },
    { key: { referralCount: -1 }, options: { background: true } }
  ],
  
  shipments: [
    // Basic indexes
    { key: { leadId: 1 }, options: { background: true } },
    { key: { trackingNumber: 1 }, options: { unique: true, sparse: true, background: true } },
    { key: { createdAt: -1 }, options: { background: true } },
    
    // Status and delivery indexes
    { key: { status: 1, estimatedDelivery: 1 }, options: { background: true } },
    { key: { carrier: 1, status: 1 }, options: { background: true } }
  ],
  
  appointments: [
    // Basic indexes
    { key: { leadId: 1 }, options: { background: true } },
    { key: { scheduledDate: 1 }, options: { background: true } },
    { key: { createdAt: -1 }, options: { background: true } },
    
    // Status and type indexes
    { key: { status: 1, scheduledDate: 1 }, options: { background: true } },
    { key: { type: 1, status: 1 }, options: { background: true } }
  ],
  
  earnings: [
    // Basic indexes
    { key: { leadId: 1 }, options: { background: true } },
    { key: { month: -1 }, options: { background: true } },
    { key: { amount: -1 }, options: { background: true } },
    
    // Compound indexes for analytics
    { key: { leadId: 1, month: -1 }, options: { background: true } },
    { key: { month: -1, amount: -1 }, options: { background: true } }
  ]
};

// Create all indexes
export async function createDatabaseIndexes() {
  console.log('🔧 Creating database indexes for performance optimization...');
  
  try {
    const { db } = await connectToDatabase();
    const results = {};
    
    for (const [collectionName, indexes] of Object.entries(INDEXES)) {
      console.log(`📊 Creating indexes for ${collectionName} collection...`);
      const collection = db.collection(collectionName);
      const collectionResults = [];
      
      for (const indexDef of indexes) {
        try {
          const result = await collection.createIndex(indexDef.key, indexDef.options || {});
          collectionResults.push({
            index: indexDef.key,
            result: result,
            status: 'created'
          });
          console.log(`  ✅ Created index: ${JSON.stringify(indexDef.key)}`);
        } catch (error) {
          if (error.code === 85) {
            // Index already exists
            collectionResults.push({
              index: indexDef.key,
              result: 'already_exists',
              status: 'exists'
            });
            console.log(`  ℹ️ Index already exists: ${JSON.stringify(indexDef.key)}`);
          } else {
            console.error(`  ❌ Failed to create index ${JSON.stringify(indexDef.key)}:`, error.message);
            collectionResults.push({
              index: indexDef.key,
              error: error.message,
              status: 'failed'
            });
          }
        }
      }
      
      results[collectionName] = collectionResults;
    }
    
    console.log('✅ Database indexing completed successfully');
    return results;
    
  } catch (error) {
    console.error('❌ Failed to create database indexes:', error);
    throw error;
  }
}

// Get current indexes for a collection
export async function getCollectionIndexes(collectionName) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(collectionName);
    const indexes = await collection.listIndexes().toArray();
    
    return indexes.map(index => ({
      name: index.name,
      key: index.key,
      unique: index.unique || false,
      sparse: index.sparse || false,
      background: index.background || false
    }));
    
  } catch (error) {
    console.error(`Failed to get indexes for ${collectionName}:`, error);
    throw error;
  }
}

// Get indexes for all collections
export async function getAllIndexes() {
  const results = {};
  
  for (const collectionName of Object.keys(INDEXES)) {
    try {
      results[collectionName] = await getCollectionIndexes(collectionName);
    } catch (error) {
      results[collectionName] = { error: error.message };
    }
  }
  
  return results;
}

// Analyze index usage (requires MongoDB 3.2+)
export async function analyzeIndexUsage(collectionName, sampleSize = 1000) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(collectionName);
    
    // Get index stats
    const indexStats = await collection.aggregate([
      { $indexStats: {} }
    ]).toArray();
    
    // Get collection stats
    const collectionStats = await collection.stats();
    
    return {
      collection: collectionName,
      totalDocuments: collectionStats.count,
      totalIndexes: indexStats.length,
      indexUsage: indexStats.map(stat => ({
        name: stat.name,
        operations: stat.accesses.ops,
        since: stat.accesses.since
      })),
      recommendation: generateIndexRecommendations(indexStats, collectionStats)
    };
    
  } catch (error) {
    console.error(`Failed to analyze index usage for ${collectionName}:`, error);
    throw error;
  }
}

function generateIndexRecommendations(indexStats, collectionStats) {
  const recommendations = [];
  
  // Check for unused indexes
  const unusedIndexes = indexStats.filter(stat => 
    stat.name !== '_id_' && stat.accesses.ops === 0
  );
  
  if (unusedIndexes.length > 0) {
    recommendations.push({
      type: 'unused_indexes',
      message: `Consider removing unused indexes: ${unusedIndexes.map(i => i.name).join(', ')}`
    });
  }
  
  // Check index to document ratio
  const indexRatio = indexStats.length / collectionStats.count;
  if (indexRatio > 0.1) {
    recommendations.push({
      type: 'too_many_indexes',
      message: 'High index-to-document ratio may impact write performance'
    });
  }
  
  return recommendations;
}

export default {
  createDatabaseIndexes,
  getCollectionIndexes,
  getAllIndexes,
  analyzeIndexUsage
};