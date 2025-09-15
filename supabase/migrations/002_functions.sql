-- Create function to get lead statistics
CREATE OR REPLACE FUNCTION get_lead_stats()
RETURNS TABLE (
    total_leads INTEGER,
    new_leads INTEGER,
    qualified_leads INTEGER,
    approved_leads INTEGER,
    conversion_rate NUMERIC,
    average_time_to_complete NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_leads,
        COUNT(CASE WHEN status = 'new' THEN 1 END)::INTEGER AS new_leads,
        COUNT(CASE WHEN status = 'qualified' THEN 1 END)::INTEGER AS qualified_leads,
        COUNT(CASE WHEN status = 'approved' OR status = 'installed' THEN 1 END)::INTEGER AS approved_leads,
        CASE
            WHEN COUNT(*) > 0 THEN
                ROUND(
                    (COUNT(CASE WHEN status = 'approved' OR status = 'installed' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100,
                    2
                )
            ELSE 0
        END AS conversion_rate,
        COALESCE(AVG(time_to_complete), 0)::NUMERIC AS average_time_to_complete
    FROM leads;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get top states
CREATE OR REPLACE FUNCTION get_top_states(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    state VARCHAR(50),
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.state,
        COUNT(*) as count
    FROM leads l
    GROUP BY l.state
    ORDER BY COUNT(*) DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get affiliate statistics
CREATE OR REPLACE FUNCTION get_affiliate_stats()
RETURNS TABLE (
    total_affiliates INTEGER,
    active_affiliates INTEGER,
    total_referrals INTEGER,
    successful_referrals INTEGER,
    pending_commission NUMERIC,
    paid_commission NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_affiliates,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::INTEGER AS active_affiliates,
        COALESCE(SUM(total_referrals), 0)::INTEGER AS total_referrals,
        COALESCE(SUM(successful_referrals), 0)::INTEGER AS successful_referrals,
        COALESCE(SUM(pending_commission), 0)::NUMERIC AS pending_commission,
        COALESCE(SUM(paid_commission), 0)::NUMERIC AS paid_commission
    FROM affiliates;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_lead_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_top_states(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_affiliate_stats() TO anon, authenticated;