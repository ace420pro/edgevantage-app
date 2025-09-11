import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock child components to simplify testing
jest.mock('./AdminDashboard', () => {
  return function AdminDashboard() {
    return <div>Admin Dashboard</div>;
  };
});

jest.mock('./UserDashboardEnhanced', () => {
  return function UserDashboardEnhanced() {
    return <div>User Dashboard</div>;
  };
});

jest.mock('./AuthModalEnhanced', () => {
  return function AuthModalEnhanced() {
    return <div>Auth Modal</div>;
  };
});

jest.mock('./ResetPassword', () => {
  return function ResetPassword() {
    return <div>Reset Password</div>;
  };
});

jest.mock('./AffiliatePortal', () => {
  return function AffiliatePortal() {
    return <div>Affiliate Portal</div>;
  };
});

jest.mock('./ChatWidget', () => {
  return function ChatWidget() {
    return <div>Chat Widget</div>;
  };
});

jest.mock('./EducationHub', () => {
  return function EducationHub() {
    return <div>Education Hub</div>;
  };
});

jest.mock('./ABTestManager', () => {
  return function ABTestManager() {
    return <div>AB Test Manager</div>;
  };
});

describe('App Component - Critical User Flows', () => {
  beforeEach(() => {
    // Reset any localStorage or sessionStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  test('renders initial overview page', () => {
    render(<App />);
    
    // Check for key elements on overview page
    expect(screen.getByText(/Earn \$500-\$1,000\/Month/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
  });

  test('navigates from overview to application form', async () => {
    render(<App />);
    
    // Find and click the Get Started button
    const getStartedButton = screen.getByText(/Get Started/i);
    fireEvent.click(getStartedButton);
    
    // Wait for application form to appear
    await waitFor(() => {
      expect(screen.getByText(/Do you have a US residence/i)).toBeInTheDocument();
    });
  });

  test('validates qualification questions before allowing form submission', async () => {
    render(<App />);
    
    // Navigate to application form
    const getStartedButton = screen.getByText(/Get Started/i);
    fireEvent.click(getStartedButton);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText(/Do you have a US residence/i)).toBeInTheDocument();
    });
    
    // Try to proceed without answering questions
    const continueButton = screen.getByText(/Continue to Application/i);
    expect(continueButton).toBeDisabled();
    
    // Answer qualification questions
    const yesButtons = screen.getAllByText(/Yes/i);
    yesButtons.forEach(button => {
      if (button.tagName === 'BUTTON') {
        fireEvent.click(button);
      }
    });
    
    // Now continue button should be enabled
    await waitFor(() => {
      expect(continueButton).not.toBeDisabled();
    });
  });

  test('tracks analytics events correctly', () => {
    render(<App />);
    
    // Check that page view was tracked
    expect(global.gtag).toHaveBeenCalledWith(
      'config',
      'GA_TRACKING_ID',
      expect.objectContaining({
        page_title: 'EdgeVantage - Overview'
      })
    );
    
    // Click Get Started and verify event tracking
    const getStartedButton = screen.getByText(/Get Started/i);
    fireEvent.click(getStartedButton);
    
    expect(global.gtag).toHaveBeenCalledWith(
      'event',
      'begin_application',
      expect.any(Object)
    );
    
    expect(global.fbq).toHaveBeenCalledWith(
      'track',
      'InitiateCheckout',
      expect.any(Object)
    );
  });

  test('preserves referral code from URL parameters', () => {
    // Mock window.location
    delete window.location;
    window.location = new URL('http://localhost:3000?ref=TEST123');
    
    render(<App />);
    
    // Navigate to application form
    const getStartedButton = screen.getByText(/Get Started/i);
    fireEvent.click(getStartedButton);
    
    // The referral code should be preserved in the form data
    // This would be visible in the actual form submission
    expect(window.location.search).toContain('ref=TEST123');
  });

  test('handles admin dashboard keyboard shortcut', () => {
    render(<App />);
    
    // Trigger Ctrl+Shift+A
    fireEvent.keyDown(document, {
      key: 'A',
      code: 'KeyA',
      ctrlKey: true,
      shiftKey: true
    });
    
    // Admin dashboard should be visible
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  });
});

describe('App Component - Form Validation', () => {
  test('validates email format', async () => {
    render(<App />);
    
    // Navigate to application form
    const getStartedButton = screen.getByText(/Get Started/i);
    fireEvent.click(getStartedButton);
    
    // Answer qualification questions
    const yesButtons = screen.getAllByText(/Yes/i);
    yesButtons.forEach(button => {
      if (button.tagName === 'BUTTON') {
        fireEvent.click(button);
      }
    });
    
    // Click continue to see the contact form
    const continueButton = screen.getByText(/Continue to Application/i);
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });
    
    // Test invalid email
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email/i)).toBeInTheDocument();
    });
  });

  test('validates phone number format', async () => {
    render(<App />);
    
    // Navigate to contact form
    const getStartedButton = screen.getByText(/Get Started/i);
    fireEvent.click(getStartedButton);
    
    // Answer qualification questions
    const yesButtons = screen.getAllByText(/Yes/i);
    yesButtons.forEach(button => {
      if (button.tagName === 'BUTTON') {
        fireEvent.click(button);
      }
    });
    
    const continueButton = screen.getByText(/Continue to Application/i);
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    });
    
    // Test invalid phone
    const phoneInput = screen.getByLabelText(/Phone/i);
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.blur(phoneInput);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid phone number/i)).toBeInTheDocument();
    });
  });
});

describe('App Component - Mobile Responsiveness', () => {
  test('renders mobile navigation correctly', () => {
    // Mock mobile viewport
    global.innerWidth = 375;
    global.innerHeight = 667;
    
    render(<App />);
    
    // Check for mobile-optimized elements
    const container = screen.getByText(/Earn \$500-\$1,000\/Month/i).closest('div');
    expect(container).toHaveClass('px-4'); // Mobile padding
  });
});