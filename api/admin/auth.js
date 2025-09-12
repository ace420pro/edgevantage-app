// api/admin/auth.js - Admin authentication endpoint
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import { setCorsHeaders, setSecurityHeaders, handleOptions } from '../lib/middleware.js';
import { asyncHandler } from '../lib/errors.js';

// Simple database connection for this endpoint
async function connectToMongoDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    retryWrites: true,
    retryReads: true
  });

  await client.connect();
  return client;
}

export default asyncHandler(async function handler(req, res) {
  // Set security headers
  setCorsHeaders(res, req);
  setSecurityHeaders(res);

  // Handle preflight
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  let client = null;
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB for admin auth...');
    client = await connectToMongoDB();
    const db = client.db('edgevantage');
    const adminsCollection = db.collection('admins');
    
    console.log(`Looking for admin with username: ${username}`);
    
    // Find admin by username
    const admin = await adminsCollection.findOne({ 
      username: username.toLowerCase().trim() 
    });
    
    console.log(`Admin found: ${admin ? 'YES' : 'NO'}`);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.lockUntil && admin.lockUntil > new Date()) {
      return res.status(423).json({ 
        error: 'Account temporarily locked due to multiple failed attempts' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      // Increment login attempts
      const loginAttempts = (admin.loginAttempts || 0) + 1;
      const updates = { 
        loginAttempts,
        updatedAt: new Date()
      };

      // Lock account if too many attempts
      if (loginAttempts >= 5) {
        updates.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await adminsCollection.updateOne(
        { _id: admin._id },
        { $set: updates }
      );

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login - reset attempts and update last login
    await adminsCollection.updateOne(
      { _id: admin._id },
      { 
        $unset: { loginAttempts: 1, lockUntil: 1 },
        $set: { 
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id.toString(),
        username: admin.username,
        role: admin.role || 'admin',
        email: admin.email
      },
      process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log('✅ Admin login successful:', admin.username);

    return res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role || 'admin',
        lastLogin: admin.lastLogin
      }
    });

  } catch (error) {
    console.error('❌ Admin auth error:', error);
    return res.status(500).json({ 
      error: 'Authentication service unavailable',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Always close the connection
    if (client) {
      try {
        await client.close();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
});