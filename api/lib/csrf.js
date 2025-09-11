import crypto from 'crypto';

// CSRF token management
const csrfTokens = new Map();
const CSRF_TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

let lastCleanup = Date.now();

// Clean up expired CSRF tokens
function cleanupExpiredTokens() {
  const now = Date.now();
  
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }
  
  let deletedCount = 0;
  for (const [token, data] of csrfTokens.entries()) {
    if (now - data.createdAt > CSRF_TOKEN_TTL) {
      csrfTokens.delete(token);
      deletedCount++;
    }
  }
  
  lastCleanup = now;
  
  if (deletedCount > 0) {
    console.log(`🧹 Cleaned up ${deletedCount} expired CSRF tokens`);
  }
}

// Generate a new CSRF token
export function generateCSRFToken(sessionId = null) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  
  csrfTokens.set(token, {
    createdAt: now,
    sessionId: sessionId,
    used: false
  });
  
  // Periodic cleanup
  cleanupExpiredTokens();
  
  return token;
}

// Verify CSRF token
export function verifyCSRFToken(token, sessionId = null) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const tokenData = csrfTokens.get(token);
  
  if (!tokenData) {
    return false;
  }
  
  // Check if token has expired
  if (Date.now() - tokenData.createdAt > CSRF_TOKEN_TTL) {
    csrfTokens.delete(token);
    return false;
  }
  
  // Check session binding if provided
  if (sessionId && tokenData.sessionId && tokenData.sessionId !== sessionId) {
    return false;
  }
  
  // Mark token as used (optional: implement single-use tokens)
  // tokenData.used = true;
  
  return true;
}

// Invalidate a CSRF token
export function invalidateCSRFToken(token) {
  return csrfTokens.delete(token);
}

// CSRF protection middleware
export function csrfProtection(req, res, next) {
  // Skip CSRF protection for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF protection for public endpoints
  const publicEndpoints = [
    '/api/leads', // Lead submission should be public
    '/api/health'
  ];
  
  if (publicEndpoints.some(endpoint => req.url.startsWith(endpoint))) {
    return next();
  }
  
  // Get CSRF token from header or body
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token) {
    return res.status(403).json({
      error: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING'
    });
  }
  
  // Get session ID from user data (if authenticated)
  const sessionId = req.user?.userId?.toString() || null;
  
  if (!verifyCSRFToken(token, sessionId)) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }
  
  next();
}

// Generate CSRF token endpoint
export function generateCSRFEndpoint(req, res) {
  try {
    const sessionId = req.user?.userId?.toString() || null;
    const token = generateCSRFToken(sessionId);
    
    return res.status(200).json({
      csrfToken: token,
      expiresIn: CSRF_TOKEN_TTL / 1000 // seconds
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate CSRF token'
    });
  }
}

export default {
  generateCSRFToken,
  verifyCSRFToken,
  invalidateCSRFToken,
  csrfProtection,
  generateCSRFEndpoint
};