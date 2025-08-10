import { MongoClient } from 'mongodb';
import { generateResetToken } from '../lib/auth.js';
import { sendEmail } from '../lib/email-service.js';

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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    
    // Always return success for security (don't reveal if email exists)
    // But only send email if user actually exists
    if (user) {
      // Generate reset token (expires in 1 hour)
      const resetToken = generateResetToken(user.email);
      
      // Store reset token in database with expiration
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            resetToken: resetToken,
            resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
            updatedAt: new Date()
          } 
        }
      );

      // Send password reset email
      sendEmail(user.email, 'passwordReset', {
        name: user.name,
        email: user.email,
        resetToken: resetToken
      }).catch(error => {
        console.error('Failed to send password reset email:', error);
      });

      console.log(`✅ Password reset requested for: ${user.email}`);
    } else {
      console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
    }

    // Always return success message to prevent email enumeration
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link. Please check your email (including spam folder).'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ 
      error: 'Failed to process password reset request. Please try again.',
      details: error.message 
    });
  }
}