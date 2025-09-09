import { MongoClient } from 'mongodb';
import { generateToken } from '../lib/auth.js';
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
      return res.status(400).json({ 
        error: 'Email is required',
        code: 'NO_EMAIL'
      });
    }

    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const usersCollection = db.collection('users');

    // Find user with unverified email
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase(), 
      emailVerified: false 
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'User not found or email already verified',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new verification token
    const verificationToken = generateToken(
      user._id.toString(), 
      user.email, 
      'email-verification'
    );

    // Update user with new verification token and expiration
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          emailVerificationToken: verificationToken,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          updatedAt: new Date()
        } 
      }
    );

    // Send verification email
    try {
      await sendEmail(user.email, 'emailVerification', {
        name: user.name,
        email: user.email,
        verificationToken: verificationToken,
        verificationUrl: `${process.env.FRONTEND_URL || 'https://edgevantagepro.com'}/api/auth/verify-email?token=${verificationToken}`
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - don't fail the request just because email failed
    }

    console.log(`📧 Verification email resent to: ${email}`);

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox and spam folder.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      error: 'Failed to resend verification email',
      code: 'RESEND_ERROR'
    });
  }
}