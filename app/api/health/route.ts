import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing environment variables',
          missing: missingVars,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Test Supabase connection
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
        return NextResponse.json(
          {
            status: 'error',
            message: 'Supabase connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          status: 'healthy',
          message: 'API is working correctly',
          database: 'connected',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        },
        { status: 200 }
      );

    } catch (dbError: any) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database connection error',
          error: dbError.message,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}