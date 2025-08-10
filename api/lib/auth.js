import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

// Hash password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
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

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
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
  generateResetToken,
  requireAuth,
  generateRandomPassword
};