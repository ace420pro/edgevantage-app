const mongoose = require('mongoose');

// A/B Test Schema - Complete A/B testing system
const abTestSchema = new mongoose.Schema({
  // Test Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  hypothesis: String,
  
  // Test Type & Category
  type: {
    type: String,
    enum: ['headline', 'cta', 'value-prop', 'social-proof', 'pricing', 'design', 'copy', 'feature'],
    required: true
  },
  category: {
    type: String,
    enum: ['conversion', 'engagement', 'retention', 'revenue'],
    default: 'conversion'
  },
  
  // Test Configuration
  config: {
    targetPage: {
      type: String,
      required: true // e.g., 'homepage', 'application', 'pricing'
    },
    targetElement: String, // CSS selector or component name
    trafficSplit: {
      type: Number,
      default: 50, // Percentage for variant (control gets remainder)
      min: 0,
      max: 100
    },
    minSampleSize: {
      type: Number,
      default: 100
    },
    confidenceLevel: {
      type: Number,
      default: 95, // Statistical confidence level
      enum: [90, 95, 99]
    },
    testDuration: {
      min: {
        type: Number,
        default: 7 // Minimum days to run
      },
      max: {
        type: Number,
        default: 30 // Maximum days to run
      }
    }
  },
  
  // Variants
  variants: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    isControl: {
      type: Boolean,
      default: false
    },
    content: mongoose.Schema.Types.Mixed, // Can be string, object, etc.
    styles: mongoose.Schema.Types.Mixed, // CSS overrides
    
    // Variant Metrics
    metrics: {
      impressions: {
        type: Number,
        default: 0
      },
      conversions: {
        type: Number,
        default: 0
      },
      revenue: {
        type: Number,
        default: 0
      },
      bounces: {
        type: Number,
        default: 0
      },
      timeOnPage: {
        type: Number,
        default: 0 // Average in seconds
      },
      clicks: {
        type: Number,
        default: 0
      },
      
      // Calculated metrics
      conversionRate: {
        type: Number,
        default: 0
      },
      bounceRate: {
        type: Number,
        default: 0
      },
      averageRevenue: {
        type: Number,
        default: 0
      }
    },
    
    // User assignments
    assignedUsers: [{
      userId: String, // Can be user ID or session ID
      assignedAt: Date,
      converted: Boolean,
      revenue: Number,
      events: [{
        type: String,
        timestamp: Date,
        metadata: mongoose.Schema.Types.Mixed
      }]
    }]
  }],
  
  // Test Status
  status: {
    type: String,
    enum: ['draft', 'running', 'paused', 'completed', 'archived'],
    default: 'draft'
  },
  
  // Test Results
  results: {
    winner: String, // Variant ID
    winnerDeclaredAt: Date,
    statisticalSignificance: Number,
    improvementPercentage: Number,
    confidenceInterval: {
      lower: Number,
      upper: Number
    },
    pValue: Number,
    
    // Summary statistics
    summary: {
      totalImpressions: Number,
      totalConversions: Number,
      totalRevenue: Number,
      averageConversionRate: Number,
      testDuration: Number // in days
    },
    
    // Daily snapshots
    dailySnapshots: [{
      date: Date,
      variants: [{
        variantId: String,
        impressions: Number,
        conversions: Number,
        revenue: Number,
        conversionRate: Number
      }]
    }],
    
    // Final report
    report: {
      conclusion: String,
      recommendations: String,
      nextSteps: String,
      generatedAt: Date
    }
  },
  
  // Targeting Rules
  targeting: {
    enabled: {
      type: Boolean,
      default: false
    },
    rules: [{
      type: {
        type: String,
        enum: ['location', 'device', 'browser', 'referrer', 'utm', 'user_property', 'time']
      },
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'in', 'not_in']
      },
      value: mongoose.Schema.Types.Mixed
    }],
    
    // Exclusion rules
    exclude: {
      returningUsers: {
        type: Boolean,
        default: false
      },
      employees: {
        type: Boolean,
        default: true
      },
      bots: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Goals & Success Metrics
  goals: {
    primary: {
      metric: {
        type: String,
        enum: ['conversion_rate', 'revenue', 'click_rate', 'time_on_page', 'bounce_rate'],
        required: true
      },
      target: Number, // Target improvement percentage
      minimumDetectableEffect: {
        type: Number,
        default: 5 // Minimum % change to detect
      }
    },
    secondary: [{
      metric: String,
      target: Number
    }]
  },
  
  // Schedule
  schedule: {
    startDate: Date,
    endDate: Date,
    startedAt: Date,
    pausedAt: Date,
    completedAt: Date,
    
    // Time-based rules
    runOnlyDuringBusinessHours: {
      type: Boolean,
      default: false
    },
    businessHours: {
      start: String, // e.g., "09:00"
      end: String, // e.g., "17:00"
      timezone: {
        type: String,
        default: 'America/New_York'
      },
      days: [Number] // 0 = Sunday, 6 = Saturday
    }
  },
  
  // Integration & Tracking
  integration: {
    googleAnalytics: {
      enabled: Boolean,
      experimentId: String
    },
    facebook: {
      enabled: Boolean,
      campaignId: String
    },
    segment: {
      enabled: Boolean,
      experimentId: String
    }
  },
  
  // Audit Trail
  history: [{
    action: {
      type: String,
      enum: ['created', 'started', 'paused', 'resumed', 'completed', 'archived', 'modified']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  
  // Metadata
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
abTestSchema.index({ status: 1 });
abTestSchema.index({ type: 1 });
abTestSchema.index({ 'schedule.startDate': 1 });
abTestSchema.index({ 'schedule.endDate': 1 });
abTestSchema.index({ createdAt: -1 });
abTestSchema.index({ 'variants.assignedUsers.userId': 1 });

// Virtual Properties

// Check if test is active
abTestSchema.virtual('isActive').get(function() {
  return this.status === 'running' && 
         (!this.schedule.endDate || this.schedule.endDate > new Date());
});

// Get test age in days
abTestSchema.virtual('ageInDays').get(function() {
  if (!this.schedule.startedAt) return 0;
  return Math.floor((new Date() - this.schedule.startedAt) / (1000 * 60 * 60 * 24));
});

// Check if test has enough data
abTestSchema.virtual('hasEnoughData').get(function() {
  const totalImpressions = this.variants.reduce((sum, v) => sum + v.metrics.impressions, 0);
  return totalImpressions >= this.config.minSampleSize * this.variants.length;
});

// Instance Methods

// Assign user to variant
abTestSchema.methods.assignUserToVariant = function(userId) {
  // Skip if user already assigned
  for (const variant of this.variants) {
    if (variant.assignedUsers.find(u => u.userId === userId)) {
      return variant.id;
    }
  }
  
  // Random assignment based on traffic split
  const random = Math.random() * 100;
  let cumulativePercentage = 0;
  
  for (let i = 0; i < this.variants.length; i++) {
    const variant = this.variants[i];
    const variantPercentage = i === 0 ? 
      (100 - this.config.trafficSplit) : 
      this.config.trafficSplit / (this.variants.length - 1);
    
    cumulativePercentage += variantPercentage;
    
    if (random <= cumulativePercentage) {
      variant.assignedUsers.push({
        userId,
        assignedAt: new Date(),
        converted: false,
        events: []
      });
      
      this.save();
      return variant.id;
    }
  }
  
  // Fallback to control
  return this.variants.find(v => v.isControl).id;
};

// Record impression
abTestSchema.methods.recordImpression = function(variantId, userId) {
  const variant = this.variants.find(v => v.id === variantId);
  if (!variant) return;
  
  variant.metrics.impressions += 1;
  
  // Record user event
  const user = variant.assignedUsers.find(u => u.userId === userId);
  if (user) {
    user.events.push({
      type: 'impression',
      timestamp: new Date()
    });
  }
  
  return this.save();
};

// Record conversion
abTestSchema.methods.recordConversion = function(variantId, userId, revenue = 0) {
  const variant = this.variants.find(v => v.id === variantId);
  if (!variant) return;
  
  variant.metrics.conversions += 1;
  variant.metrics.revenue += revenue;
  
  // Update user
  const user = variant.assignedUsers.find(u => u.userId === userId);
  if (user && !user.converted) {
    user.converted = true;
    user.revenue = revenue;
    user.events.push({
      type: 'conversion',
      timestamp: new Date(),
      metadata: { revenue }
    });
  }
  
  // Recalculate rates
  this.calculateMetrics();
  
  return this.save();
};

// Calculate variant metrics
abTestSchema.methods.calculateMetrics = function() {
  for (const variant of this.variants) {
    const impressions = variant.metrics.impressions;
    
    if (impressions > 0) {
      variant.metrics.conversionRate = (variant.metrics.conversions / impressions) * 100;
      variant.metrics.bounceRate = (variant.metrics.bounces / impressions) * 100;
      variant.metrics.averageRevenue = variant.metrics.revenue / impressions;
    }
  }
};

// Calculate statistical significance
abTestSchema.methods.calculateSignificance = function() {
  // Simple Z-test for conversion rate difference
  const control = this.variants.find(v => v.isControl);
  const variant = this.variants.find(v => !v.isControl);
  
  if (!control || !variant) return null;
  
  const n1 = control.metrics.impressions;
  const n2 = variant.metrics.impressions;
  const p1 = control.metrics.conversionRate / 100;
  const p2 = variant.metrics.conversionRate / 100;
  
  if (n1 < 30 || n2 < 30) return null; // Not enough data
  
  const pooledP = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
  const se = Math.sqrt(pooledP * (1 - pooledP) * ((1/n1) + (1/n2)));
  const z = (p2 - p1) / se;
  
  // Calculate p-value
  const pValue = 2 * (1 - this.normalCDF(Math.abs(z)));
  
  // Calculate confidence interval
  const marginOfError = 1.96 * se; // 95% confidence
  const difference = p2 - p1;
  
  return {
    zScore: z,
    pValue: pValue,
    isSignificant: pValue < (1 - this.config.confidenceLevel / 100),
    improvementPercentage: ((p2 - p1) / p1) * 100,
    confidenceInterval: {
      lower: (difference - marginOfError) * 100,
      upper: (difference + marginOfError) * 100
    }
  };
};

// Normal CDF approximation
abTestSchema.methods.normalCDF = function(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2.0);
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return 0.5 * (1.0 + sign * y);
};

// Complete test
abTestSchema.methods.completeTest = function() {
  const significance = this.calculateSignificance();
  
  if (significance && significance.isSignificant) {
    const control = this.variants.find(v => v.isControl);
    const variant = this.variants.find(v => !v.isControl);
    
    this.results.winner = variant.metrics.conversionRate > control.metrics.conversionRate ? 
      variant.id : control.id;
    this.results.winnerDeclaredAt = new Date();
    this.results.statisticalSignificance = this.config.confidenceLevel;
    this.results.improvementPercentage = significance.improvementPercentage;
    this.results.confidenceInterval = significance.confidenceInterval;
    this.results.pValue = significance.pValue;
  }
  
  // Calculate summary
  this.results.summary = {
    totalImpressions: this.variants.reduce((sum, v) => sum + v.metrics.impressions, 0),
    totalConversions: this.variants.reduce((sum, v) => sum + v.metrics.conversions, 0),
    totalRevenue: this.variants.reduce((sum, v) => sum + v.metrics.revenue, 0),
    averageConversionRate: this.variants.reduce((sum, v) => sum + v.metrics.conversionRate, 0) / this.variants.length,
    testDuration: this.ageInDays
  };
  
  this.status = 'completed';
  this.schedule.completedAt = new Date();
  
  return this.save();
};

// Static Methods

// Find active tests
abTestSchema.statics.findActive = function() {
  return this.find({
    status: 'running',
    $or: [
      { 'schedule.endDate': { $exists: false } },
      { 'schedule.endDate': { $gt: new Date() } }
    ]
  });
};

// Find tests ready for completion
abTestSchema.statics.findReadyForCompletion = function() {
  const now = new Date();
  return this.find({
    status: 'running',
    $or: [
      { 'schedule.endDate': { $lte: now } },
      {
        $and: [
          { 'schedule.startedAt': { $lte: new Date(now - 7 * 24 * 60 * 60 * 1000) } }, // Min 7 days
          { hasEnoughData: true }
        ]
      }
    ]
  });
};

// Pre-save middleware
abTestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure control variant exists
  if (!this.variants.some(v => v.isControl)) {
    this.variants[0].isControl = true;
  }
  
  next();
});

const ABTest = mongoose.model('ABTest', abTestSchema);

module.exports = ABTest;