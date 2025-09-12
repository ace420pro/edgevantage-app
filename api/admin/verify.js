// api/admin/verify.js - Verify admin token
import jwt from 'jsonwebtoken';
import { connectToDatabase, getCollection } from '../lib/database.js';
import { setCorsHeaders, setSecurityHeaders, handleOptions } from '../lib/middleware.js';
import { asyncHandler } from '../lib/errors.js';

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

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET);
    
    // Get admin collection
    const adminsCollection = await getCollection('admins');
    
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
  }
});