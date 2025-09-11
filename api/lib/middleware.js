// Security and middleware utilities for all API endpoints

export function setCorsHeaders(res, req, allowedOrigins = [
  'https://edgevantagepro.com',
  'https://www.edgevantagepro.com', 
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]) {
  const requestOrigin = req?.headers?.origin;
  
  // In development, allow localhost variations
  if (process.env.NODE_ENV === 'development') {
    const devOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001'
    ];
    
    if (requestOrigin && devOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    } else if (!requestOrigin) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else {
      res.setHeader('Access-Control-Allow-Origin', 'null');
    }
  } else {
    // Production: strict origin checking
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', 'null');
    }
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
}

export function setSecurityHeaders(res, options = {}) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection (though deprecated, still good for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Prevent referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove server information
  res.setHeader('Server', '');
  res.setHeader('X-Powered-By', '');
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()'
  );
  
  // Enhanced Content Security Policy
  const cspParts = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: http:",
    "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests"
  ];
  
  // More restrictive CSP for admin endpoints
  if (options.adminEndpoint) {
    const adminCspParts = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'"
    ];
    res.setHeader('Content-Security-Policy', adminCspParts.join('; '));
  } else {
    res.setHeader('Content-Security-Policy', cspParts.join('; '));
  }
  
  // Cache control for security
  if (options.noCache) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, req);
    setSecurityHeaders(res);
    return res.status(200).end();
  }
  return false;
}

export function handleMethodNotAllowed(req, res, allowedMethods = ['POST']) {
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: allowedMethods,
      received: req.method 
    });
  }
  return false;
}

// Rate limiting implementation with improved memory management
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // requests per window
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup every 5 minutes

// Cleanup expired entries periodically
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  
  // Only cleanup if enough time has passed
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }
  
  let deletedCount = 0;
  for (const [clientKey, data] of requestCounts.entries()) {
    if (now - data.windowStart > RATE_LIMIT_WINDOW) {
      requestCounts.delete(clientKey);
      deletedCount++;
    }
  }
  
  lastCleanup = now;
  
  if (deletedCount > 0) {
    console.log(`🧹 Cleaned up ${deletedCount} expired rate limit entries`);
  }
}

export function rateLimit(req, res, identifier = null, options = {}) {
  // Skip rate limiting in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !options.enforceInDev) {
    return false;
  }

  const key = identifier || `${req.ip || req.connection.remoteAddress || 'unknown'}:${req.headers['user-agent'] || 'unknown'}`;
  const now = Date.now();
  const windowMs = options.windowMs || RATE_LIMIT_WINDOW;
  const maxRequests = options.max || MAX_REQUESTS;
  
  // Periodic cleanup
  cleanupExpiredEntries();
  
  // Get or create client record
  let clientData = requestCounts.get(key);
  if (!clientData || now - clientData.windowStart > windowMs) {
    clientData = { count: 0, windowStart: now, ip: req.ip };
    requestCounts.set(key, clientData);
  }
  
  clientData.count++;
  clientData.lastSeen = now;
  
  // Check if limit exceeded
  if (clientData.count > maxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - clientData.windowStart)) / 1000);
    
    // Log rate limit violation
    console.warn(`🚫 Rate limit exceeded for ${key}: ${clientData.count}/${maxRequests} requests`);
    
    res.status(429).json({
      error: 'Too many requests',
      message: `You have exceeded the rate limit of ${maxRequests} requests per ${windowMs / 1000} seconds`,
      retryAfter: retryAfter,
      limit: maxRequests,
      window: windowMs / 1000,
      current: clientData.count,
      resetTime: new Date(clientData.windowStart + windowMs).toISOString()
    });
    return true; // Rate limited
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - clientData.count));
  res.setHeader('X-RateLimit-Reset', new Date(clientData.windowStart + windowMs).toISOString());
  res.setHeader('X-RateLimit-Window', windowMs / 1000);
  
  return false; // Not rate limited
}

// Enhanced rate limiting for authentication endpoints
export function authRateLimit(req, res) {
  const email = req.body?.email ? req.body.email.toLowerCase().trim() : 'unknown';
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Create separate identifiers for email and IP-based limiting
  const emailIdentifier = `auth:email:${email}`;
  const ipIdentifier = `auth:ip:${ip}`;
  
  const authOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    enforceInDev: true // Always enforce auth rate limiting
  };
  
  // Check both email and IP-based rate limiting
  const emailLimited = rateLimit(req, res, emailIdentifier, authOptions);
  if (emailLimited) {
    console.warn(`🚫 Auth rate limit exceeded for email: ${email}`);
    return true;
  }
  
  const ipLimited = rateLimit(req, res, ipIdentifier, {
    ...authOptions,
    max: 20 // Allow more attempts per IP (multiple users)
  });
  
  if (ipLimited) {
    console.warn(`🚫 Auth rate limit exceeded for IP: ${ip}`);
    return true;
  }
  
  return false; // Not rate limited
}

export default {
  setCorsHeaders,
  setSecurityHeaders,
  handleOptions,
  handleMethodNotAllowed,
  rateLimit,
  authRateLimit
};