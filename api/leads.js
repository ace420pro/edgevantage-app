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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const client = await connectToDatabase();
      const db = client.db('edgevantage');
      const collection = db.collection('leads');
      
      const lead = {
        ...req.body,
        createdAt: new Date(),
        status: 'new'
      };
      
      const result = await collection.insertOne(lead);
      
      return res.status(200).json({ 
        success: true,
        leadId: result.insertedId,
        message: 'Application submitted successfully!'
      });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Failed to submit application. Please try again.'
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const client = await connectToDatabase();
      const db = client.db('edgevantage');
      
      return res.status(200).json({ 
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(200).json({ 
        status: 'healthy',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}