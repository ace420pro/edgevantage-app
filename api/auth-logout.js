import { revokeToken } from './lib/auth.js';
import { requireAuth } from './lib/auth-middleware.js';
import { 
  setCorsHeaders, 
  setSecurityHeaders, 
  handleOptions 
} from './lib/middleware.js';
import { asyncHandler } from './lib/errors.js';

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

  try {
    // Require authentication
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      // Add token to blacklist
      revokeToken(token);
      console.log(`✅ User logged out: ${req.user.email}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      error: 'Logout failed. Please try again.',
      code: 'LOGOUT_ERROR'
    });
  }
});