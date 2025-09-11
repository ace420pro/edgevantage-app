import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function that includes providers
export function renderWithRouter(ui, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>{children}</BrowserRouter>
    ),
    ...options,
  });
}

// Mock data generators
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
};

export const mockLead = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-123-4567',
  state: 'CA',
  city: 'San Francisco',
  hasResidence: true,
  hasInternet: true,
  hasSpace: true,
  referralCode: 'TEST123',
};

// Analytics mock helpers
export const mockAnalytics = () => {
  window.gtag = jest.fn();
  window.fbq = jest.fn();
};

// Wait for async updates
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

// Form helpers
export const fillForm = (getByLabelText, formData) => {
  Object.entries(formData).forEach(([label, value]) => {
    const input = getByLabelText(new RegExp(label, 'i'));
    fireEvent.change(input, { target: { value } });
  });
};

// API mock helpers
export const mockFetch = (response, status = 200) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
};

export const mockFetchError = (error = 'Network error') => {
  global.fetch = jest.fn().mockRejectedValue(new Error(error));
};

// Local storage helpers
export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

// Session storage helpers
export const setSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getSessionStorage = (key) => {
  const value = sessionStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

// Viewport helpers for responsive testing
export const setMobileViewport = () => {
  global.innerWidth = 375;
  global.innerHeight = 667;
  global.dispatchEvent(new Event('resize'));
};

export const setDesktopViewport = () => {
  global.innerWidth = 1920;
  global.innerHeight = 1080;
  global.dispatchEvent(new Event('resize'));
};

export const setTabletViewport = () => {
  global.innerWidth = 768;
  global.innerHeight = 1024;
  global.dispatchEvent(new Event('resize'));
};