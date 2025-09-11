import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global cached connection
let cachedClient = null;
let cachedDb = null;
let connectionAttempts = 0;
let lastConnectionAttempt = 0;

// Optimized connection configuration
const CONNECTION_CONFIG = {
  // Connection Pool Settings
  maxPoolSize: 20, // Increased from 10 for better concurrency
  minPoolSize: 5,  // Maintain minimum connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  
  // Timeout Settings
  serverSelectionTimeoutMS: 10000, // 10 seconds to select a server
  socketTimeoutMS: 45000, // 45 seconds socket timeout
  connectTimeoutMS: 10000, // 10 seconds connection timeout
  
  // Retry and Monitoring
  retryWrites: true,
  retryReads: true,
  
  // Buffering (disabled as these are for Mongoose)
  bufferMaxEntries: 0,
  bufferCommands: false,
  
  // Compression
  compressors: ['zlib'],
  zlibCompressionLevel: 6,
  
  // Heartbeat
  heartbeatFrequencyMS: 30000, // 30 seconds heartbeat
  
  // Additional Performance Settings
  readPreference: 'primaryPreferred', // Try primary first, fallback to secondary
  readConcern: { level: 'majority' }, // Read concern for data consistency
  writeConcern: { w: 'majority', j: true, wtimeout: 10000 } // Write concern
};

export async function connectToDatabase() {
  // Return cached connection if available and healthy
  if (cachedClient && cachedDb) {
    try {
      // Test the connection health
      await cachedClient.db('admin').ping();
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.warn('⚠️ Cached connection unhealthy, reconnecting...', error.message);
      // Clear cached connection and reconnect
      cachedClient = null;
      cachedDb = null;
    }
  }

  // Prevent rapid reconnection attempts
  const now = Date.now();
  if (now - lastConnectionAttempt < 1000) {
    throw new Error('Connection attempt too soon, please wait');
  }
  lastConnectionAttempt = now;

  try {
    connectionAttempts++;
    console.log(`🔄 Attempting MongoDB connection #${connectionAttempts}...`);

    // Create new connection with optimized settings
    const client = new MongoClient(MONGODB_URI, CONNECTION_CONFIG);

    // Connect with timeout
    await client.connect();
    
    // Verify connection
    await client.db('admin').ping();
    
    // Cache the connection
    cachedClient = client;
    cachedDb = client.db('edgevantage');
    
    console.log(`✅ Connected to MongoDB successfully (attempt #${connectionAttempts})`);
    console.log(`📊 Database: ${cachedDb.databaseName}`);
    console.log(`🔧 Pool size: ${CONNECTION_CONFIG.minPoolSize}-${CONNECTION_CONFIG.maxPoolSize}`);
    
    // Setup connection event handlers
    setupConnectionHandlers(client);
    
    return { client: cachedClient, db: cachedDb };
  } catch (error) {
    console.error(`❌ MongoDB connection error (attempt #${connectionAttempts}):`, error.message);
    
    // Clear any partially created connections
    cachedClient = null;
    cachedDb = null;
    
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

// Setup connection event handlers for monitoring
function setupConnectionHandlers(client) {
  client.on('serverOpening', (event) => {
    console.log(`🌐 MongoDB server opening: ${event.address}`);
  });

  client.on('serverClosed', (event) => {
    console.warn(`🌐 MongoDB server closed: ${event.address}`);
  });

  client.on('topologyOpening', () => {
    console.log('🔗 MongoDB topology opening');
  });

  client.on('topologyClosed', () => {
    console.warn('🔗 MongoDB topology closed');
  });

  client.on('error', (error) => {
    console.error('❌ MongoDB client error:', error);
  });

  // Monitor connection pool events
  client.on('connectionPoolCreated', (event) => {
    console.log(`🏊 Connection pool created for ${event.address}`);
  });

  client.on('connectionPoolClosed', (event) => {
    console.warn(`🏊 Connection pool closed for ${event.address}`);
  });
}

// Helper function to get specific collections
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

// Get connection health and statistics
export async function getConnectionHealth() {
  if (!cachedClient || !cachedDb) {
    return {
      status: 'disconnected',
      client: null,
      database: null,
      connectionAttempts,
      lastConnectionAttempt: new Date(lastConnectionAttempt).toISOString()
    };
  }

  try {
    // Test connection
    const pingStart = Date.now();
    await cachedClient.db('admin').ping();
    const pingTime = Date.now() - pingStart;

    // Get server status
    const serverStatus = await cachedClient.db('admin').admin().serverStatus();
    
    // Get database stats
    const dbStats = await cachedDb.stats();

    return {
      status: 'connected',
      health: 'healthy',
      pingTime: `${pingTime}ms`,
      database: cachedDb.databaseName,
      connectionAttempts,
      config: {
        maxPoolSize: CONNECTION_CONFIG.maxPoolSize,
        minPoolSize: CONNECTION_CONFIG.minPoolSize,
        compression: CONNECTION_CONFIG.compressors
      },
      server: {
        version: serverStatus.version,
        uptime: Math.round(serverStatus.uptime / 60), // minutes
        connections: serverStatus.connections
      },
      database: {
        collections: dbStats.collections,
        documents: dbStats.objects,
        dataSize: Math.round(dbStats.dataSize / 1024 / 1024), // MB
        indexSize: Math.round(dbStats.indexSize / 1024 / 1024) // MB
      },
      performance: {
        avgObjSize: Math.round(dbStats.avgObjSize),
        storageSize: Math.round(dbStats.storageSize / 1024 / 1024) // MB
      }
    };
  } catch (error) {
    return {
      status: 'connected',
      health: 'unhealthy',
      error: error.message,
      database: cachedDb?.databaseName || 'unknown',
      connectionAttempts
    };
  }
}

// Graceful shutdown
export async function closeConnection() {
  if (cachedClient) {
    try {
      await cachedClient.close();
      console.log('🔌 Database connection closed gracefully');
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
    } finally {
      cachedClient = null;
      cachedDb = null;
    }
  }
}

// Force reconnection (useful for testing or recovery)
export async function forceReconnect() {
  console.log('🔄 Forcing database reconnection...');
  
  // Close existing connection
  await closeConnection();
  
  // Reset connection state
  connectionAttempts = 0;
  lastConnectionAttempt = 0;
  
  // Establish new connection
  return await connectToDatabase();
}

export default connectToDatabase;