export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Check environment variables
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'JWT_SECRET'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        return res.status(500).json({
          status: 'error',
          message: 'Missing environment variables',
          missing: missingVars,
          timestamp: new Date().toISOString()
        });
      }

      // Test Supabase connection
      try {
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

        // Simple test query
        const { data, error } = await supabase
          .from('leads')
          .select('id')
          .limit(1);

        if (error) {
          return res.status(500).json({
            status: 'error',
            message: 'Supabase connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }

        return res.status(200).json({
          status: 'healthy',
          message: 'API is working correctly',
          database: 'connected',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          structure: 'pages/api'
        });

      } catch (dbError) {
        return res.status(500).json({
          status: 'error',
          message: 'Database connection error',
          error: dbError.message,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}