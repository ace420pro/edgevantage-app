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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const collection = db.collection('leads');

    if (req.method === 'POST') {
      // Check if all qualification questions are "yes"
      const qualified = req.body.hasResidence === 'yes' && 
                        req.body.hasInternet === 'yes' && 
                        req.body.hasSpace === 'yes';
      
      // Check for duplicate email
      const existingLead = await collection.findOne({ email: req.body.email });
      if (existingLead) {
        return res.status(400).json({ 
          error: 'This email has already submitted an application.',
          existingApplication: true 
        });
      }
      
      // Create new lead
      const lead = {
        ...req.body,
        qualified,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(lead);
      
      console.log(`✅ New lead saved: ${lead.email} - Qualified: ${qualified}`);
      
      return res.status(201).json({ 
        success: true,
        message: 'Application submitted successfully',
        leadId: result.insertedId,
        qualified: qualified
      });
    }

    if (req.method === 'GET') {
      const { status, qualified, limit = 100, offset = 0 } = req.query;
      
      // Build query
      const query = {};
      if (status) query.status = status;
      if (qualified !== undefined) query.qualified = qualified === 'true';
      
      const leads = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .toArray();
      
      const totalCount = await collection.countDocuments(query);
      
      console.log(`📊 Fetched ${leads.length} leads from database`);
      
      return res.json({
        leads,
        totalCount,
        hasMore: totalCount > parseInt(offset) + parseInt(limit)
      });
    }

    if (req.method === 'PATCH') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Lead ID is required' });
      }
      
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
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Lead ID is required' });
      }
      
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
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed. Please try again.'
    });
  }
}