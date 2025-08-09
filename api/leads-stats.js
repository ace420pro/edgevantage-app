const mongoose = require('mongoose');

// MongoDB connection with retry logic
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB connected for leads-stats API');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Lead Schema
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  hasResidence: { type: String, required: true },
  hasInternet: { type: String, required: true },
  hasSpace: { type: String, required: true },
  referralSource: String,
  referralCode: String,
  agreeToTerms: { type: Boolean, default: true },
  sessionId: String,
  ipAddress: String,
  userAgent: String,
  utmSource: String,
  utmCampaign: String,
  utmMedium: String,
  status: { type: String, enum: ['new', 'pending', 'contacted', 'approved', 'rejected'], default: 'new' },
  qualified: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  monthlyEarnings: { type: Number, default: 0 },
  equipmentShipped: { type: Boolean, default: false }
});

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    console.log('📊 Fetching lead statistics...');
    const stats = await Lead.aggregate([
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
            { $match: { referralCode: { $ne: '' } } },
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
    ]);
    
    // Format the stats
    const formattedStats = {
      totalApplications: stats[0].totalApplications[0]?.count || 0,
      statusBreakdown: Object.fromEntries(
        stats[0].statusCounts.map(s => [s._id, s.count])
      ),
      qualifiedCount: stats[0].qualifiedCounts.find(q => q._id === true)?.count || 0,
      notQualifiedCount: stats[0].qualifiedCounts.find(q => q._id === false)?.count || 0,
      totalReferrals: stats[0].referralCounts[0]?.count || 0,
      topStates: stats[0].stateDistribution,
      referralSources: stats[0].referralSources,
      avgMonthlyPayout: stats[0].avgMonthlyPayout[0]?.avg || 0,
      recentApplications: stats[0].recentApplications
    };
    
    console.log('📊 Returning formatted stats for', formattedStats.totalApplications, 'applications');
    res.status(200).json(formattedStats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}