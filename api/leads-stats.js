import { MongoClient } from 'mongodb';
import { setCorsHeaders, setSecurityHeaders } from './lib/middleware.js';
import { Cache } from './lib/cache.js';

const MONGODB_URI = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // Set secure CORS and security headers
  setCorsHeaders(res, req);
  setSecurityHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check cache first
    const cachedStats = Cache.getLeadStats();
    if (cachedStats) {
      console.log('📊 Returning cached lead statistics');
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
      return res.status(200).json(cachedStats);
    }

    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const collection = db.collection('leads');
    
    console.log('📊 Fetching fresh lead statistics...');
    
    // Optimized: Run parallel queries instead of $facet for better performance
    console.log('📊 Running optimized parallel aggregation queries...');
    
    const startTime = Date.now();
    
    // Run all queries in parallel for better performance
    const [
      totalApplications,
      statusCounts,
      qualifiedCounts,
      referralCounts,
      stateDistribution,
      referralSources,
      avgMonthlyPayout,
      recentApplications
    ] = await Promise.all([
      // Total count
      collection.countDocuments({}),
      
      // Status breakdown
      collection.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Qualified breakdown
      collection.aggregate([
        { $group: { _id: '$qualified', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Referral count (optimized query)
      collection.countDocuments({ 
        referralCode: { $ne: null, $ne: '', $exists: true } 
      }),
      
      // Top states
      collection.aggregate([
        { $group: { _id: '$state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Referral sources
      collection.aggregate([
        { $match: { referralSource: { $ne: null, $ne: '', $exists: true } } },
        { $group: { _id: '$referralSource', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Average monthly payout
      collection.aggregate([
        { $match: { monthlyEarnings: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$monthlyEarnings' }, count: { $sum: 1 } } }
      ]).toArray(),
      
      // Recent applications (only fetch needed fields)
      collection.find({}, {
        projection: { 
          name: 1, 
          email: 1, 
          state: 1, 
          city: 1, 
          status: 1, 
          createdAt: 1,
          qualified: 1,
          referralCode: 1
        }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
    ]);
    
    const queryTime = Date.now() - startTime;
    console.log(`⚡ Parallel aggregation completed in ${queryTime}ms`);
    
    // Format results to match expected structure
    const stats = [{
      totalApplications: [{ count: totalApplications }],
      statusCounts: statusCounts,
      qualifiedCounts: qualifiedCounts,
      referralCounts: [{ count: referralCounts }],
      stateDistribution: stateDistribution,
      referralSources: referralSources,
      avgMonthlyPayout: avgMonthlyPayout,
      recentApplications: recentApplications
    }];
    
    // Format the stats
    const result = stats[0];
    const formattedStats = {
      totalApplications: result.totalApplications[0]?.count || 0,
      statusBreakdown: Object.fromEntries(
        result.statusCounts.map(s => [s._id, s.count])
      ),
      qualifiedCount: result.qualifiedCounts.find(q => q._id === true)?.count || 0,
      notQualifiedCount: result.qualifiedCounts.find(q => q._id === false)?.count || 0,
      totalReferrals: result.referralCounts[0]?.count || 0,
      topStates: result.stateDistribution,
      referralSources: result.referralSources,
      avgMonthlyPayout: result.avgMonthlyPayout[0]?.avg || 0,
      recentApplications: result.recentApplications
    };
    
    // Cache the results
    Cache.setLeadStats(formattedStats);
    
    console.log(`📊 Returning fresh stats for ${formattedStats.totalApplications} applications (cached for 5min)`);
    
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    return res.status(200).json(formattedStats);
    
  } catch (error) {
    console.error('Error fetching lead statistics:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
}