import { MongoClient, ObjectId } from 'mongodb';
import { hashPassword, verifyPassword, generateToken, verifyToken, generateResetToken } from './lib/auth.js';
import { sendEmail } from './lib/email-service.js';

const MONGODB_URI = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.body;

  try {
    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const usersCollection = db.collection('users');
    const leadsCollection = db.collection('leads');

    switch (action) {
      case 'register':
        return await handleRegister(req, res, usersCollection, leadsCollection);
      case 'login':
        return await handleLogin(req, res, usersCollection, leadsCollection);
      case 'forgot-password':
        return await handleForgotPassword(req, res, usersCollection);
      case 'reset-password':
        return await handleResetPassword(req, res, usersCollection);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed. Please try again.',
      details: error.message 
    });
  }
}

async function handleRegister(req, res, usersCollection, leadsCollection) {
  const { email, password, name, setupToken } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists with this email' });
  }

  // If setup token provided, verify it and link to application
  let applicationId = null;
  if (setupToken) {
    try {
      const decoded = verifyToken(setupToken);
      if (decoded.purpose === 'account-setup' && decoded.email === email) {
        applicationId = decoded.applicationId;
        
        // Update lead record with user account created flag
        await leadsCollection.updateOne(
          { _id: new ObjectId(applicationId) },
          { 
            $set: { 
              hasAccount: true,
              accountCreatedAt: new Date()
            } 
          }
        );
      }
    } catch (error) {
      console.log('Invalid setup token, proceeding without linking to application');
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = {
    email,
    password: hashedPassword,
    name,
    role: 'user',
    applicationId,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: false,
    profile: {
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    settings: {
      emailNotifications: true,
      smsNotifications: false
    }
  };

  const result = await usersCollection.insertOne(user);

  // Generate auth token
  const token = generateToken(result.insertedId.toString(), email, 'user');

  console.log(`✅ New user registered: ${email}`);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: {
      id: result.insertedId,
      email: user.email,
      name: user.name,
      role: user.role,
      applicationId: user.applicationId
    }
  });
}

async function handleLogin(req, res, usersCollection, leadsCollection) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user
  const user = await usersCollection.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Update last login
  await usersCollection.updateOne(
    { _id: user._id },
    { 
      $set: { 
        lastLoginAt: new Date() 
      } 
    }
  );

  // Get application data if linked
  let applicationData = null;
  if (user.applicationId) {
    applicationData = await leadsCollection.findOne({ 
      _id: new ObjectId(user.applicationId) 
    });
  }

  // Generate auth token
  const token = generateToken(user._id.toString(), email, user.role);

  console.log(`✅ User logged in: ${email}`);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      applicationId: user.applicationId,
      emailVerified: user.emailVerified,
      profile: user.profile,
      settings: user.settings
    },
    application: applicationData
  });
}

async function handleForgotPassword(req, res, usersCollection) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user by email
  const user = await usersCollection.findOne({ email: email.toLowerCase() });
  
  // Always return success for security (don't reveal if email exists)
  // But only send email if user actually exists
  if (user) {
    // Generate reset token (expires in 1 hour)
    const resetToken = generateResetToken(user.email);
    
    // Store reset token in database with expiration
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken: resetToken,
          resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
          updatedAt: new Date()
        } 
      }
    );

    // Send password reset email
    sendEmail(user.email, 'passwordReset', {
      name: user.name,
      email: user.email,
      resetToken: resetToken
    }).catch(error => {
      console.error('Failed to send password reset email:', error);
    });

    console.log(`✅ Password reset requested for: ${user.email}`);
  } else {
    console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
  }

  // Always return success message to prevent email enumeration
  return res.status(200).json({
    success: true,
    message: 'If an account with that email exists, we have sent a password reset link. Please check your email (including spam folder).'
  });
}

async function handleResetPassword(req, res, usersCollection) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  // Verify the reset token
  let decoded;
  try {
    decoded = verifyToken(token);
    if (decoded.purpose !== 'password-reset') {
      throw new Error('Invalid token purpose');
    }
  } catch (error) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  // Find user with valid reset token
  const user = await usersCollection.findOne({
    email: decoded.email,
    resetToken: token,
    resetTokenExpires: { $gt: new Date() } // Token must not be expired
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user with new password and clear reset token
  await usersCollection.updateOne(
    { _id: user._id },
    { 
      $set: { 
        password: hashedPassword,
        updatedAt: new Date()
      },
      $unset: {
        resetToken: 1,
        resetTokenExpires: 1
      }
    }
  );

  // Generate new auth token for automatic login
  const authToken = generateToken(user._id.toString(), user.email, user.role);

  console.log(`✅ Password reset successful for: ${user.email}`);

  return res.status(200).json({
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
}