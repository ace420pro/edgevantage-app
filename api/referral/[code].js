import { MongoClient } from 'mongodb';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const affiliatesCollection = db.collection('affiliates');
    
    // Look up affiliate by code (if affiliates collection exists)
    const affiliate = await affiliatesCollection.findOne({ 
      affiliateCode: code.toUpperCase(),
      status: 'active'
    });
    
    if (affiliate) {
      return res.json({
        code: code,
        referrerName: affiliate.name,
        bonus: affiliate.commissionRate || 50,
        isValid: true,
        affiliateId: affiliate._id
      });
    } else {
      // For now, accept any code if no affiliate system is in place
      return res.json({
        code: code,
        referrerName: 'EdgeVantage Partner',
        bonus: 50,
        isValid: true,
        message: 'Valid referral code'
      });
    }
  } catch (error) {
    console.error('Error checking referral:', error);
    return res.status(500).json({ error: 'Failed to check referral code' });
  }
}