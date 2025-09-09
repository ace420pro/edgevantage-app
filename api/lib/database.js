import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global cached connection
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Create new connection with optimized settings
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds (increased)
      socketTimeoutMS: 30000, // Close connections after 30 seconds of inactivity
      connectTimeoutMS: 10000, // Connection timeout (10 seconds)
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    });

    await client.connect();
    
    // Cache the connection
    cachedClient = client;
    cachedDb = client.db('edgevantage');
    
    console.log('✅ Connected to MongoDB successfully');
    
    return { client: cachedClient, db: cachedDb };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw new Error('Database connection failed');
  }
}

// Helper function to get specific collections
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

// Graceful shutdown
export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('🔌 Database connection closed');
  }
}

export default connectToDatabase;