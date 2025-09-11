import { ObjectId } from 'mongodb';
import { sendEmail } from './lib/email-service.js';
import { generateSetupToken } from './lib/auth.js';
import { requireAdmin } from './lib/auth-middleware.js';
import { LeadValidator, InputSanitizer } from './lib/validation.js';
import { Cache } from './lib/cache.js';
import { connectToDatabase, getCollection } from './lib/database.js';
import { 
  setCorsHeaders, 
  setSecurityHeaders, 
  handleOptions, 
  rateLimit 
} from './lib/middleware.js';
import { 
  asyncHandler, 
  validateRequired,
  validateEmail,
  APIError,
  ErrorTypes
} from './lib/errors.js';

export default asyncHandler(async function handler(req, res) {
  // Set security headers
  setCorsHeaders(res, req);
  setSecurityHeaders(res);

  // Handle preflight
  if (handleOptions(req, res)) return;

  // Check rate limiting
  if (rateLimit(req, res)) return;

  // Get database collection using shared utility
  const leadsCollection = await getCollection('leads');
    const collection = db.collection('leads');
    
    // Debug database connection
    console.log('Database connected, database name:', db.databaseName);
    const collectionInfo = await db.listCollections({ name: 'leads' }).toArray();
    console.log('Leads collection exists:', collectionInfo.length > 0);

    if (req.method === 'POST') {
      // Validate and sanitize input data
      let sanitizedData;
      try {
        sanitizedData = LeadValidator.validateLeadInput(req.body);
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid input data',
          details: error.message,
          code: 'VALIDATION_ERROR'
        });
      }

      // Check if all qualification questions are "yes"
      const qualified = sanitizedData.hasResidence && 
                        sanitizedData.hasInternet && 
                        sanitizedData.hasSpace;
      
      // Check for duplicate email
      const existingLead = await collection.findOne({ email: sanitizedData.email });
      if (existingLead) {
        return res.status(400).json({ 
          error: 'This email has already submitted an application.',
          existingApplication: true,
          code: 'DUPLICATE_EMAIL'
        });
      }
      
      // Create new lead with sanitized data
      const lead = {
        ...sanitizedData,
        qualified,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        // Add analytics/tracking fields
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      };
      
      const result = await collection.insertOne(lead);
      const leadId = result.insertedId;
      
      console.log(`✅ New lead saved: ${lead.email} - Qualified: ${qualified}`);
      
      // Invalidate cache since we added a new lead
      Cache.delete('lead-stats');
      // Clear all leads cache entries (they start with "leads:")
      const cacheStats = Cache.getStats();
      console.log(`🧹 Invalidating cache after new lead creation`);
      
      // Generate setup token for account creation
      const setupToken = generateSetupToken(lead.email, leadId.toString());
      
      // Send confirmation email (async, don't wait)
      sendEmail(lead.email, 'applicationConfirmation', {
        name: lead.name,
        qualified: qualified,
        applicationId: leadId.toString(),
        submittedAt: lead.createdAt,
        setupToken: setupToken,
        referralCode: lead.referralCode || null
      }).catch(error => {
        console.error('Failed to send confirmation email:', error);
      });
      
      return res.status(201).json({ 
        success: true,
        message: 'Application submitted successfully',
        leadId: leadId,
        qualified: qualified
      });
    }

    if (req.method === 'GET') {
      const { status, qualified, limit = 100, offset = 0 } = req.query;
      
      // Create cache key for this query
      const cacheKey = `leads:${JSON.stringify({ status, qualified, limit, offset })}`;
      
      // Check cache first
      const cachedResult = Cache.get(cacheKey);
      if (cachedResult) {
        console.log(`📊 Returning ${cachedResult.leads.length} cached leads`);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=180'); // 3 minutes
        return res.json(cachedResult);
      }
      
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
      
      const result = {
        leads,
        totalCount,
        hasMore: totalCount > parseInt(offset) + parseInt(limit)
      };
      
      // Cache the result for 3 minutes
      Cache.set(cacheKey, result, 3 * 60 * 1000);
      
      console.log(`📊 Fetched ${leads.length} fresh leads from database (cached for 3min)`);
      
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', 'public, max-age=180'); // 3 minutes
      return res.json(result);
    }

    if (req.method === 'PATCH') {
      // Require admin authentication for updating leads
      await new Promise((resolve, reject) => {
        requireAdmin(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Lead ID is required' });
      }
      
      console.log('PATCH request for lead ID:', id);
      console.log('ID type:', typeof id);
      console.log('ID length:', id.length);
      
      // Validate and sanitize ObjectId
      let objectId;
      try {
        objectId = InputSanitizer.sanitizeObjectId(id);
        console.log('Successfully sanitized ObjectId:', objectId);
      } catch (error) {
        console.error('Invalid ObjectId format:', id, error);
        return res.status(400).json({ 
          error: 'Invalid lead ID format',
          details: error.message,
          code: 'INVALID_ID_FORMAT'
        });
      }
      
      const updates = {
        ...req.body,
        updatedAt: new Date()
      };
      
      console.log('Updates to apply:', updates);
      
      // Check if status is being updated
      console.log('Searching for lead with ObjectId:', objectId);
      const oldLead = await collection.findOne({ _id: objectId });
      console.log('Found lead:', oldLead ? 'YES' : 'NO');
      
      if (!oldLead) {
        console.log('Lead not found with ID:', id, 'ObjectId:', objectId);
        // Let's also try to find all leads to debug
        const allLeads = await collection.find({}).limit(5).toArray();
        console.log('Sample leads in database:', allLeads.map(l => ({ id: l._id.toString(), email: l.email })));
        return res.status(404).json({ error: 'Lead not found' });
      }
      
      const result = await collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      
      // Send status update email if status changed
      if (oldLead && oldLead.status !== updates.status && updates.status) {
        sendEmail(result.value.email, 'statusUpdate', {
          name: result.value.name,
          newStatus: updates.status,
          message: getStatusMessage(updates.status)
        }).catch(error => {
          console.error('Failed to send status update email:', error);
        });
      }
      
      // Invalidate cache since we updated a lead
      Cache.delete('lead-stats');
      console.log(`🧹 Invalidating cache after lead update`);
      
      console.log(`✅ Lead updated: ${id}`);
      
      return res.json({ 
        success: true, 
        message: 'Lead updated successfully',
        lead: result.value 
      });
    }

    if (req.method === 'DELETE') {
      // Require admin authentication for deleting leads
      await new Promise((resolve, reject) => {
        requireAdmin(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Lead ID is required' });
      }
      
      console.log('DELETE request for lead ID:', id);
      
      // Validate and sanitize ObjectId
      let objectId;
      try {
        objectId = InputSanitizer.sanitizeObjectId(id);
      } catch (error) {
        console.error('Invalid ObjectId format:', id, error);
        return res.status(400).json({ 
          error: 'Invalid lead ID format',
          details: error.message,
          code: 'INVALID_ID_FORMAT'
        });
      }
      
      const result = await collection.findOneAndDelete({ _id: objectId });
      
      if (!result.value) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      
      // Invalidate cache since we deleted a lead
      Cache.delete('lead-stats');
      console.log(`🧹 Invalidating cache after lead deletion`);
      
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

function getStatusMessage(status) {
  const messages = {
    'approved': 'Great news! Your application has been approved. Your equipment will be shipped soon.',
    'contacted': 'Our team has reached out to you. Please check your email or phone for our message.',
    'rejected': 'Unfortunately, your application does not meet our current requirements. You may reapply in the future.',
    'pending': 'Your application is currently under review. We will contact you soon.'
  };
  return messages[status] || 'Your application status has been updated.';
}