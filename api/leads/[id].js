import { MongoClient, ObjectId } from 'mongodb';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const collection = db.collection('leads');

    if (req.method === 'GET') {
      const lead = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      
      return res.json({ lead });
    }

    if (req.method === 'PATCH') {
      const updates = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      
      console.log(`✅ Lead updated: ${id}`);
      
      return res.json({ 
        success: true, 
        message: 'Lead updated successfully',
        lead: result.value 
      });
    }

    if (req.method === 'DELETE') {
      const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });
      
      if (!result.value) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      
      console.log(`✅ Lead deleted: ${id}`);
      
      return res.json({ 
        success: true, 
        message: 'Lead deleted successfully' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Lead operation error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed. Please try again.',
      details: error.message 
    });
  }
}