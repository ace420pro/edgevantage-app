import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/middleware/auth';

// GET /api/leads/stats - Get lead statistics (Admin only)
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const supabase = createServiceRoleClient();
    
    // Get overall statistics using the database function
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_lead_stats');

    if (statsError) {
      console.error('Error fetching lead stats:', statsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch statistics' 
        },
        { status: 500 }
      );
    }

    // Get top states
    const { data: topStates, error: statesError } = await supabase
      .rpc('get_top_states', { limit_count: 5 });

    if (statesError) {
      console.error('Error fetching top states:', statesError);
    }

    // Get recent leads
    const { data: recentLeads, error: recentError } = await supabase
      .from('leads')
      .select('id, full_name, state, created_at, status')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error fetching recent leads:', recentError);
    }

    // Get referral source statistics
    const { data: referralStats, error: referralError } = await supabase
      .from('leads')
      .select('referral_source')
      .not('referral_source', 'is', null);

    let topReferralSources: Array<{ source: string; count: number }> = [];
    if (referralStats) {
      const sourceCount = referralStats.reduce((acc: Record<string, number>, lead) => {
        const source = lead.referral_source || 'direct';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      topReferralSources = Object.entries(sourceCount)
        .map(([source, count]) => ({ source, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

    // Get daily lead count for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: dailyLeads, error: dailyError } = await supabase
      .from('leads')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    let dailyStats: Array<{ date: string; count: number }> = [];
    if (dailyLeads) {
      const dailyCount = dailyLeads.reduce((acc: Record<string, number>, lead) => {
        const date = new Date(lead.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Fill in missing days with 0
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        if (!dailyCount[dateStr]) {
          dailyCount[dateStr] = 0;
        }
      }

      dailyStats = Object.entries(dailyCount)
        .map(([date, count]) => ({ date, count: count as number }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    // Format recent activity
    const recentActivity = recentLeads?.map(lead => ({
      type: 'new_lead',
      description: `${lead.full_name} from ${lead.state} submitted an application`,
      timestamp: lead.created_at,
      status: lead.status
    })) || [];

    const response = {
      totalLeads: statsData?.total_leads || 0,
      newLeads: statsData?.new_leads || 0,
      qualifiedLeads: statsData?.qualified_leads || 0,
      approvedLeads: statsData?.approved_leads || 0,
      conversionRate: statsData?.conversion_rate || 0,
      averageTimeToComplete: statsData?.average_time_to_complete || 0,
      topStates: topStates || [],
      topReferralSources,
      dailyStats,
      recentActivity
    };

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error in GET /api/leads/stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
});