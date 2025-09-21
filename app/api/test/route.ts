import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint without dependencies
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'API is working',
      timestamp: new Date().toISOString(),
      method: 'GET'
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json(
      {
        message: 'POST request received',
        timestamp: new Date().toISOString(),
        receivedData: body
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Invalid JSON',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}