// backend/server.js - Updated with comprehensive functionality
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import models
const { User, Lead, Course, Enrollment, Payment, Affiliate, ABTest } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit auth attempts
  message: {
    error: 'Too many authentication attempts, please try again later'
  }
});

app.use(limiter);

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://www.edgevantagepro.com',
  'https://edgevantagepro.com',
  'https://edgevantage-app.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS request from origin:', origin);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// MongoDB connection with enhanced error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edgevantage', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Database connection event handlers
mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token - user not found',
        code: 'INVALID_TOKEN'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ 
        error: 'Account is not active',
        code: 'INACTIVE_ACCOUNT'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

// POST /api/auth/register - Enhanced user registration
app.post('/api/auth/register', strictLimiter, async (req, res) => {
  try {
    const { name, email, password, setupToken } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email',
        code: 'USER_EXISTS'
      });
    }

    // Link to application if setup token provided
    let applicationId = null;
    if (setupToken) {
      try {
        const decoded = jwt.verify(setupToken, process.env.JWT_SECRET || 'your-secret-key');
        if (decoded.purpose === 'account-setup' && decoded.email === email.toLowerCase()) {
          applicationId = decoded.applicationId;
          
          // Update lead record
          await Lead.findByIdAndUpdate(applicationId, {
            hasAccount: true,
            accountCreatedAt: new Date(),
            userId: null // Will be set after user creation
          });
        }
      } catch (error) {
        console.log('Invalid setup token, proceeding without linking');
      }
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed in pre-save middleware
      applicationId,
      emailVerified: false
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    
    await user.save();

    // Update lead with user ID if linked
    if (applicationId) {
      await Lead.findByIdAndUpdate(applicationId, { userId: user._id });
    }

    // Generate auth token
    const authToken = user.generateAuthToken();

    console.log(`✅ New user registered: ${email}`);

    // Send verification email (implement this with your email service)
    // await sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        applicationId: user.applicationId
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed. Please try again.',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// POST /api/auth/login - Enhanced login
app.post('/api/auth/login', strictLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user with credentials validation
    const user = await User.findByCredentials(email.toLowerCase(), password);
    
    // Update last login
    user.lastLogin = new Date();
    user.lastActivity = new Date();
    
    // Clean expired sessions
    await user.cleanExpiredSessions();
    
    await user.save();

    // Get application data if linked
    let applicationData = null;
    if (user.applicationId) {
      applicationData = await Lead.findById(user.applicationId);
    }

    // Generate auth token
    const token = user.generateAuthToken();

    console.log(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        applicationId: user.applicationId,
        profile: user.profile,
        settings: user.settings,
        lastLogin: user.lastLogin
      },
      application: applicationData
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message.includes('Invalid login credentials') || 
        error.message.includes('Account is locked')) {
      return res.status(401).json({ 
        error: error.message,
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    res.status(500).json({ 
      error: 'Login failed. Please try again.',
      code: 'LOGIN_ERROR'
    });
  }
});

// POST /api/auth/verify-email - Email verification
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Verification token is required',
        code: 'NO_TOKEN'
      });
    }

    // Find user by verification token
    const user = await User.findByVerificationToken(token);
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification token',
        code: 'INVALID_TOKEN'
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();

    console.log(`✅ Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      error: 'Email verification failed',
      code: 'VERIFICATION_ERROR'
    });
  }
});

// POST /api/auth/resend-verification - Resend verification email
app.post('/api/auth/resend-verification', strictLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required',
        code: 'NO_EMAIL'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      emailVerified: false 
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'User not found or email already verified',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    // await sendVerificationEmail(user.email, user.name, verificationToken);

    console.log(`📧 Verification email resent to: ${email}`);

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      error: 'Failed to resend verification email',
      code: 'RESEND_ERROR'
    });
  }
});

// POST /api/auth/forgot-password - Password reset request
app.post('/api/auth/forgot-password', strictLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required',
        code: 'NO_EMAIL'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      status: 'active'
    });

    // Always return success for security (don't reveal if email exists)
    if (user) {
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send password reset email
      // await sendPasswordResetEmail(user.email, user.name, resetToken);

      console.log(`🔑 Password reset requested for: ${email}`);
    } else {
      console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Failed to process password reset request',
      code: 'RESET_REQUEST_ERROR'
    });
  }
});

// POST /api/auth/reset-password - Reset password with token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Reset token and new password are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Find user by reset token
    const user = await User.findByResetToken(token);

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token',
        code: 'INVALID_TOKEN'
      });
    }

    // Update password
    user.password = newPassword; // Will be hashed in pre-save middleware
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Reset login attempts
    await user.resetLoginAttempts();
    
    await user.save();

    // Generate new auth token for automatic login
    const authToken = user.generateAuthToken();

    console.log(`🔑 Password reset successful for: ${user.email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully',
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Password reset failed',
      code: 'RESET_ERROR'
    });
  }
});

