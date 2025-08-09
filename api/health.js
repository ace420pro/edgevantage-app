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
    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    
    // Test the connection with a simple query
    const leadCount = await db.collection('leads').countDocuments();
    
    return res.status(200).json({ 
      status: 'healthy',
      database: 'connected',
      mongoUri: MONGODB_URI ? 'configured' : 'missing',
      leadCount: leadCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      mongoUri: MONGODB_URI ? 'configured' : 'missing',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}