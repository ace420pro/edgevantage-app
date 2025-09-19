// API Configuration for EdgeVantage React Components
// This file centralizes all API endpoint configurations for legacy React components

/**
 * Base API URL configuration
 * Uses Next.js environment variable for consistency with the main app
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * API Endpoints Configuration
 * All endpoints should use the centralized base URL
 */
export const API_ENDPOINTS = {
  // Lead Management
  LEADS: `${API_BASE_URL}/leads`,
  LEAD_STATS: `${API_BASE_URL}/leads/stats`,
  LEAD_BY_ID: (id) => `${API_BASE_URL}/leads/${id}`,

  // Affiliate Management
  AFFILIATES: `${API_BASE_URL}/affiliates`,
  AFFILIATE_STATS: `${API_BASE_URL}/affiliates/stats`,
  AFFILIATE_BY_ID: (id) => `${API_BASE_URL}/affiliates/${id}`,
  AFFILIATE_DASHBOARD: (code) => `${API_BASE_URL}/affiliates/${code}/dashboard`,

  // Authentication
  AUTH: `${API_BASE_URL}/auth`,
  ADMIN_AUTH: `${API_BASE_URL}/admin/auth`,
  ADMIN_VERIFY: `${API_BASE_URL}/admin/verify`,
  RESEND_VERIFICATION: `${API_BASE_URL}/auth/resend-verification`,

  // User Management
  USER_DASHBOARD: `${API_BASE_URL}/user/dashboard`,

  // A/B Testing
  AB_TESTS: `${API_BASE_URL}/ab-tests`,
  AB_TEST_RESULTS: `${API_BASE_URL}/ab-tests/results`,
  AB_TEST_BY_ID: (id) => `${API_BASE_URL}/ab-tests/${id}`,

  // Education Hub
  COURSES: `${API_BASE_URL}/courses`,
  ENROLLMENTS: `${API_BASE_URL}/enrollments`,

  // Referral System
  REFERRAL_CHECK: (code) => `${API_BASE_URL}/referral/${code}`,

  // Health Check
  HEALTH: `${API_BASE_URL}/health`
};

/**
 * HTTP Methods Configuration
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PATCH: 'PATCH',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

/**
 * Common Headers Configuration
 */
export const COMMON_HEADERS = {
  'Content-Type': 'application/json'
};

/**
 * Get authenticated headers with token
 * @param {string} token - JWT token
 * @returns {object} Headers object with authorization
 */
export const getAuthHeaders = (token) => ({
  ...COMMON_HEADERS,
  ...(token && { 'Authorization': `Bearer ${token}` })
});

/**
 * Get admin headers from session storage
 * @returns {object} Headers object with admin authorization
 */
export const getAdminHeaders = () => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('adminToken') : null;
  return getAuthHeaders(token);
};

/**
 * Fetch wrapper with standardized error handling
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise} API response
 */
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: COMMON_HEADERS,
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Environment-specific configurations
 */
export const CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second base delay
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  HTTP_METHODS,
  COMMON_HEADERS,
  getAuthHeaders,
  getAdminHeaders,
  apiRequest,
  CONFIG
};