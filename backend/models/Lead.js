const mongoose = require('mongoose');

// Lead Schema - Application/Lead management
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
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate'
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'contacted', 'active', 'inactive'],
    default: 'pending'
  },
  qualified: {
    type: Boolean,
    default: false
  },
  
  // User Account
  hasAccount: {
    type: Boolean,
    default: false
  },
  accountCreatedAt: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Analytics Data
  sessionId: String,
  ipAddress: String,
  userAgent: String,
  utmSource: String,
  utmCampaign: String,
  utmMedium: String,
  utmTerm: String,
  utmContent: String,
  
  // Equipment & Earnings
  equipment: {
    assigned: {
      type: Boolean,
      default: false
    },
    type: String,
    model: String,
    serialNumber: String,
    shippedDate: Date,
    receivedDate: Date,
    activatedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered', 'active', 'inactive', 'returned'],
      default: 'pending'
    }
  },
  
  earnings: {
    monthlyAmount: {
      type: Number,
      default: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    },
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    paymentHistory: [{
      amount: Number,
      date: Date,
      method: String,
      transactionId: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
      }
    }]
  },
  
  // Documents & Verification
  documents: {
    residenceProof: {
      uploaded: {
        type: Boolean,
        default: false
      },
      url: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    identityProof: {
      uploaded: {
        type: Boolean,
        default: false
      },
      url: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    agreement: {
      signed: {
        type: Boolean,
        default: false
      },
      signedAt: Date,
      ipAddress: String,
      documentUrl: String
    }
  },
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'in_app'],
      default: 'email'
    },
    subject: String,
    content: String,
    sentAt: Date,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
      default: 'sent'
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Admin Notes & Activity
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
      enum: ['general', 'approval', 'equipment', 'payment', 'support'],
      default: 'general'
    }
  }],
  
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  }],
  
  // Follow-up & Tasks
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    date: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Risk Assessment
  riskScore: {
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    factors: [{
      factor: String,
      weight: Number,
      value: Number
    }],
    calculatedAt: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  firstContactedAt: Date,
  lastContactedAt: Date
}, {
  timestamps: true
});

// Indexes for performance
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ qualified: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ referralCode: 1 });
leadSchema.index({ affiliateId: 1 });
leadSchema.index({ 'equipment.status': 1 });
leadSchema.index({ 'followUp.required': 1, 'followUp.date': 1 });

// Virtual Properties

// Check if lead is fully verified
leadSchema.virtual('fullyVerified').get(function() {
  return this.documents.residenceProof.verified && 
         this.documents.identityProof.verified &&
         this.documents.agreement.signed;
});

// Calculate days since application
leadSchema.virtual('daysSinceApplication').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Check if lead needs attention
leadSchema.virtual('needsAttention').get(function() {
  // Needs attention if pending for more than 48 hours
  if (this.status === 'pending' && this.daysSinceApplication > 2) return true;
  
  // Needs attention if follow-up is overdue
  if (this.followUp.required && !this.followUp.completed && 
      this.followUp.date < new Date()) return true;
  
  // Needs attention if approved but equipment not shipped
  if (this.status === 'approved' && !this.equipment.shippedDate && 
      this.daysSinceApplication > 7) return true;
  
  return false;
});

// Instance Methods

// Update qualification status
leadSchema.methods.updateQualificationStatus = function() {
  this.qualified = this.hasResidence === 'yes' && 
                  this.hasInternet === 'yes' && 
                  this.hasSpace === 'yes';
  return this.qualified;
};

// Change status with history tracking
leadSchema.methods.changeStatus = function(newStatus, userId, reason) {
  const oldStatus = this.status;
  
  this.statusHistory.push({
    status: oldStatus,
    changedAt: new Date(),
    changedBy: userId,
    reason: reason || `Changed from ${oldStatus} to ${newStatus}`
  });
  
  this.status = newStatus;
  
  // Set first contacted date
  if (newStatus === 'contacted' && !this.firstContactedAt) {
    this.firstContactedAt = new Date();
  }
  
  this.lastContactedAt = new Date();
  
  return this.save();
};

