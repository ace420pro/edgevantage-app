// Security and middleware utilities for all API endpoints

export function setCorsHeaders(res, allowedOrigins = ['https://edgevantagepro.com', 'http://localhost:3000']) {
  const origin = process.env.NODE_ENV === 'development' 
    ? '*' // Allow all origins in development
    : allowedOrigins.join(', ');
    
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function setSecurityHeaders(res) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Prevent referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (basic)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
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

// Rate limiting implementation (simple in-memory store)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // requests per window

export function rateLimit(req, res, identifier = null) {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return false;
  }

  const key = identifier || req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Clean up old entries
  for (const [clientKey, data] of requestCounts.entries()) {
    if (now - data.windowStart > RATE_LIMIT_WINDOW) {
      requestCounts.delete(clientKey);
    }
  }
  
  // Get or create client record
  let clientData = requestCounts.get(key);
  if (!clientData || now - clientData.windowStart > RATE_LIMIT_WINDOW) {
    clientData = { count: 0, windowStart: now };
    requestCounts.set(key, clientData);
  }
  
  clientData.count++;
  
  // Check if limit exceeded
  if (clientData.count > MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - clientData.windowStart)) / 1000),
      limit: MAX_REQUESTS,
      window: RATE_LIMIT_WINDOW / 1000
    });
    return true; // Rate limited
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - clientData.count);
  res.setHeader('X-RateLimit-Reset', new Date(clientData.windowStart + RATE_LIMIT_WINDOW).toISOString());
  
  return false; // Not rate limited
}

// Enhanced rate limiting for authentication endpoints
export function authRateLimit(req, res) {
  const email = req.body?.email || 'unknown';
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const identifier = `auth:${email}:${ip}`;
  
  // Stricter limits for auth: 5 attempts per 15 minutes
  const authRequestCounts = new Map();
  const AUTH_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  const AUTH_MAX_REQUESTS = 5; // requests per window
  
  const now = Date.now();
  const key = identifier;
  
  // Clean up old entries
  for (const [clientKey, data] of authRequestCounts.entries()) {
    if (now - data.windowStart > AUTH_RATE_LIMIT_WINDOW) {
      authRequestCounts.delete(clientKey);
    }
  }
  
  // Get or create client record
  let clientData = authRequestCounts.get(key);
  if (!clientData || now - clientData.windowStart > AUTH_RATE_LIMIT_WINDOW) {
    clientData = { count: 0, windowStart: now };
    authRequestCounts.set(key, clientData);
  }
  
  clientData.count++;
  
  // Check if limit exceeded
  if (clientData.count > AUTH_MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many authentication attempts',
      retryAfter: Math.ceil((AUTH_RATE_LIMIT_WINDOW - (now - clientData.windowStart)) / 1000),
      limit: AUTH_MAX_REQUESTS,
      window: AUTH_RATE_LIMIT_WINDOW / 1000
    });
    return true; // Rate limited
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