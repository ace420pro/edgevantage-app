import { ObjectId } from 'mongodb';
import { verifyToken } from './auth.js';
import { getCollection } from './database.js';

// Authentication middleware for API endpoints
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication token is required',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    // Get user from database to ensure they still exist
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(decoded.userId),
      email: decoded.email 
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'User account not found or has been deactivated',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return res.status(401).json({ 
        error: 'User account is not active',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role || 'user',
      name: user.name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.message.includes('expired')) {
      return res.status(401).json({ 
        error: 'Authentication token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message.includes('revoked')) {
      return res.status(401).json({ 
        error: 'Authentication token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }
    
    return res.status(401).json({ 
      error: 'Invalid authentication token',
      code: 'INVALID_TOKEN'
    });
  }
}

// Admin role requirement middleware
export async function requireAdmin(req, res, next) {
  try {
    // First check authentication
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Admin privileges required',
        code: 'INSUFFICIENT_PRIVILEGES'
      });
    }

    next();
  } catch (error) {
    // Error already handled by requireAuth
    return;
  }
}

// Optional authentication (allows both authenticated and guest users)
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token, but don't fail if invalid
    try {
      const decoded = verifyToken(token);
      const usersCollection = await getCollection('users');
      const user = await usersCollection.findOne({ 
        _id: new ObjectId(decoded.userId),
        email: decoded.email 
      });

      req.user = user ? {
        userId: user._id,
        email: user.email,
        role: user.role || 'user',
        name: user.name
      } : null;
    } catch (error) {
      // Invalid token, but that's okay for optional auth
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error.message);
    req.user = null;
    next();
  }
}

export default {
  requireAuth,
  requireAdmin,
  optionalAuth
};