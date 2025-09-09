import { MongoClient, ObjectId } from 'mongodb';
import { requireAuth } from '../lib/auth.js';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authData = await requireAuth(req);
    
    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const usersCollection = db.collection('users');
    const leadsCollection = db.collection('leads');
    const shipmentsCollection = db.collection('shipments');
    const appointmentsCollection = db.collection('appointments');
    const earningsCollection = db.collection('earnings');

    // Get user data
    const user = await usersCollection.findOne({ _id: new ObjectId(authData.userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get application data
    let application = null;
    if (user.applicationId) {
      application = await leadsCollection.findOne({ 
        _id: new ObjectId(user.applicationId) 
      });
    } else {
      // Try to find application by email
      application = await leadsCollection.findOne({ email: user.email });
      if (application) {
        // Link application to user
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { applicationId: application._id.toString() } }
        );
      }
    }

    // Get shipment tracking if approved
    let shipment = null;
    if (application && application.status === 'approved') {
      shipment = await shipmentsCollection.findOne({ 
        leadId: application._id.toString() 
      });
    }

    // Get appointment data
    let appointment = null;
    if (application) {
      appointment = await appointmentsCollection.findOne({ 
        leadId: application._id.toString() 
      });
    }

    // Get earnings data
    let earnings = null;
    if (application && application.status === 'approved') {
      const earningsData = await earningsCollection.find({ 
        leadId: application._id.toString() 
      }).sort({ month: -1 }).limit(12).toArray();
      
      const totalEarnings = earningsData.reduce((sum, e) => sum + e.amount, 0);
      const averageMonthly = earningsData.length > 0 ? totalEarnings / earningsData.length : 0;
      
      earnings = {
        history: earningsData,
        totalEarnings,
        averageMonthly,
        lastPayment: earningsData[0] || null
      };
    }

    // Calculate progress steps
    const progress = {
      applied: true,
      reviewed: application?.status !== 'pending',
      approved: application?.status === 'approved',
      shipped: shipment?.status === 'shipped' || shipment?.status === 'delivered',
      installed: shipment?.status === 'delivered' && shipment?.installationCompleted,
      earning: earnings?.totalEarnings > 0
    };

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified || false,
        profile: user.profile,
        settings: user.settings
      },
      application: application ? {
        id: application._id,
        status: application.status,
        qualified: application.qualified,
        submittedAt: application.createdAt,
        lastUpdated: application.updatedAt,
        monthlyEarnings: application.monthlyEarnings || 0,
        equipmentShipped: application.equipmentShipped || false
      } : null,
      shipment: shipment ? {
        trackingNumber: shipment.trackingNumber,
        carrier: shipment.carrier,
        status: shipment.status,
        estimatedDelivery: shipment.estimatedDelivery,
        shippedDate: shipment.shippedDate,
        deliveredDate: shipment.deliveredDate,
        installationGuideUrl: shipment.installationGuideUrl
      } : null,
      appointment: appointment ? {
        id: appointment._id,
        type: appointment.type,
        scheduledDate: appointment.scheduledDate,
        status: appointment.status,
        notes: appointment.notes,
        meetingLink: appointment.meetingLink
      } : null,
      earnings,
      progress,
      accountSecurity: {
        emailVerified: user.emailVerified || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
        lastLogin: user.lastLogin || user.updatedAt
      },
      notifications: [] // Would be populated from notifications collection
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: error.message 
    });
  }
}