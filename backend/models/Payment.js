const mongoose = require('mongoose');

// Payment Schema - Comprehensive payment tracking
const paymentSchema = new mongoose.Schema({
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  
  // Payment Type
  type: {
    type: String,
    enum: ['course', 'subscription', 'affiliate_payout', 'refund', 'equipment_earnings'],
    required: true
  },
  
  // Related References
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Course', 'Enrollment', 'Affiliate', 'Lead']
  },
  
  // Payment Method
  method: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer', 'credit_card', 'debit_card', 'crypto', 'manual'],
    required: true
  },
  
  // Transaction Details
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  processorTransactionId: String, // Stripe/PayPal transaction ID
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  // Payment Metadata
  metadata: {
    // Stripe/PayPal specific data
    paymentIntentId: String,
    customerId: String,
    paymentMethodId: String,
    chargeId: String,
    
    // Card details (last 4 digits only)
    cardLast4: String,
    cardBrand: String,
    cardExpMonth: Number,
    cardExpYear: Number,
    
    // Billing Information
    billingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    
    // Additional info
    description: String,
    invoiceId: String,
    receiptUrl: String,
    statementDescriptor: String
  },
  
  // Refund Information
  refund: {
    amount: {
      type: Number,
      default: 0
    },
    reason: String,
    refundedAt: Date,
    refundTransactionId: String
  },
  
  // Fees & Net Amount
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    applicationFee: {
      type: Number,
      default: 0
    },
    platformFee: {
      type: Number,
      default: 0
    }
  },
  netAmount: {
    type: Number,
    default: 0
  },
  
  // Payment Plan (for installments)
  paymentPlan: {
    type: {
      type: String,
      enum: ['full', 'installment']
    },
    installmentNumber: Number,
    totalInstallments: Number,
    nextPaymentDate: Date,
    subscriptionId: String
  },
  
  // Timestamps
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Error Handling
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  },
  
  // Retry Information
  retryCount: {
    type: Number,
    default: 0
  },
  lastRetryAt: Date,
  nextRetryAt: Date,
  
  // Webhook Events
  webhookEvents: [{
    eventId: String,
    eventType: String,
    receivedAt: Date,
    processed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Notes
  internalNotes: String,
  customerNotes: String
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ userId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ processorTransactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ 'metadata.paymentIntentId': 1 });
paymentSchema.index({ 'metadata.customerId': 1 });

// Virtual Properties

// Check if payment can be refunded
paymentSchema.virtual('canRefund').get(function() {
  return this.status === 'completed' && 
         this.refund.amount < this.amount &&
         this.method !== 'manual';
});

// Calculate remaining refundable amount
paymentSchema.virtual('refundableAmount').get(function() {
  return this.amount - this.refund.amount;
});

// Check if payment is overdue (for installments)
paymentSchema.virtual('isOverdue').get(function() {
  if (this.paymentPlan.type !== 'installment') return false;
  if (this.status === 'completed') return false;
  return this.paymentPlan.nextPaymentDate && 
         this.paymentPlan.nextPaymentDate < new Date();
});

// Instance Methods

// Process payment completion
paymentSchema.methods.markCompleted = function(processorData = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.processedAt = this.processedAt || new Date();
  
  if (processorData.transactionId) {
    this.processorTransactionId = processorData.transactionId;
  }
  
  if (processorData.receiptUrl) {
    this.metadata.receiptUrl = processorData.receiptUrl;
  }
  
  // Calculate net amount
  const totalFees = (this.fees.processingFee || 0) + 
                   (this.fees.applicationFee || 0) + 
                   (this.fees.platformFee || 0);
  this.netAmount = this.amount - totalFees;
  
  return this.save();
};

// Mark payment as failed
paymentSchema.methods.markFailed = function(error) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.error = {
    code: error.code || 'unknown_error',
    message: error.message || 'Payment failed',
    details: error.details || {}
  };
  
  // Schedule retry if applicable
  if (this.retryCount < 3) {
    this.nextRetryAt = new Date(Date.now() + (Math.pow(2, this.retryCount) * 3600000)); // Exponential backoff
  }
  
  return this.save();
};

