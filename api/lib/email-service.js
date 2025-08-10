import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const emailTemplates = {
  // Application confirmation email
  applicationConfirmation: (data) => ({
    subject: 'EdgeVantage Application Received - Next Steps',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          h1 { margin: 0; }
          .highlight { color: #667eea; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to EdgeVantage!</h1>
            <p style="margin: 10px 0 0 0;">Your Passive Income Journey Starts Here</p>
          </div>
          <div class="content">
            <h2>Hi ${data.name},</h2>
            <p>Thank you for applying to the EdgeVantage passive income program! We've successfully received your application and are excited to help you start earning <strong>$500-$1000 per month</strong>.</p>
            
            <div class="status-box">
              <h3>Application Status: <span class="highlight">${data.qualified ? 'Pre-Qualified' : 'Under Review'}</span></h3>
              <p>Application ID: <strong>${data.applicationId}</strong></p>
              <p>Submitted: ${new Date(data.submittedAt).toLocaleDateString()}</p>
            </div>

            ${data.qualified ? `
              <h3>✅ Congratulations! You're Pre-Qualified!</h3>
              <p>Based on your responses, you meet our initial requirements. Here's what happens next:</p>
              <ol>
                <li><strong>Verification (24-48 hours):</strong> Our team will verify your information</li>
                <li><strong>Equipment Selection:</strong> We'll select the best equipment for your location</li>
                <li><strong>Shipping (3-5 business days):</strong> Equipment will be shipped to your address</li>
                <li><strong>Installation Support:</strong> We'll guide you through the simple setup process</li>
                <li><strong>Start Earning:</strong> Once activated, you'll start earning monthly passive income!</li>
              </ol>
            ` : `
              <h3>Your Application is Under Review</h3>
              <p>Our team is reviewing your application and will contact you within 24-48 hours with next steps.</p>
            `}

            <h3>Track Your Application</h3>
            <p>You can track your application status and manage your account by creating a login:</p>
            <a href="${process.env.FRONTEND_URL || 'https://edgevantagepro.com'}/account/setup?token=${data.setupToken}" class="button">Create Your Account</a>

            <h3>Questions?</h3>
            <p>If you have any questions about your application or the program, feel free to:</p>
            <ul>
              <li>Reply to this email</li>
              <li>Call us at: 1-800-EDGE-PRO</li>
              <li>Visit our FAQ: <a href="${process.env.FRONTEND_URL || 'https://edgevantagepro.com'}/faq">edgevantagepro.com/faq</a></li>
            </ul>

            ${data.referralCode ? `
              <div class="status-box" style="background: #f0f9ff; border-left-color: #3b82f6;">
                <h3>🎁 Referral Bonus Active!</h3>
                <p>You were referred by one of our partners (Code: ${data.referralCode}). You'll receive a <strong>$50 bonus</strong> after your first payout!</p>
              </div>
            ` : ''}

            <div class="footer">
              <p>Best regards,<br>The EdgeVantage Team</p>
              <p style="font-size: 12px; color: #999;">
                © 2024 EdgeVantage. All rights reserved.<br>
                You're receiving this email because you applied at edgevantagepro.com
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Affiliate welcome email
  affiliateWelcome: (data) => ({
    subject: 'Welcome to EdgeVantage Affiliate Program! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #667eea; }
          .code { font-size: 28px; font-weight: bold; color: #667eea; letter-spacing: 2px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; padding: 15px; background: white; border-radius: 8px; flex: 1; margin: 0 5px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome, Affiliate Partner!</h1>
            <p style="margin: 10px 0 0 0;">Start Earning $50 Per Referral</p>
          </div>
          <div class="content">
            <h2>Hi ${data.name},</h2>
            <p>Congratulations! You're now an official EdgeVantage affiliate partner. Get ready to earn <strong>$50 for every successful referral!</strong></p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0;">Your Unique Affiliate Code:</p>
              <div class="code">${data.affiliateCode}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Share this code with your network!</p>
            </div>

            <h3>Your Referral Links:</h3>
            <p><strong>Direct Link:</strong><br>
            <code style="background: #f0f0f0; padding: 5px; border-radius: 3px;">
              ${process.env.FRONTEND_URL || 'https://edgevantagepro.com'}?ref=${data.affiliateCode}
            </code></p>

            <h3>How It Works:</h3>
            <ol>
              <li>Share your referral link or code with friends, family, and followers</li>
              <li>When someone applies using your code, they get tracked to you</li>
              <li>Once they're approved and activated, you earn $50!</li>
              <li>Track your earnings in real-time from your dashboard</li>
            </ol>

            <a href="${process.env.FRONTEND_URL || 'https://edgevantagepro.com'}/affiliate/dashboard?code=${data.affiliateCode}" class="button">Access Your Dashboard</a>

            <h3>Marketing Resources:</h3>
            <ul>
              <li>📱 Social media templates and graphics</li>
              <li>📧 Email templates you can customize</li>
              <li>📊 Real-time tracking dashboard</li>
              <li>💰 Instant commission notifications</li>
            </ul>

            <h3>Pro Tips for Success:</h3>
            <ul>
              <li>Focus on people who own their homes (higher approval rate)</li>
              <li>Emphasize the passive income opportunity ($500-$1000/month)</li>
              <li>Share your personal experience if you're also a host</li>
              <li>Use social proof - share success stories</li>
            </ul>

            <div class="stats">
              <div class="stat">
                <div class="stat-value">$50</div>
                <div class="stat-label">Per Referral</div>
              </div>
              <div class="stat">
                <div class="stat-value">No Limit</div>
                <div class="stat-label">Earning Potential</div>
              </div>
              <div class="stat">
                <div class="stat-value">30 Days</div>
                <div class="stat-label">Cookie Duration</div>
              </div>
            </div>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
              Questions? Reply to this email or visit our <a href="${process.env.FRONTEND_URL || 'https://edgevantagepro.com'}/affiliate/help">Affiliate Help Center</a><br>
              © 2024 EdgeVantage Affiliate Program
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Password reset email
  passwordReset: (data) => ({
    subject: 'Reset Your EdgeVantage Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning-box { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .expire-notice { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 10px; border-radius: 5px; margin: 15px 0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p style="margin: 10px 0 0 0;">Reset your EdgeVantage account password</p>
          </div>
          <div class="content">
            <h2>Hi ${data.name},</h2>
            <p>We received a request to reset the password for your EdgeVantage account associated with <strong>${data.email}</strong>.</p>
            
            <p>If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://edgevantagepro.com'}/reset-password?token=${data.resetToken}" 
                 class="button" 
                 style="font-size: 16px; font-weight: bold;">
                Reset My Password
              </a>
            </div>
            
            <div class="expire-notice">
              ⏰ <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            
            <div class="warning-box">
              <h3 style="margin-top: 0;">🔒 Security Notice</h3>
              <p style="margin-bottom: 0;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged. If you're concerned about your account security, please contact our support team.</p>
            </div>
            
            <p>For security reasons, we cannot send your existing password. You'll need to create a new one using the link above.</p>
            
            <h3>Need Help?</h3>
            <p>If you're having trouble with the reset link, you can copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">
              ${process.env.FRONTEND_URL || 'https://edgevantagepro.com'}/reset-password?token=${data.resetToken}
            </p>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
              Best regards,<br>
              The EdgeVantage Security Team<br><br>
              © 2024 EdgeVantage. All rights reserved.<br>
              If you have questions, reply to this email or visit our help center.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Status update email
  statusUpdate: (data) => ({
    subject: `Application Update: ${data.newStatus}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
          .status-approved { background: #10b981; color: white; }
          .status-pending { background: #f59e0b; color: white; }
          .status-contacted { background: #3b82f6; color: white; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.name},</h2>
            <p>We have an update on your EdgeVantage application!</p>
            
            <p>Your application status has been updated to:</p>
            <p><span class="status-badge status-${data.newStatus}">${data.newStatus.toUpperCase()}</span></p>
            
            ${data.message ? `<p>${data.message}</p>` : ''}
            
            <a href="${process.env.FRONTEND_URL || 'https://edgevantagepro.com'}/account" class="button">View Full Details</a>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>The EdgeVantage Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
export async function sendEmail(to, template, data) {
  try {
    const emailContent = emailTemplates[template](data);
    
    const result = await resend.emails.send({
      from: 'EdgeVantage <noreply@edgevantagepro.com>',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    
    console.log(`✅ Email sent successfully to ${to}:`, result);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    return { success: false, error: error.message };
  }
}

// Batch send emails
export async function sendBatchEmails(recipients, template, commonData) {
  const results = await Promise.allSettled(
    recipients.map(recipient => 
      sendEmail(recipient.email, template, { ...commonData, ...recipient })
    )
  );
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.filter(r => r.status === 'rejected' || !r.value?.success).length;
  
  return { successful, failed, total: recipients.length };
}

export default { sendEmail, sendBatchEmails };