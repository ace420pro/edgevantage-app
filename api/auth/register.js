import { MongoClient } from 'mongodb';
import { hashPassword, generateToken, verifyToken } from '../lib/auth.js';
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
    const { email, password, name, setupToken } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const usersCollection = db.collection('users');
    const leadsCollection = db.collection('leads');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // If setup token provided, verify it and link to application
    let applicationId = null;
    if (setupToken) {
      try {
        const decoded = verifyToken(setupToken);
        if (decoded.purpose === 'account-setup' && decoded.email === email) {
          applicationId = decoded.applicationId;
          
          // Update lead record with user account created flag
          await leadsCollection.updateOne(
            { _id: new MongoClient.ObjectId(applicationId) },
            { 
              $set: { 
                hasAccount: true,
                accountCreatedAt: new Date()
              } 
            }
          );
        }
      } catch (error) {
        console.log('Invalid setup token, proceeding without linking to application');
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = {
      email,
      password: hashedPassword,
      name,
      role: 'user',
      applicationId,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
      profile: {
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      },
      settings: {
        emailNotifications: true,
        smsNotifications: false
      }
    };

    const result = await usersCollection.insertOne(user);

    // Generate auth token
    const token = generateToken(result.insertedId.toString(), email, 'user');

    // Send welcome email
    sendEmail(email, 'welcome', {
      name,
      loginUrl: `${process.env.FRONTEND_URL || 'https://edgevantagepro.com'}/account`
    }).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    console.log(`✅ New user registered: ${email}`);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: result.insertedId,
        email: user.email,
        name: user.name,
        role: user.role,
        applicationId: user.applicationId
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'Failed to create account. Please try again.',
      details: error.message 
    });
  }
}