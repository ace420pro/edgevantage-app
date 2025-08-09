import { MongoClient } from 'mongodb';

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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const collection = db.collection('leads');
    
    console.log('📊 Fetching lead statistics...');
    
    // Use MongoDB aggregation pipeline with native driver
    const stats = await collection.aggregate([
      {
        $facet: {
          totalApplications: [{ $count: 'count' }],
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          qualifiedCounts: [
            { $group: { _id: '$qualified', count: { $sum: 1 } } }
          ],
          referralCounts: [
            { $match: { referralCode: { $ne: '', $exists: true } } },
            { $count: 'count' }
          ],
          stateDistribution: [
            { $group: { _id: '$state', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          referralSources: [
            { $group: { _id: '$referralSource', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          avgMonthlyPayout: [
            { $match: { monthlyEarnings: { $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: '$monthlyEarnings' } } }
          ],
          recentApplications: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            { $project: { 
              name: 1, 
              email: 1, 
              state: 1, 
              city: 1, 
              status: 1, 
              createdAt: 1,
              qualified: 1,
              referralCode: 1
            }}
          ]
        }
      }
    ]).toArray();
    
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
    
    console.log(`📊 Returning stats for ${formattedStats.totalApplications} applications`);
    return res.status(200).json(formattedStats);
    
  } catch (error) {
    console.error('Error fetching lead statistics:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
}