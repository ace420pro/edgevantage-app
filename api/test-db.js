// Simple database connectivity test endpoint
import { connectToDatabase } from './lib/database.js';
import { 
  setCorsHeaders, 
  setSecurityHeaders, 
  handleOptions, 
  handleMethodNotAllowed 
} from './lib/middleware.js';

export default async function handler(req, res) {
  // Set security headers
  setCorsHeaders(res);
  setSecurityHeaders(res);

  // Handle preflight
  if (handleOptions(req, res)) return;

  // Validate method
  if (handleMethodNotAllowed(req, res, ['GET'])) return;

  try {
    console.log('Starting database test...');
    console.log('MongoDB URI configured:', !!process.env.MONGODB_URI);
    console.log('URI starts with mongodb:', process.env.MONGODB_URI?.startsWith('mongodb'));
    
    const startTime = Date.now();
    
    // Import MongoClient directly to test raw connection
    const { MongoClient } = await import('mongodb');
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI not found in environment');
    }
    
    console.log('Creating MongoDB client...');
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    
    console.log('Attempting to connect...');
    await client.connect();
    console.log('Connected successfully');
    
    const db = client.db('edgevantage');
    const pingResult = await db.admin().ping();
    console.log('Ping successful:', pingResult);
    
    await client.close();
    
    const responseTime = Date.now() - startTime;
    
    return res.status(200).json({
      success: true,
      database: 'connected',
      ping: pingResult,
      responseTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      codeName: error.codeName,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 3),
      timestamp: new Date().toISOString()
    });
  }
}