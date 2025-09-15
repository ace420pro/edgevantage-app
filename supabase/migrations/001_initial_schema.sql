-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'approved', 'rejected', 'installed');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'affiliate');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE payment_type AS ENUM ('commission', 'bonus', 'monthly_earnings');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'paypal', 'check');
CREATE TYPE affiliate_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE ab_test_status AS ENUM ('draft', 'running', 'paused', 'completed');

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    has_residence BOOLEAN NOT NULL DEFAULT false,
    has_internet BOOLEAN NOT NULL DEFAULT false,
    has_space BOOLEAN NOT NULL DEFAULT false,
    referral_source VARCHAR(100),
    referral_code VARCHAR(50),
    session_id VARCHAR(100),
    ip_address VARCHAR(45),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    user_agent TEXT,
    screen_resolution VARCHAR(20),
    submission_time TIMESTAMPTZ DEFAULT NOW(),
    time_to_complete INTEGER,
    status lead_status DEFAULT 'new',
    monthly_earnings DECIMAL(10, 2),
    equipment_type VARCHAR(100),
    installation_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for leads table
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_state ON leads(state);
CREATE INDEX idx_leads_referral_code ON leads(referral_code);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_submission_time ON leads(submission_time DESC);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'user',
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    referral_code VARCHAR(50) UNIQUE,
    referral_count INTEGER DEFAULT 0,
    total_earnings DECIMAL(10, 2) DEFAULT 0,
    status user_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for admins table
CREATE INDEX idx_admins_email ON admins(email);

-- Create affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    total_referrals INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,
    pending_commission DECIMAL(10, 2) DEFAULT 0,
    paid_commission DECIMAL(10, 2) DEFAULT 0,
    tier affiliate_tier DEFAULT 'bronze',
    status user_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for affiliates table
CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX idx_affiliates_status ON affiliates(status);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    type payment_type NOT NULL,
    status payment_status DEFAULT 'pending',
    method payment_method NOT NULL,
    reference_number VARCHAR(100),
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for payments table
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_type ON payments(type);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Create ab_tests table
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    variants JSONB DEFAULT '[]'::jsonb,
    status ab_test_status DEFAULT 'draft',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    winning_variant VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for ab_tests table
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_ab_tests_start_date ON ab_tests(start_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON ab_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get lead statistics
CREATE OR REPLACE FUNCTION get_lead_stats()
RETURNS TABLE (
    total_leads BIGINT,
    new_leads BIGINT,
    qualified_leads BIGINT,
    approved_leads BIGINT,
    conversion_rate NUMERIC,
    average_time_to_complete NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_leads,
        COUNT(CASE WHEN status = 'new' THEN 1 END)::BIGINT as new_leads,
        COUNT(CASE WHEN status = 'qualified' THEN 1 END)::BIGINT as qualified_leads,
        COUNT(CASE WHEN status = 'approved' THEN 1 END)::BIGINT as approved_leads,
        ROUND(
            CASE WHEN COUNT(*) > 0 
            THEN (COUNT(CASE WHEN status IN ('approved', 'installed') THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100)
            ELSE 0 
            END, 2
        ) as conversion_rate,
        ROUND(AVG(time_to_complete)::NUMERIC, 2) as average_time_to_complete
    FROM leads;
END;
$$ LANGUAGE plpgsql;

-- Create function to get top states
CREATE OR REPLACE FUNCTION get_top_states(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    state VARCHAR,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.state,
        COUNT(*)::BIGINT as count
    FROM leads l
    GROUP BY l.state
    ORDER BY count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get referral statistics
CREATE OR REPLACE FUNCTION get_referral_stats(p_user_id UUID)
RETURNS TABLE (
    total_referrals INTEGER,
    successful_referrals INTEGER,
    pending_commission DECIMAL,
    paid_commission DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.total_referrals,
        a.successful_referrals,
        a.pending_commission,
        a.paid_commission
    FROM affiliates a
    WHERE a.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

-- Create policies for leads table
CREATE POLICY "Public can insert leads" ON leads
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view their own leads" ON leads
    FOR SELECT TO authenticated
    USING (email = auth.jwt() ->> 'email' OR EXISTS (
        SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email'
    ));

CREATE POLICY "Admins can view all leads" ON leads
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email'
    ));

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT TO authenticated
    USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE TO authenticated
    USING (email = auth.jwt() ->> 'email')
    WITH CHECK (email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email'
    ));

-- Insert default admin user (password: Admin123!)
INSERT INTO admins (email, name, password_hash, role, permissions)
VALUES (
    'admin@edgevantagepro.com',
    'System Administrator',
    '$2a$12$LQqC1Z9Xs8rF.wXYzqKkCuP1tHR1TBYpgHcYBwFoTqZ4NeKmq5Afa', -- bcrypt hash of 'Admin123!'
    'super_admin',
    ARRAY['all']
) ON CONFLICT (email) DO NOTHING;