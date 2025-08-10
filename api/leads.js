import { MongoClient, ObjectId } from 'mongodb';
import { sendEmail } from './lib/email-service.js';
import { generateSetupToken } from './lib/auth.js';

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
    const collection = db.collection('leads');

    if (req.method === 'POST') {
      // Check if all qualification questions are "yes"
      const qualified = req.body.hasResidence === 'yes' && 
                        req.body.hasInternet === 'yes' && 
                        req.body.hasSpace === 'yes';
      
      // Check for duplicate email
      const existingLead = await collection.findOne({ email: req.body.email });
      if (existingLead) {
        return res.status(400).json({ 
          error: 'This email has already submitted an application.',
          existingApplication: true 
        });
      }
      
      // Create new lead
      const lead = {
        ...req.body,
        qualified,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(lead);
      const leadId = result.insertedId;
      
      console.log(`✅ New lead saved: ${lead.email} - Qualified: ${qualified}`);
      
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
      
      console.log(`📊 Fetched ${leads.length} leads from database`);
      
      return res.json({
        leads,
        totalCount,
        hasMore: totalCount > parseInt(offset) + parseInt(limit)
      });
    }

    if (req.method === 'PATCH') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Lead ID is required' });
      }
      
      console.log('PATCH request for lead ID:', id);
      console.log('ID type:', typeof id);
      console.log('ID length:', id.length);
      
      // Validate ObjectId format
      let objectId;
      try {
        objectId = new ObjectId(id);
        console.log('Successfully created ObjectId:', objectId);
      } catch (error) {
        console.error('Invalid ObjectId format:', id, error);
        return res.status(400).json({ error: 'Invalid lead ID format' });
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
      
      console.log(`✅ Lead updated: ${id}`);
      
      return res.json({ 
        success: true, 
        message: 'Lead updated successfully',
        lead: result.value 
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Lead ID is required' });
      }
      
      console.log('DELETE request for lead ID:', id);
      
      // Validate ObjectId format
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (error) {
        console.error('Invalid ObjectId format:', id, error);
        return res.status(400).json({ error: 'Invalid lead ID format' });
      }
      
      const result = await collection.findOneAndDelete({ _id: objectId });
      
      if (!result.value) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      
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