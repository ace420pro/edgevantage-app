import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/middleware/auth';
import { z } from 'zod';

// Validation schema for lead updates
const updateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'approved', 'rejected', 'installed']).optional(),
  monthly_earnings: z.number().optional(),
  equipment_type: z.string().optional(),
  installation_date: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/leads/[id] - Get single lead by ID (Admin only)
export const GET = requireAdminAuth(async (
  request: NextRequest,
  admin: any,
  { params }: { params: { id: string } }
) => {
  try {
    const supabase = createServiceRoleClient();
    
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Lead not found' 
          },
          { status: 404 }
        );
      }
      console.error('Error fetching lead:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch lead' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in GET /api/leads/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
});

// PATCH /api/leads/[id] - Update lead (Admin only)
export const PATCH = requireAdminAuth(async (
  request: NextRequest,
  admin: any,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = updateLeadSchema.safeParse(body);
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

    const supabase = createServiceRoleClient();
    
    const { data, error } = await supabase
      .from('leads')
      .update(validationResult.data)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Lead not found' 
          },
          { status: 404 }
        );
      }
      console.error('Error updating lead:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update lead' 
        },
        { status: 500 }
      );
    }

    // If status changed to approved or installed, update affiliate commission
    if (validationResult.data.status === 'approved' || validationResult.data.status === 'installed') {
      const { data: leadData } = await supabase
        .from('leads')
        .select('referral_code')
        .eq('id', params.id)
        .single();

      if (leadData?.referral_code) {
        await supabase
          .from('affiliates')
          .update({ 
            successful_referrals: supabase.raw('successful_referrals + 1'),
            pending_commission: supabase.raw('pending_commission + 50') // $50 per successful referral
          })
          .eq('referral_code', leadData.referral_code);
      }
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Lead updated successfully'
    });
  } catch (error) {
    console.error('Error in PATCH /api/leads/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
});

// DELETE /api/leads/[id] - Delete lead (Admin only)
export const DELETE = requireAdminAuth(async (
  request: NextRequest,
  admin: any,
  { params }: { params: { id: string } }
) => {
  try {
    const supabase = createServiceRoleClient();
    
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', params.id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Lead not found' 
          },
          { status: 404 }
        );
      }
      console.error('Error deleting lead:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete lead' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/leads/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
});