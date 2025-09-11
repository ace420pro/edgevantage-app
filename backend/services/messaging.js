const twilio = require('twilio');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Configuration from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+18172046783';
const COMPANY_PHONE = '+18172046783';

// Email configuration
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'sendgrid'; // 'sendgrid' or 'smtp'
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'support@edgevantagepro.com';

// Initialize Twilio client if credentials are provided
let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  console.log('✅ Twilio SMS service initialized');
} else {
  console.log('⚠️ Twilio credentials not configured - SMS disabled');
}

// Initialize SendGrid if API key is provided
if (EMAIL_SERVICE === 'sendgrid' && SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid email service initialized');
} else if (EMAIL_SERVICE === 'smtp' && SMTP_HOST) {
  console.log('✅ SMTP email service configured');
} else {
  console.log('⚠️ Email service not configured');
}

// Send SMS function
async function sendSMS(to, message) {
  if (!twilioClient) {
    console.log('⚠️ SMS not sent - Twilio not configured');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    // Format phone number (remove non-digits and add +1 if needed)
    let formattedPhone = to.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = `+1${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`✅ SMS sent to ${formattedPhone}: ${result.sid}`);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('❌ SMS send error:', error.message);
    return { success: false, error: error.message };
  }
}

// Send email using SendGrid
async function sendEmailViaSendGrid(to, subject, html, text) {
  try {
    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent via SendGrid to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ SendGrid error:', error);
    return { success: false, error: error.message };
  }
}

// Send email using SMTP
async function sendEmailViaSMTP(to, subject, html, text) {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    const result = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html
    });

    console.log(`✅ Email sent via SMTP to ${to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ SMTP error:', error);
    return { success: false, error: error.message };
  }
}

// Main email sending function
async function sendEmail(to, subject, html, text) {
  if (EMAIL_SERVICE === 'sendgrid' && SENDGRID_API_KEY) {
    return await sendEmailViaSendGrid(to, subject, html, text);
  } else if (EMAIL_SERVICE === 'smtp' && SMTP_HOST) {
    return await sendEmailViaSMTP(to, subject, html, text);
  } else {
    console.log('⚠️ Email not sent - Email service not configured');
    return { success: false, error: 'Email service not configured' };
  }
}

// Send welcome SMS to new applicants
async function sendWelcomeSMS(phone, name) {
  const message = `Hi ${name}! Thanks for applying to EdgeVantage. We've received your application and will contact you within 1-2 business days. Questions? Reply to this text or call ${COMPANY_PHONE.replace('+1', '')}. - EdgeVantage Team`;
  return await sendSMS(phone, message);
}

// Send welcome email to new applicants
async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to EdgeVantage - Application Received!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to EdgeVantage!</h1>
      </div>
      <div style="padding: 30px; background: #f7f7f7;">
        <h2>Hi ${name},</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          Thank you for applying to EdgeVantage! We've successfully received your application 
          and our team is reviewing it.
        </p>
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #667eea;">What's Next?</h3>
          <ul style="line-height: 1.8;">
            <li>Our team will review your application within 1-2 business days</li>
            <li>We'll contact you at the phone number you provided</li>
            <li>Once approved, we'll schedule equipment installation</li>
            <li>Start earning $500-$1000 monthly passive income!</li>
          </ul>
        </div>
        <p style="font-size: 16px;">
          <strong>Need Help?</strong><br>
          📞 Call or Text: (817) 204-6783<br>
          ✉️ Email: support@edgevantage.com
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          The EdgeVantage Team
        </p>
      </div>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
}

// Send notification to admin about new application
async function sendAdminNotification(leadData) {
  const adminPhone = process.env.ADMIN_PHONE; // Admin phone for SMS alerts
  const adminEmail = process.env.ADMIN_EMAIL || 'support@edgevantagepro.com';
  
  // Send SMS to admin if configured
  if (adminPhone) {
    const message = `New EdgeVantage application from ${leadData.name} (${leadData.state}). Qualified: ${
      leadData.hasResidence === 'yes' && leadData.hasInternet === 'yes' && leadData.hasSpace === 'yes' ? 'YES ✅' : 'NO ❌'
    }. Check dashboard for details.`;
    await sendSMS(adminPhone, message);
  }
  
  // Send email to admin
  const subject = `New Application: ${leadData.name} - ${leadData.qualified ? 'QUALIFIED' : 'Not Qualified'}`;
  const html = `
    <h2>New EdgeVantage Application</h2>
    <table style="border-collapse: collapse; width: 100%;">
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${leadData.name}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${leadData.email}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${leadData.phone}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Location:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${leadData.city}, ${leadData.state}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Qualified:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${leadData.qualified ? '✅ YES' : '❌ NO'}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Has Residence:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${leadData.hasResidence}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Has Internet:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${leadData.hasInternet}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Has Space:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${leadData.hasSpace}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Referral Source:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${leadData.referralSource || 'Direct'}</td></tr>
    </table>
    <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View in Dashboard</a></p>
  `;
  
  await sendEmail(adminEmail, subject, html);
}

module.exports = {
  sendSMS,
  sendEmail,
  sendWelcomeSMS,
  sendWelcomeEmail,
  sendAdminNotification
};