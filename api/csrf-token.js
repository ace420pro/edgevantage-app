import { generateCSRFEndpoint } from './lib/csrf.js';
import { optionalAuth } from './lib/auth-middleware.js';
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

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['GET']
    });
  }

  try {
    // Optional authentication (works for both authenticated and guest users)
    await new Promise((resolve, reject) => {
      optionalAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Generate and return CSRF token
    return generateCSRFEndpoint(req, res);

  } catch (error) {
    console.error('CSRF token endpoint error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate CSRF token'
    });
  }
});