import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate secure JWT secret if not provided
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  // Generate a secure random secret for development
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
})();
const JWT_EXPIRES_IN = '7d';

// Hash password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password with timing attack protection
export async function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) {
    // Perform a dummy bcrypt operation to prevent timing attacks
    await bcrypt.compare('dummy', '$2a$10$dummy.hash.to.prevent.timing.attacks');
    return false;
  }
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(userId, email, role = 'user') {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Generate setup token (for account creation from application)
export function generateSetupToken(email, applicationId) {
  return jwt.sign(
    { email, applicationId, purpose: 'account-setup' },
    JWT_SECRET,
    { expiresIn: '48h' }
  );
}

// In-memory token blacklist (in production, use Redis)
const tokenBlacklist = new Set();

// Verify JWT token with blacklist check
export function verifyToken(token) {
  try {
    if (tokenBlacklist.has(token)) {
      throw new Error('Token has been revoked');
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Blacklist a token (for logout functionality)
export function revokeToken(token) {
  tokenBlacklist.add(token);
  // In production, should also add to Redis with TTL
}

// Clean up expired tokens from blacklist
export function cleanupBlacklist() {
  // In production, Redis handles TTL automatically
  // This is a placeholder for in-memory implementation
}

// Generate password reset token
export function generateResetToken(email) {
  return jwt.sign(
    { email, purpose: 'password-reset' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Middleware to verify authentication
export async function requireAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No authentication token provided');
  }
  
  const decoded = verifyToken(token);
  return decoded;
}

// Generate random password
export function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export default {
  hashPassword,
  verifyPassword,
  generateToken,
  generateSetupToken,
  verifyToken,
  revokeToken,
  generateResetToken,
  requireAuth,
  generateRandomPassword,
  cleanupBlacklist
};