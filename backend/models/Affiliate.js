const mongoose = require('mongoose');

// Affiliate Schema - Complete affiliate management system
const affiliateSchema = new mongoose.Schema({
  // Basic Information
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
  
  // User Account Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Affiliate Details
  affiliateCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  affiliateType: {
    type: String,
    enum: ['individual', 'business', 'influencer', 'partner'],
    default: 'individual'
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'banned', 'inactive'],
    default: 'pending'
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Business Information (if applicable)
  businessInfo: {
    businessName: String,
    taxId: String,
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'US'
      }
    }
  },
  
  // Commission Structure
  commission: {
    rate: {
      type: Number,
      default: 50, // Default $50 per referral
      min: 0
    },
    type: {
      type: String,
      enum: ['fixed', 'percentage', 'tiered', 'custom'],
      default: 'fixed'
    },
    tiers: [{
      minReferrals: Number,
      maxReferrals: Number,
      rate: Number
    }],
    customRates: [{
      productType: String,
      rate: Number,
      type: String // 'fixed' or 'percentage'
    }],
    bonuses: [{
      type: {
        type: String,
        enum: ['signup', 'milestone', 'performance', 'special']
      },
      amount: Number,
      description: String,
      earnedAt: Date
    }]
  },
  
  // Tracking & Analytics
  tracking: {
    clicks: {
      type: Number,
      default: 0
    },
    uniqueClicks: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    },
    signups: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    
    // Monthly snapshots
    monthlyStats: [{
      month: Date,
      clicks: Number,
      signups: Number,
      conversions: Number,
      earnings: Number,
      paidOut: Number
    }],
    
    // Click tracking
    clickHistory: [{
      timestamp: Date,
      ipAddress: String,
      userAgent: String,
      referrer: String,
      landingPage: String,
      sessionId: String
    }]
  },
  
  // Referrals
  referrals: [{
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    },
    name: String,
    email: String,
    signupDate: Date,
    status: {
      type: String,
      enum: ['pending', 'qualified', 'approved', 'active', 'rejected', 'cancelled'],
      default: 'pending'
    },
    conversionDate: Date,
    commissionAmount: Number,
    commissionStatus: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'cancelled'],
      default: 'pending'
    },
    commissionPaidDate: Date,
    lifetime: {
      value: {
        type: Number,
        default: 0
      },
      months: {
        type: Number,
        default: 0
      }
    }
  }],
  
  // Earnings & Payouts
  earnings: {
    totalEarned: {
      type: Number,
      default: 0
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    pendingBalance: {
      type: Number,
      default: 0
    },
    availableBalance: {
      type: Number,
      default: 0
    },
    nextPayoutDate: Date,
    
    // Payout History
    payouts: [{
      amount: Number,
      method: {
        type: String,
        enum: ['paypal', 'bank_transfer', 'check', 'crypto', 'stripe'],
        default: 'paypal'
      },
      transactionId: String,
      requestedAt: Date,
      processedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending'
      },
      notes: String,
      processorResponse: mongoose.Schema.Types.Mixed
    }],
    
    // Minimum payout threshold
    minPayoutThreshold: {
      type: Number,
      default: 100 // $100 minimum
    }
  },
  
  // Payment Methods
  paymentMethods: {
    primary: {
      type: String,
      enum: ['paypal', 'bank_transfer', 'check', 'crypto', 'stripe'],
      default: 'paypal'
    },
    paypal: {
      email: String,
      verified: {
        type: Boolean,
        default: false
      }
    },
    bank: {
      accountName: String,
      accountNumber: String,
      routingNumber: String,
      bankName: String,
      accountType: {
        type: String,
        enum: ['checking', 'savings']
      },
      verified: {
        type: Boolean,
        default: false
      }
    },
    crypto: {
      walletAddress: String,
      network: String,
      verified: {
        type: Boolean,
        default: false
      }
    },
    taxInfo: {
      taxId: String,
      taxForm: {
        type: String,
        enum: ['W9', 'W8BEN', 'other']
      },
      taxFormSubmitted: {
        type: Boolean,
        default: false
      },
      taxFormSubmittedAt: Date
    }
  },
  
  // Marketing Materials & Resources
  resources: {
    customLinks: [{
      name: String,
      url: String,
      clicks: {
        type: Number,
        default: 0
      },
      conversions: {
        type: Number,
        default: 0
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    promotionalMaterials: [{
      type: {
        type: String,
        enum: ['banner', 'email_template', 'social_post', 'landing_page']
      },
      name: String,
      url: String,
      downloads: {
        type: Number,
        default: 0
      }
    }],
    trainingCompleted: [{
      courseId: String,
      courseName: String,
      completedAt: Date
    }]
  },
  
  // Performance Metrics
  performance: {
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageConversionRate: {
      type: Number,
      default: 0
    },
    lifetimeValue: {
      type: Number,
      default: 0
    },
    lastActivityDate: Date,
    
    // Rankings
    rankings: {
      overall: Number,
      monthly: Number,
      category: Number
    },
    
    // Achievements
    achievements: [{
      type: String,
      name: String,
      description: String,
      earnedAt: Date,
      reward: Number
    }]
  },
  
  // Communication Preferences
  preferences: {
    emailNotifications: {
      newReferral: {
        type: Boolean,
        default: true
      },
      conversion: {
        type: Boolean,
        default: true
      },
      payout: {
        type: Boolean,
        default: true
      },
      newsletter: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Notes & Support
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['general', 'support', 'payment', 'compliance']
    }
  }],
  
  // Compliance & Verification
  compliance: {
    termsAccepted: {
      type: Boolean,
      default: false
    },
    termsAcceptedAt: Date,
    identityVerified: {
      type: Boolean,
      default: false
    },
    identityVerifiedAt: Date,
    documentsSubmitted: [{
      type: String,
      name: String,
      url: String,
      submittedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }]
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
affiliateSchema.index({ affiliateCode: 1 });
affiliateSchema.index({ email: 1 });
affiliateSchema.index({ userId: 1 });
affiliateSchema.index({ status: 1 });
affiliateSchema.index({ 'performance.tier': 1 });
affiliateSchema.index({ 'earnings.totalEarned': -1 });
affiliateSchema.index({ createdAt: -1 });

// Virtual Properties

// Check if eligible for payout
affiliateSchema.virtual('eligibleForPayout').get(function() {
  return this.earnings.availableBalance >= this.earnings.minPayoutThreshold;
});

// Calculate total referral value
affiliateSchema.virtual('totalReferralValue').get(function() {
  return this.referrals.reduce((sum, ref) => sum + ref.lifetime.value, 0);
});

// Instance Methods

// Generate unique affiliate code
affiliateSchema.methods.generateAffiliateCode = function() {
  const prefix = this.name.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  this.affiliateCode = `${prefix}${random}`;
  return this.affiliateCode;
};

// Record click
affiliateSchema.methods.recordClick = function(clickData) {
  this.tracking.clicks += 1;
  
  // Check if unique click (new session)
  const existingClick = this.tracking.clickHistory.find(
    c => c.sessionId === clickData.sessionId
  );
  
  if (!existingClick) {
    this.tracking.uniqueClicks += 1;
  }
  
  this.tracking.clickHistory.push({
    timestamp: new Date(),
    ...clickData
  });
  
  // Keep only last 1000 clicks
  if (this.tracking.clickHistory.length > 1000) {
    this.tracking.clickHistory = this.tracking.clickHistory.slice(-1000);
  }
  
  return this.save();
};

// Add referral
affiliateSchema.methods.addReferral = function(leadData) {
  const referral = {
    leadId: leadData._id,
    name: leadData.name,
    email: leadData.email,
    signupDate: new Date(),
    status: 'pending',
    commissionAmount: this.commission.rate,
    commissionStatus: 'pending'
  };
  
  this.referrals.push(referral);
  this.tracking.signups += 1;
  
  return this.save();
};

// Process conversion
affiliateSchema.methods.processConversion = function(leadId) {
  const referral = this.referrals.find(
    r => r.leadId.toString() === leadId.toString()
  );
  
  if (!referral) {
    throw new Error('Referral not found');
  }
  
  if (referral.status === 'active') {
    throw new Error('Conversion already processed');
  }
  
  referral.status = 'active';
  referral.conversionDate = new Date();
  referral.commissionStatus = 'approved';
  
  this.tracking.conversions += 1;
  this.tracking.conversionRate = 
    (this.tracking.conversions / this.tracking.signups) * 100;
  
  // Update earnings
  this.earnings.totalEarned += referral.commissionAmount;
  this.earnings.pendingBalance += referral.commissionAmount;
  
  // Will be moved to available after holding period (e.g., 30 days)
  
  return this.save();
};

// Request payout
affiliateSchema.methods.requestPayout = function(amount, method) {
  if (amount > this.earnings.availableBalance) {
    throw new Error('Insufficient available balance');
  }
  
  if (amount < this.earnings.minPayoutThreshold) {
    throw new Error(`Minimum payout amount is $${this.earnings.minPayoutThreshold}`);
  }
  
  const payout = {
    amount,
    method: method || this.paymentMethods.primary,
    requestedAt: new Date(),
    status: 'pending'
  };
  
  this.earnings.payouts.push(payout);
  this.earnings.availableBalance -= amount;
  
  return this.save();
};

// Process payout
affiliateSchema.methods.processPayout = function(payoutIndex, transactionId, processorResponse) {
  const payout = this.earnings.payouts[payoutIndex];
  
  if (!payout) {
    throw new Error('Payout not found');
  }
  
  payout.status = 'completed';
  payout.processedAt = new Date();
  payout.transactionId = transactionId;
  payout.processorResponse = processorResponse;
  
  this.earnings.totalPaid += payout.amount;
  
  return this.save();
};

// Update performance tier
affiliateSchema.methods.updatePerformanceTier = function() {
  const conversions = this.tracking.conversions;
  const lifetimeValue = this.earnings.totalEarned;
  
  let tier = 'bronze';
  
  if (conversions >= 100 || lifetimeValue >= 10000) {
    tier = 'diamond';
  } else if (conversions >= 50 || lifetimeValue >= 5000) {
    tier = 'platinum';
  } else if (conversions >= 25 || lifetimeValue >= 2500) {
    tier = 'gold';
  } else if (conversions >= 10 || lifetimeValue >= 1000) {
    tier = 'silver';
  }
  
  this.performance.tier = tier;
  this.performance.lifetimeValue = lifetimeValue;
  
  return tier;
};

// Calculate monthly stats
affiliateSchema.methods.calculateMonthlyStats = function(month, year) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  const monthlyReferrals = this.referrals.filter(r => {
    const date = new Date(r.signupDate);
    return date >= startDate && date <= endDate;
  });
  
  const stats = {
    month: startDate,
    clicks: 0, // Would need to filter clickHistory
    signups: monthlyReferrals.length,
    conversions: monthlyReferrals.filter(r => r.status === 'active').length,
    earnings: monthlyReferrals.reduce((sum, r) => 
      r.commissionStatus === 'approved' ? sum + r.commissionAmount : sum, 0
    ),
    paidOut: 0 // Would need to filter payouts
  };
  
  // Update or add monthly stats
  const existingIndex = this.tracking.monthlyStats.findIndex(
    s => s.month.getMonth() === month && s.month.getFullYear() === year
  );
  
  if (existingIndex >= 0) {
    this.tracking.monthlyStats[existingIndex] = stats;
  } else {
    this.tracking.monthlyStats.push(stats);
  }
  
  return stats;
};

// Static Methods

// Find active affiliates
affiliateSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort('-performance.score');
};

// Get top performers
affiliateSchema.statics.getTopPerformers = function(limit = 10, period = 'all') {
  const query = { status: 'active' };
  let sortField = '-earnings.totalEarned';
  
  if (period === 'month') {
    // Would need to aggregate monthly data
    sortField = '-tracking.monthlyStats.0.earnings';
  }
  
  return this.find(query)
    .sort(sortField)
    .limit(limit)
    .select('name affiliateCode performance earnings tracking');
};

// Find by referral code
affiliateSchema.statics.findByCode = function(code) {
  return this.findOne({ 
    affiliateCode: code.toUpperCase(),
    status: 'active'
  });
};

// Process pending balances (move from pending to available after holding period)
affiliateSchema.statics.processPendingBalances = async function() {
  const holdingPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
  const cutoffDate = new Date(Date.now() - holdingPeriod);
  
  const affiliates = await this.find({
    'referrals.commissionStatus': 'approved',
    'referrals.conversionDate': { $lte: cutoffDate }
  });
  
  for (const affiliate of affiliates) {
    let amountToMove = 0;
    
    for (const referral of affiliate.referrals) {
      if (referral.commissionStatus === 'approved' && 
          referral.conversionDate <= cutoffDate &&
          !referral.commissionPaidDate) {
        amountToMove += referral.commissionAmount;
        referral.commissionPaidDate = new Date();
      }
    }
    
    if (amountToMove > 0) {
      affiliate.earnings.pendingBalance -= amountToMove;
      affiliate.earnings.availableBalance += amountToMove;
      await affiliate.save();
    }
  }
};

// Pre-save middleware
affiliateSchema.pre('save', function(next) {
  // Generate affiliate code if not set
  if (!this.affiliateCode) {
    this.generateAffiliateCode();
  }
  
  // Update performance tier
  this.updatePerformanceTier();
  
  // Update timestamp
  this.updatedAt = Date.now();
  
  next();
});

const Affiliate = mongoose.model('Affiliate', affiliateSchema);

module.exports = Affiliate;