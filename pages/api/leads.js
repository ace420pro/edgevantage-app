const { z } = require('zod');

// Validation schema for lead submission
const leadSchema = z.object({
  fullName: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().regex(/^[\d\s\-\(\)\+]+$/),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(50),
  hasResidence: z.boolean().default(true),
  hasInternet: z.boolean().default(true),
  hasSpace: z.boolean().default(true),
  referralCode: z.string().optional(),
  sessionId: z.string().optional(),
  submissionTime: z.string().optional(),
  timeToComplete: z.number().optional(),
  referralSource: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  userAgent: z.string().optional(),
  screenResolution: z.string().optional(),
  ipAddress: z.string().optional(),
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Validate request body
      const validationResult = leadSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.errors
        });
      }

      const data = validationResult.data;

      // Create Supabase client
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Get IP address from request headers
      const forwardedFor = req.headers['x-forwarded-for'];
      const realIp = req.headers['x-real-ip'];
      const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : realIp || 'unknown';

      // Check if email already exists
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existingLead) {
        return res.status(409).json({
          success: false,
          error: 'An application with this email already exists'
        });
      }

      // Insert new lead
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          city: data.city,
          state: data.state,
          has_residence: data.hasResidence || true,
          has_internet: data.hasInternet || true,
          has_space: data.hasSpace || true,
          referral_code: data.referralCode,
          referral_source: data.referralSource,
          session_id: data.sessionId,
          ip_address: ipAddress,
          utm_source: data.utmSource,
          utm_medium: data.utmMedium,
          utm_campaign: data.utmCampaign,
          user_agent: data.userAgent,
          screen_resolution: data.screenResolution,
          submission_time: data.submissionTime || new Date().toISOString(),
          time_to_complete: data.timeToComplete,
          status: 'new'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting lead:', insertError);
        return res.status(500).json({
          success: false,
          error: 'Failed to submit application'
        });
      }

      // Update referral statistics if referral code exists
      if (data.referralCode) {
        const { error: updateError } = await supabase
          .from('affiliates')
          .update({
            total_referrals: supabase.raw('total_referrals + 1')
          })
          .eq('referral_code', data.referralCode);

        if (updateError) {
          console.error('Error updating referral stats:', updateError);
        }
      }

      return res.status(201).json({
        success: true,
        data: newLead,
        message: 'Application submitted successfully'
      });

    } catch (error) {
      console.error('Lead submission error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }

  } else if (req.method === 'GET') {
    // Simple GET for testing
    return res.status(200).json({
      message: 'Leads API is working',
      method: 'GET',
      timestamp: new Date().toISOString()
    });

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}