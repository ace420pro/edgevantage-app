import { ApiResponse, Lead, PaginatedResponse, StatsResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function submitLead(leadData: any): Promise<ApiResponse<Lead>> {
  try {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
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
    console.error('Error submitting lead:', error);
    return {
      success: false,
      error: 'Failed to submit application. Please try again.',
    };
  }
}

export async function getLeads(
  page = 1,
  limit = 10,
  filters?: {
    status?: string;
    state?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<PaginatedResponse<Lead>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.state && { state: filters.state }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });

    const response = await fetch(`${API_BASE_URL}/leads?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('Error fetching leads:', error);
    return {
      success: false,
      error: 'Failed to fetch leads',
    };
  }
}

export async function getLead(id: string): Promise<ApiResponse<Lead>> {
  try {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('Error fetching lead:', error);
    return {
      success: false,
      error: 'Failed to fetch lead details',
    };
  }
}

export async function updateLead(
  id: string,
  updates: Partial<Lead>
): Promise<ApiResponse<Lead>> {
  try {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
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
    console.error('Error updating lead:', error);
    return {
      success: false,
      error: 'Failed to update lead',
    };
  }
}

export async function deleteLead(id: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('Error deleting lead:', error);
    return {
      success: false,
      error: 'Failed to delete lead',
    };
  }
}

export async function getLeadStats(): Promise<ApiResponse<StatsResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/leads/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('Error fetching lead stats:', error);
    return {
      success: false,
      error: 'Failed to fetch statistics',
    };
  }
}

export async function checkReferralCode(code: string): Promise<ApiResponse<boolean>> {
  try {
    const response = await fetch(`${API_BASE_URL}/referral/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('Error checking referral code:', error);
    return {
      success: false,
      error: 'Failed to verify referral code',
    };
  }
}