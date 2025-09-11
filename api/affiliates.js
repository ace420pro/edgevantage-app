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
    const affiliatesCollection = db.collection('affiliates');

    if (req.method === 'GET') {
      const { status, limit = 50 } = req.query;
      
      const query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      
      // Since we might not have any affiliates yet, let's create some mock data
      const affiliates = await affiliatesCollection.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      // If no affiliates exist, return mock data for demo purposes
      if (affiliates.length === 0) {
        const mockAffiliates = [
          {
            _id: new ObjectId(),
            name: 'John Smith',
            email: 'john.smith@email.com',
            phone: '(555) 123-4567',
            affiliateCode: 'JOHN001',
            status: 'active',
            totalReferrals: 3,
            approvedReferrals: 2,
            totalCommissions: 100,
            paidCommissions: 50,
            pendingCommissions: 50,
            commissionRate: 50,
            paymentMethod: 'paypal',
            paymentDetails: 'john.smith@paypal.com',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date(),
            lastLoginAt: new Date('2024-08-08'),
            customMessage: 'Join me on EdgeVantage and earn $500-$1000 monthly!'
          },
          {
            _id: new ObjectId(),
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com', 
            phone: '(555) 987-6543',
            affiliateCode: 'SARAH002',
            status: 'active',
            totalReferrals: 5,
            approvedReferrals: 4,
            totalCommissions: 200,
            paidCommissions: 150,
            pendingCommissions: 50,
            commissionRate: 50,
            paymentMethod: 'venmo',
            paymentDetails: '@sarah-johnson',
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date(),
            lastLoginAt: new Date('2024-08-09'),
            customMessage: 'Easy passive income opportunity - ask me how!'
          }
        ];
        
        return res.json({ 
          affiliates: mockAffiliates,
          totalCount: mockAffiliates.length 
        });
      }
      
      const totalCount = await affiliatesCollection.countDocuments(query);
      
      return res.json({ 
        affiliates, 
        totalCount 
      });
    }

    if (req.method === 'POST') {
      const { name, email, phone, paymentMethod = 'paypal', paymentDetails = '' } = req.body;
      
      // Generate unique affiliate code
      let affiliateCode;
      let codeExists = true;
      let attempts = 0;
      
      while (codeExists && attempts < 10) {
        const namePart = name.split(' ').map(n => n.substring(0, 3).toUpperCase()).join('').substring(0, 6);
        const numberPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        affiliateCode = namePart + numberPart;
        
        const existing = await affiliatesCollection.findOne({ affiliateCode });
        codeExists = !!existing;
        attempts++;
      }
      
      if (codeExists) {
        return res.status(400).json({ error: 'Unable to generate unique affiliate code' });
      }
      
      // Check for existing email
      const existingAffiliate = await affiliatesCollection.findOne({ email });
      if (existingAffiliate) {
        return res.status(400).json({ error: 'Email already registered as affiliate' });
      }
      
      const newAffiliate = {
        name,
        email,
        phone,
        affiliateCode,
        status: 'active',
        totalReferrals: 0,
        approvedReferrals: 0,
        totalCommissions: 0,
        paidCommissions: 0,
        pendingCommissions: 0,
        commissionRate: 50,
        paymentMethod,
        paymentDetails,
        createdAt: new Date(),
        updatedAt: new Date(),
        customMessage: 'Join me on EdgeVantage and earn $500-$1000 monthly passive income!',
        notes: ''
      };
      
      const result = await affiliatesCollection.insertOne(newAffiliate);
      
      console.log(`✅ New affiliate registered: ${email} - Code: ${affiliateCode}`);
      
      return res.status(201).json({
        success: true,
        message: 'Affiliate registration successful',
        affiliate: {
          id: result.insertedId,
          ...newAffiliate
        }
      });
    }

    if (req.method === 'PATCH') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Affiliate ID is required' });
      }
      
      const updates = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const result = await affiliatesCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        return res.status(404).json({ error: 'Affiliate not found' });
      }
      
      console.log(`✅ Affiliate updated: ${id}`);
      
      return res.json({ 
        success: true, 
        affiliate: result.value 
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Affiliate ID is required' });
      }
      
      const result = await affiliatesCollection.findOneAndDelete({ _id: new ObjectId(id) });
      
      if (!result.value) {
        return res.status(404).json({ error: 'Affiliate not found' });
      }
      
      console.log(`✅ Affiliate deleted: ${id}`);
      
      return res.json({ 
        success: true, 
        message: 'Affiliate deleted successfully' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Affiliate API error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed. Please try again.',
      details: error.message 
    });
  }
}