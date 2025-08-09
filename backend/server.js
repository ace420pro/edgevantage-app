// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://www.edgevantagepro.com',
  'https://edgevantagepro.com',
  'https://edgevantage-app.vercel.app', // Your Vercel app URL
  process.env.FRONTEND_URL // Allow custom frontend URL from env
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edgevantage', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Lead Schema
const leadSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  
  // Qualification Questions
  hasResidence: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  hasInternet: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  hasSpace: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  
  // Referral Information
  referralSource: {
    type: String,
    required: true
  },
  referralCode: {
    type: String,
    default: ''
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'contacted'],
    default: 'pending'
  },
  qualified: {
    type: Boolean,
    default: false
  },
  
  // Analytics Data
  sessionId: String,
  ipAddress: String,
  userAgent: String,
  utmSource: String,
  utmCampaign: String,
  utmMedium: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Admin Notes
  notes: {
    type: String,
    default: ''
  },
  monthlyEarnings: {
    type: Number,
    default: 0
  },
  equipmentShipped: {
    type: Boolean,
    default: false
  },
  equipmentShippedDate: Date,
  firstPaymentDate: Date
});

// Add indexes for better query performance
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ referralCode: 1 });

const Lead = mongoose.model('Lead', leadSchema);

// Affiliate Schema
const affiliateSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  
  // Affiliate Details
  affiliateCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'banned'],
    default: 'pending'
  },
  
  // Performance Tracking
  totalReferrals: {
    type: Number,
    default: 0
  },
  approvedReferrals: {
    type: Number,
    default: 0
  },
  totalCommissions: {
    type: Number,
    default: 0
  },
  paidCommissions: {
    type: Number,
    default: 0
  },
  pendingCommissions: {
    type: Number,
    default: 0
  },
  
  // Settings
  commissionRate: {
    type: Number,
    default: 50, // $50 per approved referral
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'venmo', 'cashapp', 'zelle', 'check'],
    default: 'paypal'
  },
  paymentDetails: {
    type: String,
    default: ''
  },
  
  // Tracking
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: Date,
  
  // Marketing Materials
  customMessage: {
    type: String,
    default: 'Join me on EdgeVantage and earn $500-$1000 monthly passive income!'
  },
  
  // Admin Notes
  notes: {
    type: String,
    default: ''
  }
});

// Commission Transaction Schema
const commissionSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  affiliateCode: {
    type: String,
    required: true
  },
  leadEmail: {
    type: String,
    required: true
  },
  leadName: {
    type: String,
    required: true
  },
  
  // Commission Details
  amount: {
    type: Number,
    required: true,
    default: 50
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'cancelled'],
    default: 'pending'
  },
  
  // Payment Info
  paidAt: Date,
  paymentMethod: String,
  paymentReference: String,
  
  // Tracking
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Admin Notes
  notes: {
    type: String,
    default: ''
  }
});

// Add indexes
affiliateSchema.index({ email: 1 });
affiliateSchema.index({ affiliateCode: 1 });
affiliateSchema.index({ status: 1 });
affiliateSchema.index({ createdAt: -1 });

commissionSchema.index({ affiliateId: 1 });
commissionSchema.index({ leadId: 1 });
commissionSchema.index({ affiliateCode: 1 });
commissionSchema.index({ status: 1 });
commissionSchema.index({ createdAt: -1 });

const Affiliate = mongoose.model('Affiliate', affiliateSchema);
const Commission = mongoose.model('Commission', commissionSchema);

// Routes

// Submit new application
app.post('/api/leads', async (req, res) => {
  try {
    // Check if all qualification questions are "yes"
    const qualified = req.body.hasResidence === 'yes' && 
                      req.body.hasInternet === 'yes' && 
                      req.body.hasSpace === 'yes';
    
    // Get IP address
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.ip;
    
    // Check for duplicate email
    const existingLead = await Lead.findOne({ email: req.body.email });
    if (existingLead) {
      return res.status(400).json({ 
        error: 'This email has already submitted an application.',
        existingApplication: true 
      });
    }
    
    // Create new lead
    const newLead = new Lead({
      ...req.body,
      qualified,
      ipAddress,
      userAgent: req.headers['user-agent'],
      updatedAt: Date.now()
    });
    
    const savedLead = await newLead.save();
    
    console.log(`✅ New lead saved: ${savedLead.email} - Qualified: ${qualified}`);
    
    res.status(201).json({ 
      success: true,
      message: 'Application submitted successfully',
      leadId: savedLead._id,
      qualified: qualified
    });
  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({ 
      error: 'Failed to submit application. Please try again.',
      details: error.message 
    });
  }
});

