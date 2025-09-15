import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'No authentication token found'
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    return NextResponse.json({
      success: true,
      data: {
        admin: {
          id: decoded.adminId,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid or expired token'
      },
      { status: 401 }
    );
  }
}