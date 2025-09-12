// api/setup-admin.js - One-time admin setup endpoint
import bcrypt from 'bcryptjs';
import { connectToDatabase, getCollection } from './lib/database.js';
import { setCorsHeaders, setSecurityHeaders, handleOptions } from './lib/middleware.js';
import { asyncHandler } from './lib/errors.js';

export default asyncHandler(async function handler(req, res) {
  // Set security headers
  setCorsHeaders(res, req);
  setSecurityHeaders(res);

  // Handle preflight
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get admin collection
    const adminsCollection = await getCollection('admins');
    
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
      message: 'Please try again or contact support'
    });
  }
});