// api/ab-tests.js - A/B Testing management endpoint
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edgevantage';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('edgevantage');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Mock A/B test data
const mockTests = [
  {
    id: 'cta-button-color',
    name: 'CTA Button Color Test',
    description: 'Testing green vs blue CTA buttons',
    status: 'running',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-08-31'),
    variations: [
      { id: 'control', name: 'Green Button', allocation: 50 },
      { id: 'variant', name: 'Blue Button', allocation: 50 }
    ],
    metrics: {
      control: { views: 1250, conversions: 125, conversionRate: 10 },
      variant: { views: 1180, conversions: 142, conversionRate: 12.03 }
    },
    winner: null,
    confidence: 87.5
  },
  {
    id: 'headline-test',
    name: 'Landing Page Headline',
    description: 'Testing different value propositions',
    status: 'completed',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-31'),
    variations: [
      { id: 'control', name: 'Earn $500-$1000', allocation: 50 },
      { id: 'variant', name: 'Guaranteed Monthly Income', allocation: 50 }
    ],
    metrics: {
      control: { views: 3500, conversions: 315, conversionRate: 9 },
      variant: { views: 3420, conversions: 410, conversionRate: 11.99 }
    },
    winner: 'variant',
    confidence: 95.2
  }
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const abTestsCollection = db.collection('abtests');

    if (req.method === 'GET') {
      // Get all A/B tests
      const tests = await abTestsCollection.find({}).toArray();
      
      if (tests.length === 0) {
        // Insert mock data if no tests exist
        await abTestsCollection.insertMany(mockTests);
        return res.status(200).json({
          success: true,
          tests: mockTests,
          total: mockTests.length
        });
      }

      return res.status(200).json({
        success: true,
        tests,
        total: tests.length
      });
    }

    if (req.method === 'POST') {
      // Create new A/B test
      const testData = req.body;
      
      const newTest = {
        ...testData,
        id: testData.name.toLowerCase().replace(/\s+/g, '-'),
        status: 'draft',
        metrics: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await abTestsCollection.insertOne(newTest);

      return res.status(201).json({
        success: true,
        message: 'A/B test created successfully',
        testId: result.insertedId,
        test: newTest
      });
    }

    if (req.method === 'PUT') {
      // Update A/B test
      const { testId } = req.query;
      const updateData = req.body;

      const result = await abTestsCollection.updateOne(
        { _id: new ObjectId(testId) },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'A/B test not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'A/B test updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Delete A/B test
      const { testId } = req.query;

      const result = await abTestsCollection.deleteOne({
        _id: new ObjectId(testId)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'A/B test not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'A/B test deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('A/B Tests API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}