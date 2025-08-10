import { MongoClient } from 'mongodb';
import { verifyToken, hashPassword, generateToken } from '../lib/auth.js';

const MONGODB_URI = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const usersCollection = db.collection('users');

    // Verify the reset token
    let decoded;
    try {
      decoded = verifyToken(token);
      if (decoded.purpose !== 'password-reset') {
        throw new Error('Invalid token purpose');
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Find user with valid reset token
    const user = await usersCollection.findOne({
      email: decoded.email,
      resetToken: token,
      resetTokenExpires: { $gt: new Date() } // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user with new password and clear reset token
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        },
        $unset: {
          resetToken: 1,
          resetTokenExpires: 1
        }
      }
    );

    // Generate new auth token for automatic login
    const authToken = generateToken(user._id.toString(), user.email, user.role);

    console.log(`✅ Password reset successful for: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ 
      error: 'Failed to reset password. Please try again.',
      details: error.message 
    });
  }
}