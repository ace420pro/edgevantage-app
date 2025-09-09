import { MongoClient } from 'mongodb';
import crypto from 'crypto';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Support both GET (clicking link) and POST (API call)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from query params (GET) or body (POST)
    const token = req.method === 'GET' ? req.query.token : req.body.token;

    if (!token) {
      if (req.method === 'GET') {
        // Return HTML page for missing token
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>EdgeVantage - Email Verification</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #667eea; }
              .error { color: #dc3545; text-align: center; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">EdgeVantage</div>
                <h1>Email Verification</h1>
              </div>
              <div class="error">
                <h2>❌ Invalid Verification Link</h2>
                <p>This verification link is missing the required token. Please check your email and click the correct link.</p>
                <a href="https://edgevantagepro.com" class="button">Return to EdgeVantage</a>
              </div>
            </div>
          </body>
          </html>
        `);
      }
      return res.status(400).json({ 
        error: 'Verification token is required',
        code: 'NO_TOKEN'
      });
    }

    const client = await connectToDatabase();
    const db = client.db('edgevantage');
    const usersCollection = db.collection('users');

    // Find user by verification token and check expiration
    // Note: Token is stored directly (not hashed) in resend-verification.js
    const user = await usersCollection.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });
    
    if (!user) {
      if (req.method === 'GET') {
        // Return HTML page for invalid/expired token
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>EdgeVantage - Email Verification</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #667eea; }
              .error { color: #dc3545; text-align: center; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">EdgeVantage</div>
                <h1>Email Verification</h1>
              </div>
              <div class="error">
                <h2>❌ Link Expired or Invalid</h2>
                <p>This verification link has expired or is no longer valid. Please request a new verification email.</p>
                <a href="https://edgevantagepro.com/login" class="button">Login to Resend Verification</a>
              </div>
            </div>
          </body>
          </html>
        `);
      }
      return res.status(400).json({ 
        error: 'Invalid or expired verification token',
        code: 'INVALID_TOKEN'
      });
    }

    // Mark email as verified and remove verification tokens
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: true,
          emailVerifiedAt: new Date()
        },
        $unset: {
          emailVerificationToken: 1,
          emailVerificationExpires: 1
        }
      }
    );

    console.log(`✅ Email verified successfully for: ${user.email}`);

    if (req.method === 'GET') {
      // Return success HTML page
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>EdgeVantage - Email Verified!</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #667eea; }
            .success { color: #28a745; text-align: center; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .checkmark { font-size: 48px; color: #28a745; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">EdgeVantage</div>
              <h1>Email Verification</h1>
            </div>
            <div class="success">
              <div class="checkmark">✅</div>
              <h2>Email Successfully Verified!</h2>
              <p>Thank you, <strong>${user.name}</strong>! Your email address has been verified and your account is now fully activated.</p>
            </div>
            
            <div class="info">
              <h3>🎉 What's Next?</h3>
              <ul style="text-align: left;">
                <li>🏠 You can now access your full EdgeVantage dashboard</li>
                <li>📧 You'll receive important updates about your passive income opportunity</li>
                <li>💰 Track your application status and earnings</li>
                <li>🔒 Your account is now fully secured</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://edgevantagepro.com/login" class="button">Access Your Dashboard</a>
            </div>
            
            <p style="text-align: center; margin-top: 20px; color: #666;">
              You can safely close this window and return to EdgeVantage.
            </p>
          </div>
        </body>
        </html>
      `);
    }

    // JSON response for API calls
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        email: user.email,
        name: user.name,
        emailVerified: true
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    if (req.method === 'GET') {
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>EdgeVantage - Verification Error</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #667eea; }
            .error { color: #dc3545; text-align: center; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">EdgeVantage</div>
              <h1>Email Verification</h1>
            </div>
            <div class="error">
              <h2>⚠️ Verification Error</h2>
              <p>We encountered an issue while verifying your email. Please try again or contact support.</p>
              <a href="https://edgevantagepro.com/login" class="button">Try Again</a>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    return res.status(500).json({ 
      error: 'Email verification failed',
      code: 'VERIFICATION_ERROR'
    });
  }
}