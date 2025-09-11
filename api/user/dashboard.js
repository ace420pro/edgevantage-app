import { ObjectId } from 'mongodb';
import { requireAuth } from '../lib/auth.js';
import { connectToDatabase, getCollection } from '../lib/database.js';
import { 
  setCorsHeaders, 
  setSecurityHeaders, 
  handleOptions, 
  handleMethodNotAllowed,
  rateLimit 
} from '../lib/middleware.js';
import { 
  asyncHandler, 
  CommonErrors
} from '../lib/errors.js';

export default asyncHandler(async function handler(req, res) {
  // Set security headers
  setCorsHeaders(res);
  setSecurityHeaders(res);

  // Handle preflight
  if (handleOptions(req, res)) return;

  // Check rate limiting
  if (rateLimit(req, res)) return;

  // Validate method
  if (handleMethodNotAllowed(req, res, ['GET'])) return;

  // Verify authentication
  const authData = await requireAuth(req);
  
  // Get database collections using shared utility
  const usersCollection = await getCollection('users');
  const leadsCollection = await getCollection('leads');
  const shipmentsCollection = await getCollection('shipments');
  const appointmentsCollection = await getCollection('appointments');
  const earningsCollection = await getCollection('earnings');

  // Get user data
  const user = await usersCollection.findOne({ _id: new ObjectId(authData.userId) });
  if (!user) {
    throw CommonErrors.USER_NOT_FOUND;
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

});