// Get all leads (for admin dashboard)
app.get('/api/leads', async (req, res) => {
  try {
    const { status, qualified, limit = 100, offset = 0 } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (qualified !== undefined) query.qualified = qualified === 'true';
    
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const totalCount = await Lead.countDocuments(query);
    
    res.json({
      leads,
      totalCount,
      hasMore: totalCount > parseInt(offset) + parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get lead statistics (for admin dashboard)
app.get('/api/leads-stats', async (req, res) => {
  try {
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
    console.log('📊 Raw stats result:', JSON.stringify(stats[0], null, 2));
    
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
    
    console.log('📊 Formatted stats:', JSON.stringify(formattedStats, null, 2));
    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Update lead status (for admin)
app.patch('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = Date.now();
    
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!updatedLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Lead updated successfully',
      lead: updatedLead 
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete lead (for admin)
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedLead = await Lead.findByIdAndDelete(id);
    
    if (!deletedLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Lead deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// Check referral code validity
app.get('/api/referral/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Look up affiliate by code
    const affiliate = await Affiliate.findOne({ 
      affiliateCode: code.toUpperCase(),
      status: 'active'
    });
    
    if (affiliate) {
      res.json({
        code: code,
        referrerName: affiliate.name,
        bonus: affiliate.commissionRate,
        isValid: true,
        affiliateId: affiliate._id
      });
    } else {
      res.json({
        code: code,
        isValid: false,
        message: 'Referral code not found or inactive'
      });
    }
  } catch (error) {
    console.error('Error checking referral:', error);
    res.status(500).json({ error: 'Failed to check referral code' });
  }
});

// Affiliate registration
app.post('/api/affiliates/register', async (req, res) => {
  try {
    const { name, email, phone, paymentMethod = 'paypal', paymentDetails = '' } = req.body;
    
    // Generate unique affiliate code
    let affiliateCode;
    let codeExists = true;
    let attempts = 0;
    
    while (codeExists && attempts < 10) {
      const namePart = name.split(' ').map(n => n.substring(0, 3).toUpperCase()).join('').substring(0, 6);
      const numberPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      affiliateCode = namePart + numberPart;
      
      const existing = await Affiliate.findOne({ affiliateCode });
      codeExists = !!existing;
      attempts++;
    }
    
    if (codeExists) {
      return res.status(400).json({ error: 'Unable to generate unique affiliate code' });
    }
    
    // Check for existing email
    const existingAffiliate = await Affiliate.findOne({ email });
    if (existingAffiliate) {
      return res.status(400).json({ error: 'Email already registered as affiliate' });
    }
    
    const newAffiliate = new Affiliate({
      name,
      email,
      phone,
      affiliateCode,
      paymentMethod,
      paymentDetails,
      status: 'active' // Auto-approve for now
    });
    
    const savedAffiliate = await newAffiliate.save();
    
    console.log(`✅ New affiliate registered: ${savedAffiliate.email} - Code: ${savedAffiliate.affiliateCode}`);
    
    res.status(201).json({
      success: true,
      message: 'Affiliate registration successful',
      affiliate: {
        id: savedAffiliate._id,
        name: savedAffiliate.name,
        email: savedAffiliate.email,
        affiliateCode: savedAffiliate.affiliateCode,
        commissionRate: savedAffiliate.commissionRate
      }
    });
  } catch (error) {
    console.error('Error registering affiliate:', error);
    res.status(500).json({ error: 'Failed to register affiliate' });
  }
});

// Get affiliate dashboard data
app.get('/api/affiliates/:code/dashboard', async (req, res) => {
  try {
    const { code } = req.params;
    
    const affiliate = await Affiliate.findOne({ affiliateCode: code.toUpperCase() });
    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }
    
    // Get referral stats
    const referralStats = await Lead.aggregate([
      { $match: { referralCode: code.toUpperCase() } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get recent referrals
    const recentReferrals = await Lead.find({ referralCode: code.toUpperCase() })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email status qualified createdAt city state');
    
    // Get commissions
    const commissions = await Commission.find({ affiliateCode: code.toUpperCase() })
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Calculate totals
    const totalReferrals = await Lead.countDocuments({ referralCode: code.toUpperCase() });
    const approvedReferrals = await Lead.countDocuments({ 
      referralCode: code.toUpperCase(), 
      status: 'approved' 
    });
    const pendingReferrals = await Lead.countDocuments({ 
      referralCode: code.toUpperCase(), 
      status: { $in: ['pending', 'contacted'] }
    });
    
    const totalCommissions = approvedReferrals * affiliate.commissionRate;
    const paidCommissions = await Commission.aggregate([
      { $match: { affiliateCode: code.toUpperCase(), status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const pendingCommissions = await Commission.aggregate([
      { $match: { affiliateCode: code.toUpperCase(), status: { $in: ['pending', 'approved'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Update affiliate stats
    await Affiliate.findByIdAndUpdate(affiliate._id, {
      totalReferrals,
      approvedReferrals,
      totalCommissions,
      paidCommissions: paidCommissions[0]?.total || 0,
      pendingCommissions: pendingCommissions[0]?.total || 0,
      lastLoginAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({
      affiliate: {
        name: affiliate.name,
        email: affiliate.email,
        affiliateCode: affiliate.affiliateCode,
        status: affiliate.status,
        commissionRate: affiliate.commissionRate,
        customMessage: affiliate.customMessage
      },
      stats: {
        totalReferrals,
        approvedReferrals,
        pendingReferrals,
        totalCommissions,
        paidCommissions: paidCommissions[0]?.total || 0,
        pendingCommissions: pendingCommissions[0]?.total || 0,
        conversionRate: totalReferrals > 0 ? ((approvedReferrals / totalReferrals) * 100).toFixed(1) : '0'
      },
      recentReferrals,
      commissions,
      referralStats: referralStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching affiliate dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch affiliate dashboard' });
  }
});

// Get all affiliates (admin only)
app.get('/api/affiliates', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const affiliates = await Affiliate.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-notes');
    
    res.json({ affiliates });
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    res.status(500).json({ error: 'Failed to fetch affiliates' });
  }
});

// Update affiliate
app.patch('/api/affiliates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date();
    
    const affiliate = await Affiliate.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }
    
    res.json({ success: true, affiliate });
  } catch (error) {
    console.error('Error updating affiliate:', error);
    res.status(500).json({ error: 'Failed to update affiliate' });
  }
});

// Process commission (when lead gets approved)
app.post('/api/commissions/process', async (req, res) => {
  try {
    const { leadId } = req.body;
    
    const lead = await Lead.findById(leadId);
    if (!lead || !lead.referralCode) {
      return res.status(400).json({ error: 'Lead not found or no referral code' });
    }
    
    const affiliate = await Affiliate.findOne({ affiliateCode: lead.referralCode.toUpperCase() });
    if (!affiliate) {
      return res.status(400).json({ error: 'Affiliate not found' });
    }
    
    // Check if commission already exists
    const existingCommission = await Commission.findOne({ leadId: lead._id });
    if (existingCommission) {
      return res.status(400).json({ error: 'Commission already processed for this lead' });
    }
    
    // Create commission record
    const commission = new Commission({
      affiliateId: affiliate._id,
      leadId: lead._id,
      affiliateCode: affiliate.affiliateCode,
      leadEmail: lead.email,
      leadName: lead.name,
      amount: affiliate.commissionRate,
      status: lead.status === 'approved' ? 'approved' : 'pending'
    });
    
    await commission.save();
    
    console.log(`✅ Commission processed: ${commission.amount} for ${affiliate.affiliateCode}`);
    
    res.json({ success: true, commission });
  } catch (error) {
    console.error('Error processing commission:', error);
    res.status(500).json({ error: 'Failed to process commission' });
  }
});

// Get affiliate stats (admin)
app.get('/api/affiliates-stats', async (req, res) => {
  try {
    const stats = await Affiliate.aggregate([
      {
        $facet: {
          totalAffiliates: [{ $count: 'count' }],
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
          ]
        }
      }
    ]);
    
    res.json({
      totalAffiliates: stats[0].totalAffiliates[0]?.count || 0,
      statusBreakdown: stats[0].statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topPerformers: stats[0].topPerformers,
      totalCommissions: stats[0].totalCommissions[0]?.total || 0,
      paidCommissions: stats[0].paidCommissions[0]?.total || 0,
      pendingCommissions: (stats[0].totalCommissions[0]?.total || 0) - (stats[0].paidCommissions[0]?.total || 0)
    });
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({ error: 'Failed to fetch affiliate stats' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});