// Add communication record
leadSchema.methods.addCommunication = function(commData) {
  this.communications.push({
    ...commData,
    sentAt: new Date()
  });
  
  this.lastContactedAt = new Date();
  
  return this.save();
};

// Add note
leadSchema.methods.addNote = function(content, userId, type = 'general') {
  this.notes.push({
    content,
    addedBy: userId,
    addedAt: new Date(),
    type
  });
  
  return this.save();
};

// Assign equipment
leadSchema.methods.assignEquipment = function(equipmentData) {
  this.equipment = {
    ...this.equipment,
    ...equipmentData,
    assigned: true,
    status: 'pending'
  };
  
  return this.save();
};

// Record earnings
leadSchema.methods.recordEarning = function(amount, transactionId) {
  this.earnings.totalEarned += amount;
  this.earnings.lastPaymentDate = new Date();
  this.earnings.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  this.earnings.paymentHistory.push({
    amount,
    date: new Date(),
    method: 'direct_deposit',
    transactionId,
    status: 'completed'
  });
  
  return this.save();
};

// Calculate risk score
leadSchema.methods.calculateRiskScore = function() {
  let score = 0;
  const factors = [];
  
  // Location risk (some states might be higher risk)
  const highRiskStates = ['NY', 'CA', 'IL'];
  if (highRiskStates.includes(this.state)) {
    factors.push({ factor: 'high_risk_state', weight: 15, value: 15 });
    score += 15;
  }
  
  // Email domain risk
  const riskyEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
  const emailDomain = this.email.split('@')[1];
  if (riskyEmailDomains.includes(emailDomain)) {
    factors.push({ factor: 'free_email', weight: 10, value: 10 });
    score += 10;
  }
  
  // Referral source risk
  if (!this.referralCode) {
    factors.push({ factor: 'no_referral', weight: 5, value: 5 });
    score += 5;
  }
  
  // Quick application (less than 1 minute - might be bot)
  // This would need session tracking to implement properly
  
  this.riskScore = {
    score: Math.min(100, score),
    factors,
    calculatedAt: new Date()
  };
  
  return this.riskScore;
};

// Static Methods

// Find qualified leads
leadSchema.statics.findQualified = function() {
  return this.find({
    qualified: true,
    status: 'pending'
  }).sort('-createdAt');
};

// Find leads needing attention
leadSchema.statics.findNeedingAttention = function() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  
  return this.find({
    $or: [
      // Pending for more than 48 hours
      {
        status: 'pending',
        createdAt: { $lte: twoDaysAgo }
      },
      // Overdue follow-ups
      {
        'followUp.required': true,
        'followUp.completed': false,
        'followUp.date': { $lte: new Date() }
      },
      // Approved but equipment not shipped
      {
        status: 'approved',
        'equipment.shippedDate': { $exists: false }
      }
    ]
  }).sort('createdAt');
};

// Get statistics
leadSchema.statics.getStatistics = async function(startDate, endDate) {
  const match = {};
  
  if (startDate && endDate) {
    match.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        qualified: {
          $sum: { $cond: [{ $eq: ['$qualified', true] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        rejected: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        withEquipment: {
          $sum: { $cond: [{ $eq: ['$equipment.assigned', true] }, 1, 0] }
        },
        totalEarnings: { $sum: '$earnings.totalEarned' },
        averageEarnings: { $avg: '$earnings.monthlyAmount' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    qualified: 0,
    pending: 0,
    approved: 0,
    active: 0,
    rejected: 0,
    withEquipment: 0,
    totalEarnings: 0,
    averageEarnings: 0
  };
};

// Pre-save middleware
leadSchema.pre('save', function(next) {
  // Update qualification status
  this.updateQualificationStatus();
  
  // Calculate risk score if not set
  if (!this.riskScore.calculatedAt) {
    this.calculateRiskScore();
  }
  
  // Update timestamp
  this.updatedAt = Date.now();
  
  next();
});

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;