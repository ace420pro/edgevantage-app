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
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
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
app.get('/api/leads/stats', async (req, res) => {
  try {
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
    
    // In a real app, you might have a separate Referrals collection
    // For now, we'll check if any approved lead has generated this code
    // You can implement your own referral logic here
    
    const mockReferralData = {
      code: code,
      referrerName: 'John Smith', // You'd look this up in your database
      bonus: 50,
      isValid: true
    };
    
    res.json(mockReferralData);
  } catch (error) {
    console.error('Error checking referral:', error);
    res.status(500).json({ error: 'Failed to check referral code' });
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