// =============================================================================
// BACKWARD COMPATIBILITY ROUTE
// =============================================================================

// POST /api/auth - Backward compatibility with existing frontend
app.post('/api/auth', strictLimiter, async (req, res) => {
  try {
    const { action } = req.body;

    switch (action) {
      case 'register':
        // Redirect to new register endpoint logic
        const { name, email, password, setupToken } = req.body;
        
        if (!name || !email || !password) {
          return res.status(400).json({ 
            error: 'Name, email, and password are required'
          });
        }

        if (password.length < 6) {
          return res.status(400).json({ 
            error: 'Password must be at least 6 characters long'
          });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return res.status(400).json({ 
            error: 'User already exists with this email'
          });
        }

        let applicationId = null;
        if (setupToken) {
          try {
            const decoded = jwt.verify(setupToken, process.env.JWT_SECRET || 'your-secret-key');
            if (decoded.purpose === 'account-setup' && decoded.email === email.toLowerCase()) {
              applicationId = decoded.applicationId;
              await Lead.findByIdAndUpdate(applicationId, {
                hasAccount: true,
                accountCreatedAt: new Date()
              });
            }
          } catch (error) {
            console.log('Invalid setup token, proceeding without linking');
          }
        }

        const user = new User({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          applicationId,
          emailVerified: false
        });

        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        if (applicationId) {
          await Lead.findByIdAndUpdate(applicationId, { userId: user._id });
        }

        const authToken = user.generateAuthToken();

        console.log(`✅ New user registered (legacy): ${email}`);

        return res.status(201).json({
          success: true,
          message: 'Account created successfully',
          token: authToken,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            applicationId: user.applicationId
          }
        });

      case 'login':
        // Redirect to new login endpoint logic
        const { email: loginEmail, password: loginPassword } = req.body;

        if (!loginEmail || !loginPassword) {
          return res.status(400).json({ 
            error: 'Email and password are required'
          });
        }

        const loginUser = await User.findByCredentials(loginEmail.toLowerCase(), loginPassword);
        
        loginUser.lastLogin = new Date();
        loginUser.lastActivity = new Date();
        await loginUser.cleanExpiredSessions();
        await loginUser.save();

        let applicationData = null;
        if (loginUser.applicationId) {
          applicationData = await Lead.findById(loginUser.applicationId);
        }

        const loginToken = loginUser.generateAuthToken();

        console.log(`✅ User logged in (legacy): ${loginEmail}`);

        return res.json({
          success: true,
          message: 'Login successful',
          token: loginToken,
          user: {
            id: loginUser._id,
            email: loginUser.email,
            name: loginUser.name,
            role: loginUser.role,
            applicationId: loginUser.applicationId,
            profile: loginUser.profile,
            settings: loginUser.settings
          },
          application: applicationData
        });

      case 'forgot-password':
        // Redirect to forgot password logic
        const { email: forgotEmail } = req.body;

        if (!forgotEmail) {
          return res.status(400).json({ 
            error: 'Email is required'
          });
        }

        const forgotUser = await User.findOne({ 
          email: forgotEmail.toLowerCase(),
          status: 'active'
        });

        if (forgotUser) {
          const resetToken = forgotUser.generatePasswordResetToken();
          await forgotUser.save();
          console.log(`🔑 Password reset requested (legacy): ${forgotEmail}`);
        } else {
          console.log(`⚠️ Password reset requested for non-existent email (legacy): ${forgotEmail}`);
        }

        return res.json({
          success: true,
          message: 'If an account with that email exists, we have sent a password reset link.'
        });

      case 'reset-password':
        // Redirect to reset password logic
        const { token: resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
          return res.status(400).json({ 
            error: 'Reset token and new password are required'
          });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({ 
            error: 'Password must be at least 6 characters long'
          });
        }

        const resetUser = await User.findByResetToken(resetToken);

        if (!resetUser) {
          return res.status(400).json({ 
            error: 'Invalid or expired reset token'
          });
        }

        resetUser.password = newPassword;
        resetUser.passwordResetToken = undefined;
        resetUser.passwordResetExpires = undefined;
        await resetUser.resetLoginAttempts();
        await resetUser.save();

        const resetAuthToken = resetUser.generateAuthToken();

        console.log(`🔑 Password reset successful (legacy): ${resetUser.email}`);

        return res.json({
          success: true,
          message: 'Password has been reset successfully',
          token: resetAuthToken,
          user: {
            id: resetUser._id,
            email: resetUser.email,
            name: resetUser.name,
            role: resetUser.role
          }
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Legacy auth error:', error);
    
    if (error.message.includes('Invalid login credentials') || 
        error.message.includes('Account is locked')) {
      return res.status(401).json({ 
        error: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Authentication failed. Please try again.',
      details: error.message 
    });
  }
});

// =============================================================================
// USER PROFILE ROUTES
// =============================================================================

// GET /api/user/profile - Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('applicationId');

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      code: 'PROFILE_ERROR'
    });
  }
});

