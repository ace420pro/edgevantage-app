import { ObjectId } from 'mongodb';
import { verifyPassword, generateToken } from './lib/auth.js';
import { getCollection } from './lib/database.js';
import { 
  setCorsHeaders, 
  setSecurityHeaders, 
  handleOptions, 
  authRateLimit 
} from './lib/middleware.js';
import { 
  asyncHandler, 
  validateRequired,
  validateEmail,
  APIError,
  ErrorTypes
} from './lib/errors.js';

export default asyncHandler(async function handler(req, res) {
  // Set security headers
  setCorsHeaders(res, req);
  setSecurityHeaders(res);

  // Handle preflight
  if (handleOptions(req, res)) return;

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST']
    });
  }

  // Check auth-specific rate limiting
  if (authRateLimit(req, res)) return;

  try {
    // Validate required fields
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Get user from database
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!user) {
      // Perform dummy password verification to prevent timing attacks
      await verifyPassword(password, '$2a$10$dummy.hash.to.prevent.timing.attacks');
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({ 
        error: 'Account is not active',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Update last login time
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLoginAt: new Date(),
          lastLoginIp: req.ip || req.connection.remoteAddress
        } 
      }
    );

    console.log(`✅ User logged in: ${user.email} (${user.role})`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLoginAt: new Date()
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed. Please try again.',
      code: 'AUTH_ERROR'
    });
  }
});