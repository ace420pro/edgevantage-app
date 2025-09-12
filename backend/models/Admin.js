const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 4,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  permissions: [{
    type: String,
    enum: ['read_leads', 'write_leads', 'delete_leads', 'read_affiliates', 'write_affiliates', 'admin_settings']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
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

// Index for performance
adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });

// Virtual for checking if account is locked
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }
  
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    if (isMatch) {
      // Reset login attempts on successful login
      if (this.loginAttempts > 0) {
        await this.updateOne({
          $unset: { loginAttempts: 1, lockUntil: 1 },
          $set: { lastLogin: new Date() }
        });
      } else {
        await this.updateOne({ $set: { lastLogin: new Date() } });
      }
      return true;
    } else {
      // Increment login attempts on failed login
      await this.incLoginAttempts();
      return false;
    }
  } catch (error) {
    throw error;
  }
};

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = async function() {
  const maxAttempts = 5;
  const lockTime = 15 * 60 * 1000; // 15 minutes
  
  // Check if we have a previous lock that has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return await this.updateOne(updates);
};

// Static method to create default admin
adminSchema.statics.createDefaultAdmin = async function() {
  try {
    const existingAdmin = await this.findOne({ role: 'superadmin' });
    if (existingAdmin) {
      console.log('✅ Default admin already exists');
      return existingAdmin;
    }

    const defaultAdmin = new this({
      username: process.env.DEFAULT_ADMIN_USERNAME || 'edgevantage_admin',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'EdgeVantage2024!Secure',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@edgevantagepro.com',
      role: 'superadmin',
      permissions: ['read_leads', 'write_leads', 'delete_leads', 'read_affiliates', 'write_affiliates', 'admin_settings']
    });

    await defaultAdmin.save();
    console.log('✅ Default admin created successfully');
    console.log(`   Username: ${defaultAdmin.username}`);
    console.log(`   Email: ${defaultAdmin.email}`);
    return defaultAdmin;
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    throw error;
  }
};

// Export the model
module.exports = mongoose.model('Admin', adminSchema);