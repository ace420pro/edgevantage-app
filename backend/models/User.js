const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Schema - Enhanced with all necessary fields
const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Profile Information
  profile: {
    phone: {
      type: String,
      default: ''
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'US'
      }
    },
    avatar: String,
    bio: String,
    dateOfBirth: Date
  },
  
  // Application Reference
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['user', 'admin', 'affiliate', 'moderator'],
    default: 'user'
  },
  permissions: [{
    type: String
  }],
  
  // Account Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'banned'],
    default: 'active'
  },
  
  // Email Verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Two-Factor Authentication (future implementation)
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  
  // Session Management
  sessions: [{
    token: String,
    deviceInfo: String,
    ipAddress: String,
    createdAt: Date,
    expiresAt: Date,
    lastActivity: Date
  }],
  
  // Settings
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    marketingEmails: {
      type: Boolean,
      default: true
    },
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // Activity Tracking
  lastLogin: Date,
  lastActivity: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Affiliate Information (if user is also an affiliate)
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate'
  },
  
  // Course Enrollments
  enrollments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment'
  }],
  
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

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.profile.address) return '';
  const { street, city, state, zipCode } = this.profile.address;
  return `${street}, ${city}, ${state} ${zipCode}`.trim();
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'sessions.token': 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Instance Methods

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { 
      _id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  return token;
};

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.emailVerificationToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Clean expired sessions
userSchema.methods.cleanExpiredSessions = function() {
  this.sessions = this.sessions.filter(session => 
    session.expiresAt > new Date()
  );
  return this.save();
};

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Update timestamp
  this.updatedAt = Date.now();
  
  next();
});

// Static Methods

// Find by credentials
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email, status: 'active' });
  
  if (!user) {
    throw new Error('Invalid login credentials');
  }
  
  if (user.isLocked()) {
    throw new Error('Account is locked due to too many failed login attempts');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error('Invalid login credentials');
  }
  
  await user.resetLoginAttempts();
  return user;
};

// Find by verification token
userSchema.statics.findByVerificationToken = async function(token) {
  const hashedToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
  return await this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });
};

// Find by reset token
userSchema.statics.findByResetToken = async function(token) {
  const hashedToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
  return await this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;