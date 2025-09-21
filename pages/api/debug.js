export default function handler(req, res) {
  try {
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET,
      timestamp: new Date().toISOString()
    };

    // Don't expose actual values in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(200).json({
        environment: 'production',
        message: 'Debug info limited in production',
        envCheck: envStatus,
        structure: 'pages/api'
      });
    }

    // In development, show more details
    return res.status(200).json({
      environment: 'development',
      envVars: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set',
        JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set'
      },
      structure: 'pages/api',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Debug endpoint failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}