// api/admin/verify.js - Verify admin token
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  let client = null;
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET);
    
    // Connect to MongoDB
    client = await connectToMongoDB();
    const db = client.db('edgevantage');
    const adminsCollection = db.collection('admins');
    
    // Find admin to ensure they still exist and are active
    const admin = await adminsCollection.findOne({ 
      _id: decoded.adminId,
      isActive: { $ne: false }
    });

    if (!admin) {
      return res.status(403).json({ error: 'Admin account not found or inactive' });
    }

    return res.status(200).json({
      valid: true,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role || 'admin',
        lastLogin: admin.lastLogin
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    
    console.error('❌ Token verification error:', error);
    return res.status(500).json({ error: 'Token verification failed' });
  } finally {
    // Always close the connection
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
});