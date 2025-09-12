// api/setup-admin.js - One-time admin setup endpoint
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { setCorsHeaders, setSecurityHeaders, handleOptions } from './lib/middleware.js';
import { asyncHandler } from './lib/errors.js';

// Simple database connection for this endpoint
async function connectToMongoDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    retryWrites: true,
    retryReads: true
  });

  await client.connect();
  return client;
}

export default asyncHandler(async function handler(req, res) {
  // Set security headers
  setCorsHeaders(res, req);
  setSecurityHeaders(res);

  // Handle preflight
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client = null;
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    client = await connectToMongoDB();
    const db = client.db('edgevantage');
    const adminsCollection = db.collection('admins');
    
    console.log('Connected successfully, checking for existing admin...');
    
    // Check if any admin already exists
    const existingAdmin = await adminsCollection.findOne({});
    if (existingAdmin) {
      return res.status(400).json({ 
        error: 'Admin account already exists',
        message: 'Setup can only be run once. Contact support if you need to reset credentials.'
      });
    }

    // Create default admin credentials
    const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'edgevantage_admin';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'EdgeVantage2024!Secure';
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@edgevantagepro.com';

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Create admin user
    const adminUser = {
      username: defaultUsername.toLowerCase().trim(),
      password: hashedPassword,
      email: defaultEmail.toLowerCase().trim(),
      role: 'superadmin',
      isActive: true,
      permissions: [
        'read_leads', 
        'write_leads', 
        'delete_leads', 
        'read_affiliates', 
        'write_affiliates', 
        'admin_settings'
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      loginAttempts: 0
    };

    const result = await adminsCollection.insertOne(adminUser);
    
    console.log('✅ Default admin created successfully');
    console.log(`   Username: ${defaultUsername}`);
    console.log(`   Email: ${defaultEmail}`);
    
    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: result.insertedId.toString(),
        username: defaultUsername,
        email: defaultEmail,
        role: 'superadmin'
      }
    });

  } catch (error) {
    console.error('❌ Admin setup error:', error);
    return res.status(500).json({ 
      error: 'Failed to create admin account',
      message: error.message || 'Please try again or contact support',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Always close the connection
    if (client) {
      try {
        await client.close();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
});