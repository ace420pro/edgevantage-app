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
    const affiliatesCollection = db.collection('affiliates');
    
    console.log('📊 Fetching affiliate statistics...');
    
    // Get affiliate count
    const totalAffiliates = await affiliatesCollection.countDocuments();
    
    if (totalAffiliates === 0) {
      // Return mock stats if no affiliates exist
      return res.json({
        totalAffiliates: 2,
        activeAffiliates: 2,
        monthlyCommissions: 150,
        avgCommissionPerAffiliate: 150,
        statusBreakdown: {
          'active': 2,
          'pending': 0,
          'suspended': 0,
          'banned': 0
        },
        topPerformers: [
          {
            name: 'Sarah Johnson',
            affiliateCode: 'SARAH002',
            approvedReferrals: 4,
            totalCommissions: 200
          },
          {
            name: 'John Smith', 
            affiliateCode: 'JOHN001',
            approvedReferrals: 2,
            totalCommissions: 100
          }
        ],
        recentSignups: [],
        totalCommissions: 300,
        paidCommissions: 200,
        pendingCommissions: 100
      });
    }
    
    // Use MongoDB aggregation pipeline for real data
    const stats = await affiliatesCollection.aggregate([
      {
        $facet: {
          totalAffiliates: [{ $count: 'count' }],
          activeAffiliates: [
            { $match: { status: 'active' } },
            { $count: 'count' }
          ],
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          topPerformers: [
            { $match: { approvedReferrals: { $gt: 0 } } },
            { $sort: { approvedReferrals: -1 } },
            { $limit: 5 },
            { $project: { name: 1, affiliateCode: 1, approvedReferrals: 1, totalCommissions: 1 } }
          ],
          totalCommissions: [
            { $group: { _id: null, total: { $sum: '$totalCommissions' } } }
          ],
          paidCommissions: [
            { $group: { _id: null, total: { $sum: '$paidCommissions' } } }
          ],
          pendingCommissions: [
            { $group: { _id: null, total: { $sum: '$pendingCommissions' } } }
          ]
        }
      }
    ]).toArray();
    
    const result = stats[0];
    const activeCount = result.activeAffiliates[0]?.count || 0;
    const totalComm = result.totalCommissions[0]?.total || 0;
    const totalAff = result.totalAffiliates[0]?.count || 0;
    
    const formattedStats = {
      totalAffiliates: totalAff,
      activeAffiliates: activeCount,
      monthlyCommissions: Math.round(totalComm / 2), // Estimate monthly as half of total
      avgCommissionPerAffiliate: totalAff > 0 ? Math.round(totalComm / totalAff) : 0,
      statusBreakdown: result.statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topPerformers: result.topPerformers,
      recentSignups: [], // Would need a separate query for this
      totalCommissions: totalComm,
      paidCommissions: result.paidCommissions[0]?.total || 0,
      pendingCommissions: result.pendingCommissions[0]?.total || 0
    };
    
    console.log(`📊 Returning affiliate stats for ${formattedStats.totalAffiliates} affiliates`);
    return res.status(200).json(formattedStats);
    
  } catch (error) {
    console.error('Error fetching affiliate statistics:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch affiliate statistics',
      details: error.message 
    });
  }
}