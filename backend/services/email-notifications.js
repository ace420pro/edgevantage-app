const nodemailer = require('nodemailer');

// Simple email notification service for EdgeVantage
// Uses Google Workspace SMTP

// Create transporter with Google Workspace settings
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER || 'support@edgevantagepro.com',
      pass: process.env.GMAIL_APP_PASSWORD // You'll need to generate an app password
    }
  });
};

// Send notification email for new applications
async function sendNewApplicationEmail(leadData) {
  const transporter = createTransporter();
  
  const qualified = leadData.hasResidence === 'yes' && 
                   leadData.hasInternet === 'yes' && 
                   leadData.hasSpace === 'yes';
  
  const mailOptions = {
    from: '"EdgeVantage System" <support@edgevantagepro.com>',
    to: 'support@edgevantagepro.com',
    subject: `New Application: ${leadData.name} - ${qualified ? '✅ QUALIFIED' : '❌ Not Qualified'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #10b981 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; width: 150px; color: #4b5563; }
          .value { flex: 1; color: #1f2937; }
          .qualified { background: #10b981; color: white; padding: 5px 10px; border-radius: 5px; display: inline-block; }
          .not-qualified { background: #ef4444; color: white; padding: 5px 10px; border-radius: 5px; display: inline-block; }
          .action-btn { background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">📋 New EdgeVantage Application</h2>
          </div>
          <div class="content">
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">
                ${qualified ? '<span class="qualified">QUALIFIED</span>' : '<span class="not-qualified">NOT QUALIFIED</span>'}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${leadData.name}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${leadData.email}">${leadData.email}</a></span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value"><a href="tel:${leadData.phone}">${leadData.phone}</a></span>
            </div>
            <div class="info-row">
              <span class="label">Location:</span>
              <span class="value">${leadData.city}, ${leadData.state}</span>
            </div>
            <div class="info-row">
              <span class="label">Has Residence:</span>
              <span class="value">${leadData.hasResidence === 'yes' ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div class="info-row">
              <span class="label">Has Internet:</span>
              <span class="value">${leadData.hasInternet === 'yes' ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div class="info-row">
              <span class="label">Has Space:</span>
              <span class="value">${leadData.hasSpace === 'yes' ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div class="info-row">
              <span class="label">Referral Source:</span>
              <span class="value">${leadData.referralSource || 'Direct'}</span>
            </div>
            ${leadData.referralCode ? `
            <div class="info-row">
              <span class="label">Referral Code:</span>
              <span class="value">${leadData.referralCode}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="label">Submitted:</span>
              <span class="value">${new Date().toLocaleString()}</span>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" class="action-btn">
              View in Admin Dashboard
            </a>
            
            <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <strong>Next Steps:</strong><br>
              ${qualified ? 
                '1. Contact applicant within 24 hours<br>2. Verify qualification details<br>3. Schedule equipment installation' : 
                '1. Send polite rejection email<br>2. Keep contact for future opportunities'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New EdgeVantage Application
      
      Status: ${qualified ? 'QUALIFIED' : 'NOT QUALIFIED'}
      Name: ${leadData.name}
      Email: ${leadData.email}
      Phone: ${leadData.phone}
      Location: ${leadData.city}, ${leadData.state}
      
      Qualification Answers:
      - Has Residence: ${leadData.hasResidence}
      - Has Internet: ${leadData.hasInternet}
      - Has Space: ${leadData.hasSpace}
      
      Referral Source: ${leadData.referralSource || 'Direct'}
      ${leadData.referralCode ? `Referral Code: ${leadData.referralCode}` : ''}
      
      View in Admin Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ New application email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending application email:', error);
    return { success: false, error: error.message };
  }
}

// Send welcome email to applicant
async function sendWelcomeEmail(email, name) {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: '"EdgeVantage Team" <support@edgevantagepro.com>',
    to: email,
    subject: 'Welcome to EdgeVantage - Application Received!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .highlight-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .contact-info { background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to EdgeVantage!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            
            <p>Thank you for applying to EdgeVantage! We've successfully received your application and our team is reviewing it.</p>
            
            <div class="highlight-box">
              <h3 style="margin-top: 0;">✨ What Happens Next?</h3>
              <ol>
                <li>Our team reviews your application (1-2 business days)</li>
                <li>We'll contact you at the phone number you provided</li>
                <li>Once approved, we'll schedule equipment installation</li>
                <li>Start earning $500-$1000 monthly passive income!</li>
              </ol>
            </div>
            
            <div class="contact-info">
              <strong>Need Help? We're Here!</strong><br>
              📞 Call or Text: (817) 204-6783<br>
              ✉️ Email: support@edgevantagepro.com<br>
              <small style="color: #6b7280;">We accept text messages for your convenience!</small>
            </div>
            
            <p style="margin-top: 30px;">We're excited to have you join the EdgeVantage community!</p>
            
            <p>Best regards,<br>
            <strong>The EdgeVantage Team</strong></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              This email was sent because you submitted an application at edgevantagepro.com.<br>
              If you didn't apply, please ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to EdgeVantage!
      
      Hi ${name},
      
      Thank you for applying to EdgeVantage! We've successfully received your application and our team is reviewing it.
      
      What Happens Next?
      1. Our team reviews your application (1-2 business days)
      2. We'll contact you at the phone number you provided
      3. Once approved, we'll schedule equipment installation
      4. Start earning $500-$1000 monthly passive income!
      
      Need Help? We're Here!
      Call or Text: (817) 204-6783
      Email: support@edgevantagepro.com
      
      We're excited to have you join the EdgeVantage community!
      
      Best regards,
      The EdgeVantage Team
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendNewApplicationEmail,
  sendWelcomeEmail
};