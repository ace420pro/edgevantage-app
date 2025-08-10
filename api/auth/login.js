import { MongoClient } from 'mongodb';
import { verifyPassword, generateToken } from '../lib/auth.js';

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const usersCollection = db.collection('users');
    const leadsCollection = db.collection('leads');

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLoginAt: new Date() 
        } 
      }
    );

    // Get application data if linked
    let applicationData = null;
    if (user.applicationId) {
      applicationData = await leadsCollection.findOne({ 
        _id: new MongoClient.ObjectId(user.applicationId) 
      });
    }

    // Generate auth token
    const token = generateToken(user._id.toString(), email, user.role);

    console.log(`✅ User logged in: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        applicationId: user.applicationId,
        emailVerified: user.emailVerified,
        profile: user.profile,
        settings: user.settings
      },
      application: applicationData
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Login failed. Please try again.',
      details: error.message 
    });
  }
}