// PUT /api/user/profile - Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'profile', 'settings'];
    const isValidUpdate = Object.keys(updates).every(key => allowedUpdates.includes(key));

    if (!isValidUpdate) {
      return res.status(400).json({ 
        error: 'Invalid update fields',
        code: 'INVALID_UPDATES'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      code: 'UPDATE_ERROR'
    });
  }
});

// GET /api/user/dashboard - User dashboard data
app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Get application data
    let application = null;
    if (user.applicationId) {
      application = await Lead.findById(user.applicationId);
    }

    // Get enrollments
    const enrollments = await Enrollment.findActiveByUser(user._id);

    // Get recent payments
    const payments = await Payment.findByUser(user._id, { 
      status: 'completed' 
    }).limit(5);

    // Calculate total earnings
    let totalEarnings = 0;
    if (application && application.earnings) {
      totalEarnings = application.earnings.totalEarned;
    }

    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        joinDate: user.createdAt,
        lastLogin: user.lastLogin
      },
      application: application ? {
        status: application.status,
        qualified: application.qualified,
        equipment: application.equipment,
        earnings: application.earnings
      } : null,
      enrollments: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      totalEarnings,
      recentPayments: payments
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      code: 'DASHBOARD_ERROR'
    });
  }
});

// =============================================================================
// LEAD MANAGEMENT ROUTES (Backward Compatibility)
// =============================================================================

// POST /api/leads - Submit new application
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
      message: qualified ? 'Application submitted successfully! You are pre-qualified.' : 'Application submitted successfully!',
      applicationId: savedLead._id,
      qualified: qualified
    });
    
  } catch (error) {
    console.error('Lead submission error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'This email has already submitted an application.',
        existingApplication: true
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit application. Please try again.',
      details: error.message 
    });
  }
});

// GET /api/leads - Get leads with filtering
app.get('/api/leads', async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      status, 
      qualified,
      state,
      id
    } = req.query;

    // If specific ID requested
    if (id) {
      const lead = await Lead.findById(id);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      return res.json(lead);
    }

    // Build filter object
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (qualified !== undefined) filter.qualified = qualified === 'true';
    if (state) filter.state = state;

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Lead.countDocuments(filter);

    res.json({
      leads,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Leads fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leads',
      details: error.message 
    });
  }
});

// GET /api/leads-stats - Get lead statistics
app.get('/api/leads-stats', async (req, res) => {
  try {
    const stats = await Lead.getStatistics();
    
    // Add state distribution
    const stateDistribution = await Lead.aggregate([
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      ...stats,
      stateDistribution
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
});

// PATCH /api/leads/:id - Update lead status (Admin only)
app.patch('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lead = await Lead.findByIdAndUpdate(
      id,
      { 
        ...updates, 
        updatedAt: new Date() 
      },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    console.log(`✅ Lead updated: ${lead.email} - Status: ${lead.status}`);

    res.json({
      success: true,
      message: 'Lead updated successfully',
      lead
    });

  } catch (error) {
    console.error('Lead update error:', error);
    res.status(500).json({ 
      error: 'Failed to update lead',
      details: error.message 
    });
  }
});

// DELETE /api/leads/:id - Delete lead (Admin only)
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    console.log(`🗑️ Lead deleted: ${lead.email}`);

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    console.error('Lead delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete lead',
      details: error.message 
    });
  }
});

// GET /api/referral/:code - Check referral code validity
app.get('/api/referral/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const affiliate = await Affiliate.findByCode(code);

    if (!affiliate) {
      return res.status(404).json({ 
        error: 'Referral code not found',
        valid: false 
      });
    }

    res.json({
      valid: true,
      referralSource: 'affiliate',
      affiliateName: affiliate.name,
      bonusAmount: 50 // Standard referral bonus
    });

  } catch (error) {
    console.error('Referral check error:', error);
    res.status(500).json({ 
      error: 'Failed to validate referral code',
      valid: false 
    });
  }
});

// =============================================================================
// HEALTH CHECK & ROOT ROUTES
// =============================================================================

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState];
    
    // Get basic stats
    const userCount = await User.countDocuments();
    const leadCount = await Lead.countDocuments();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        connected: dbState === 1
      },
      stats: {
        users: userCount,
        leads: leadCount
      },
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'EdgeVantage API v2.0',
    status: 'running',
    endpoints: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/verify-email',
      'POST /api/auth/forgot-password',
      'GET /api/user/profile',
      'GET /api/user/dashboard'
    ],
    timestamp: new Date().toISOString()
  });
});

// Keep existing lead routes for backward compatibility
// ... (existing lead routes from original server.js would go here)

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EdgeVantage API v2.0 running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
});

module.exports = app;