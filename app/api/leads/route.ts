import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/middleware/auth';
import { withRateLimit, leadSubmissionRateLimit, adminApiRateLimit } from '@/lib/middleware/rateLimiting';
import { z } from 'zod';

// Validation schema for lead submission
const leadSchema = z.object({
  fullName: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().regex(/^[\d\s\-\(\)\+]+$/),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(50),
  hasResidence: z.boolean(),
  hasInternet: z.boolean(),
  hasSpace: z.boolean(),
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

// POST /api/leads - Create new lead (with rate limiting)
export const POST = withRateLimit(leadSubmissionRateLimit, async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = leadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createServiceRoleClient();

    // Get IP address from request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Check if email already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingLead) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'An application with this email already exists' 
        },
        { status: 409 }
      );
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
        has_residence: data.hasResidence,
        has_internet: data.hasInternet,
        has_space: data.hasSpace,
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
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to submit application' 
        },
        { status: 500 }
      );
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

    return NextResponse.json(
      { 
        success: true, 
        data: newLead,
        message: 'Application submitted successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
});

// GET /api/leads - Get all leads (with optional filters) - Admin only
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const state = searchParams.get('state');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const supabase = createServiceRoleClient();
    
    // Build query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (state) {
      query = query.eq('state', state);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch leads' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /api/leads:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
});