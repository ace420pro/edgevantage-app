import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export async function loginAdmin(credentials: AdminLoginRequest): Promise<ApiResponse<{ admin: AdminUser }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error: ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error('Error logging in admin:', error);
    return {
      success: false,
      error: 'Failed to login. Please try again.',
    };
  }
}

export async function logoutAdmin(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error: ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error('Error logging out admin:', error);
    return {
      success: false,
      error: 'Failed to logout. Please try again.',
    };
  }
}

export async function verifyAdminToken(): Promise<ApiResponse<{ admin: AdminUser }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/verify`, {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error: ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return {
      success: false,
      error: 'Failed to verify authentication.',
    };
  }
}