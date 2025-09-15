import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AdminUser {
  adminId: string;
  email: string;
  role: string;
  permissions: string[];
}

export function verifyAdminToken(request: NextRequest): AdminUser | null {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    return {
      adminId: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || []
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function requireAdminAuth(
  handler: (request: NextRequest, admin: AdminUser, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const admin = verifyAdminToken(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    return handler(request, admin, ...args);
  };
}

export function requirePermission(permission: string) {
  return function(
    handler: (request: NextRequest, admin: AdminUser, ...args: any[]) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
      const admin = verifyAdminToken(request);

      if (!admin) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required'
          },
          { status: 401 }
        );
      }

      if (!admin.permissions.includes('all') && !admin.permissions.includes(permission)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions'
          },
          { status: 403 }
        );
      }

      return handler(request, admin, ...args);
    };
  };
}