// Process refund
paymentSchema.methods.processRefund = async function(amount, reason) {
  if (!this.canRefund) {
    throw new Error('Payment cannot be refunded');
  }
  
  if (amount > this.refundableAmount) {
    throw new Error('Refund amount exceeds refundable amount');
  }
  
  this.refund.amount += amount;
  this.refund.reason = reason;
  this.refund.refundedAt = new Date();
  
  if (this.refund.amount >= this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }
  
  return this.save();
};

// Retry payment
paymentSchema.methods.retry = function() {
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  this.status = 'processing';
  this.error = null;
  
  return this.save();
};

// Add webhook event
paymentSchema.methods.addWebhookEvent = function(eventData) {
  this.webhookEvents.push({
    eventId: eventData.id,
    eventType: eventData.type,
    receivedAt: new Date(),
    processed: false
  });
  
  return this.save();
};

// Calculate fees based on payment method and amount
paymentSchema.methods.calculateFees = function() {
  let processingFee = 0;
  let platformFee = 0;
  
  // Calculate processing fee based on method
  switch (this.method) {
    case 'stripe':
    case 'credit_card':
    case 'debit_card':
      processingFee = (this.amount * 0.029) + 0.30; // 2.9% + $0.30
      break;
    case 'paypal':
      processingFee = (this.amount * 0.034) + 0.49; // 3.4% + $0.49
      break;
    case 'bank_transfer':
      processingFee = 0.25; // Flat fee
      break;
    case 'crypto':
      processingFee = this.amount * 0.01; // 1%
      break;
  }
  
  // Platform fee (EdgeVantage fee)
  if (this.type === 'course') {
    platformFee = this.amount * 0.10; // 10% platform fee
  } else if (this.type === 'affiliate_payout') {
    platformFee = 0; // No fee on payouts
  }
  
  this.fees.processingFee = Math.round(processingFee * 100) / 100;
  this.fees.platformFee = Math.round(platformFee * 100) / 100;
  this.netAmount = this.amount - this.fees.processingFee - this.fees.platformFee;
  
  return this.fees;
};

// Static Methods

// Find payments by user
paymentSchema.statics.findByUser = function(userId, filter = {}) {
  return this.find({
    userId,
    ...filter
  }).sort('-createdAt');
};

// Get revenue statistics
paymentSchema.statics.getRevenueStats = async function(startDate, endDate) {
  const match = {
    status: 'completed',
    type: { $in: ['course', 'subscription'] }
  };
  
  if (startDate && endDate) {
    match.completedAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalFees: { 
          $sum: { 
            $add: ['$fees.processingFee', '$fees.platformFee'] 
          } 
        },
        netRevenue: { $sum: '$netAmount' },
        transactionCount: { $sum: 1 },
        averageTransaction: { $avg: '$amount' },
        refundedAmount: { $sum: '$refund.amount' }
      }
    },
    {
      $project: {
        _id: 0,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        totalFees: { $round: ['$totalFees', 2] },
        netRevenue: { $round: ['$netRevenue', 2] },
        transactionCount: 1,
        averageTransaction: { $round: ['$averageTransaction', 2] },
        refundedAmount: { $round: ['$refundedAmount', 2] }
      }
    }
  ]);
  
  return stats[0] || {
    totalRevenue: 0,
    totalFees: 0,
    netRevenue: 0,
    transactionCount: 0,
    averageTransaction: 0,
    refundedAmount: 0
  };
};

// Get pending payments that need processing
paymentSchema.statics.getPendingPayments = function() {
  return this.find({
    status: 'pending',
    nextRetryAt: { $lte: new Date() }
  }).sort('createdAt');
};

// Get failed payments for retry
paymentSchema.statics.getFailedForRetry = function() {
  return this.find({
    status: 'failed',
    retryCount: { $lt: 3 },
    nextRetryAt: { $lte: new Date() }
  }).sort('nextRetryAt');
};

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Generate transaction ID if not provided
  if (!this.transactionId) {
    this.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  // Calculate fees if not set
  if (!this.fees.processingFee && !this.fees.platformFee) {
    this.calculateFees();
  }
  
  this.updatedAt = Date.now();
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;