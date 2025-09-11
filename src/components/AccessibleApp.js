import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChevronRight, DollarSign, Users, Shield, CheckCircle, Home, Wifi, Monitor, ArrowRight, Phone, Mail, MapPin, Star, Clock, TrendingUp, AlertCircle, User as UserIcon, SkipForward } from 'lucide-react';

// Import new accessibility-first components
import ProgressiveQualificationFlow from './ProgressiveQualificationFlow';
import EnhancedContactForm from './EnhancedContactForm';
import EnhancedLoadingFlow, { SubmissionErrorRecovery } from './EnhancedLoadingFlow';
import { Button, Card, Alert } from './DesignSystem';

// Import existing components (these would need to be updated with accessibility improvements)
// For now, we'll use placeholder components
const AdminDashboard = () => <div>Admin Dashboard</div>;
const UserDashboardEnhanced = () => <div>User Dashboard</div>;
const AuthModalEnhanced = ({ isOpen, onClose, onSuccess }) => isOpen ? <div>Auth Modal</div> : null;
const ResetPassword = () => <div>Reset Password</div>;
const AffiliatePortal = () => <div>Affiliate Portal</div>;
const EducationHub = () => <div>Education Hub</div>;
const ABTestManager = () => <div>AB Test Manager</div>;

/**
 * Accessible EdgeVantage Application
 * 
 * This is the redesigned main application with comprehensive accessibility improvements:
 * - WCAG 2.1 AA compliance throughout
 * - Progressive qualification flow instead of all-or-nothing
 * - Real-time form validation with accessibility
 * - Enhanced loading states with screen reader support
 * - Proper focus management and keyboard navigation
 * - Mobile-first responsive design with touch-friendly interactions
 * - Semantic HTML with ARIA labels and roles
 */

// Analytics Helper Functions (enhanced with accessibility tracking)
const trackEvent = (eventName, properties = {}) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      custom_parameter_1: properties.step || '',
      custom_parameter_2: properties.source || '',
      value: properties.value || 0,
      accessibility_enabled: properties.accessibility_enabled || false,
      ...properties
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, properties);
  }
  
  console.log('🔍 Analytics Event:', eventName, properties);
};

const trackPageView = (pageName) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_TRACKING_ID', {
      page_title: pageName,
      page_location: window.location.href,
    });
  }
  console.log('👁️ Page View:', pageName);
};

function AccessibleMainApp() {
  // API URL
  const API_URL = '';
  
  // Company Contact Information
  const COMPANY_PHONE = '(817) 204-6783';
  const COMPANY_EMAIL = 'support@edgevantagepro.com';
  
  // Application state
  const [currentStep, setCurrentStep] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(Math.random().toString(36).substring(7));
  const [startTime] = useState(Date.now());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Accessibility state
  const [skipLinksVisible, setSkipLinksVisible] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState('');
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Refs for accessibility
  const mainContentRef = useRef(null);
  const announcerRef = useRef(null);
  
  // Form data with enhanced structure
  const [formData, setFormData] = useState({
    // Qualification fields
    hasResidence: '',
    hasInternet: '',
    hasSpace: '',
    
    // Contact fields
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    referralSource: '',
    referralCode: '',
    agreeToTerms: false
  });
  
  const [referralInfo, setReferralInfo] = useState(null);

  // Check for accessibility preferences on mount
  useEffect(() => {
    // Check for prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e) => setReducedMotion(e.matches);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    
    // Check for high contrast preference (Windows)
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrastMode(highContrastQuery.matches);
    
    const handleHighContrastChange = (e) => setHighContrastMode(e.matches);
    highContrastQuery.addEventListener('change', handleHighContrastChange);
    
    // Track accessibility preferences
    trackEvent('accessibility_preferences', {
      reduced_motion: reducedMotionQuery.matches,
      high_contrast: highContrastQuery.matches,
      session_id: sessionId
    });
    
    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, [sessionId]);

  // Initialize application
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // Track initial page load with accessibility info
    trackPageView('Landing Page');
    trackEvent('page_view', {
      page: 'overview',
      session_id: sessionId,
      timestamp: startTime,
      accessibility_enabled: true
    });
  }, [sessionId, startTime]);

  // Handle referral system
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    const utm_source = urlParams.get('utm_source');
    const utm_campaign = urlParams.get('utm_campaign');
    const utm_medium = urlParams.get('utm_medium');
    
    if (refCode) {
      const mockReferralData = {
        code: refCode,
        referrerName: 'John Smith',
        bonus: 50,
        isValid: true
      };
      
      setReferralInfo(mockReferralData);
      setFormData(prev => ({ ...prev, referralCode: refCode }));
      
      trackEvent('referral_visit', {
        referral_code: refCode,
        referrer_name: mockReferralData.referrerName,
        utm_source, utm_campaign, utm_medium,
        session_id: sessionId
      });
    }
  }, [sessionId]);

  // Handle form data changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track form interactions with accessibility context
    trackEvent('form_field_interaction', {
      field_name: field,
      field_value: typeof value === 'boolean' ? value.toString() : (value?.length > 0 ? 'filled' : 'empty'),
      session_id: sessionId,
      step: currentStep,
      accessibility_enabled: true
    });
  };

  // Handle authentication success
  const handleAuthSuccess = (data) => {
    setCurrentUser(data.user);
    setShowAuthModal(false);
    
    if (data.application) {
      window.location.href = '/account';
    }
  };

  // Handle step navigation
  const handleStepChange = (newStep) => {
    const previousStep = currentStep;
    setCurrentStep(newStep);
    
    // Announce step change to screen readers
    const stepNames = {
      overview: 'Overview page',
      qualification: 'Qualification questions',
      application: 'Contact information form',
      confirmation: 'Application confirmation'
    };
    
    setAnnounceMessage(`Navigated to ${stepNames[newStep]}`);
    
    // Track step changes
    trackEvent('step_navigation', {
      from_step: previousStep,
      to_step: newStep,
      session_id: sessionId
    });
    
    // Focus management
    setTimeout(() => {
      if (mainContentRef.current) {
        mainContentRef.current.focus();
        mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    setIsLoading(true);
    setSubmissionError(null);
    
    try {
      trackEvent('form_submit_attempt', {
        session_id: sessionId,
        time_to_submit: Date.now() - startTime,
        retry_count: retryCount
      });
      
      // Simulate API call with realistic timing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sessionId: sessionId,
          submissionTime: Date.now(),
          accessibilityEnabled: true
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Track successful submission
      trackEvent('application_submitted', {
        session_id: sessionId,
        lead_id: result.leadId,
        total_time: Date.now() - startTime,
        accessibility_enabled: true
      });
      
      setAnnounceMessage('Application submitted successfully!');
      handleStepChange('confirmation');
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionError(error.message || 'Failed to submit application');
      
      trackEvent('submission_error', {
        error_message: error.message,
        retry_count: retryCount,
        session_id: sessionId
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setSubmissionError(null);
    handleFormSubmit();
  };

  // Skip links for keyboard navigation
  const SkipLinks = () => (
    <div 
      className={`fixed top-0 left-0 z-50 ${skipLinksVisible ? 'block' : 'sr-only'}`}
      onFocus={() => setSkipLinksVisible(true)}
      onBlur={() => setSkipLinksVisible(false)}
    >
      <a
        href="#main-content"
        className="bg-blue-600 text-white px-4 py-2 rounded-br-lg focus:not-sr-only"
        onFocus={() => setSkipLinksVisible(true)}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="bg-blue-600 text-white px-4 py-2 rounded-br-lg focus:not-sr-only ml-1"
      >
        Skip to navigation
      </a>
    </div>
  );

  // Live region for announcements
  useEffect(() => {
    if (announceMessage && announcerRef.current) {
      announcerRef.current.textContent = announceMessage;
    }
  }, [announceMessage]);

  // Render main content based on current step
  const renderMainContent = () => {
    switch (currentStep) {
      case 'overview':
        return (
          <OverviewPage 
            onNext={() => handleStepChange('qualification')}
            onShowAuth={() => setShowAuthModal(true)}
            currentUser={currentUser}
            referralInfo={referralInfo}
          />
        );
        
      case 'qualification':
        return (
          <ProgressiveQualificationFlow
            formData={formData}
            onFormChange={handleFormChange}
            onNext={() => handleStepChange('application')}
            onBack={() => handleStepChange('overview')}
            sessionId={sessionId}
            referralInfo={referralInfo}
          />
        );
        
      case 'application':
        return (
          <EnhancedContactForm
            formData={formData}
            onFormChange={handleFormChange}
            onSubmit={handleFormSubmit}
            onBack={() => handleStepChange('qualification')}
            isLoading={isLoading}
            referralInfo={referralInfo}
            sessionId={sessionId}
          />
        );
        
      case 'confirmation':
        return (
          <ConfirmationPage
            formData={formData}
            referralInfo={referralInfo}
            onStartNew={() => {
              setFormData({
                hasResidence: '', hasInternet: '', hasSpace: '',
                name: '', email: '', phone: '', state: '', city: '',
                referralSource: '', referralCode: '', agreeToTerms: false
              });
              handleStepChange('overview');
            }}
            sessionId={sessionId}
          />
        );
        
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className={`min-h-screen ${highContrastMode ? 'high-contrast' : ''} ${reducedMotion ? 'reduced-motion' : ''}`}>
      {/* Skip Links */}
      <SkipLinks />
      
      {/* Screen Reader Announcements */}
      <div
        ref={announcerRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      
      {/* Header */}
      <header 
        id="navigation"
        className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EdgeVantage</h1>
                <p className="text-sm text-gray-600">
                  {referralInfo ? `Referred by ${referralInfo.referrerName}` : 'Passive Income Made Simple'}
                </p>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                <span className="font-medium">500+ Active Members</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Shield className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <span className="font-medium">Fully Secure</span>
              </div>
              {currentUser ? (
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/account'}
                  leftIcon={<UserIcon className="w-4 h-4" />}
                  aria-label="Go to dashboard"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setShowAuthModal(true)}
                  leftIcon={<UserIcon className="w-4 h-4" />}
                  aria-label="Login to account"
                >
                  Login
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => handleStepChange('qualification')}
                aria-label="Start application process"
              >
                Apply Now
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        id="main-content"
        ref={mainContentRef}
        className="flex-grow"
        role="main"
        tabIndex={-1}
      >
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <div className="container-main section-padding">
            {renderMainContent()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12" role="contentinfo">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-6 h-6 text-emerald-400" aria-hidden="true" />
                <h3 className="text-lg font-bold">EdgeVantage</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted partner for passive income opportunities.
              </p>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <a 
                    href={`tel:${COMPANY_PHONE}`} 
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    Call/Text: {COMPANY_PHONE}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <a 
                    href={`mailto:${COMPANY_EMAIL}`} 
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    {COMPANY_EMAIL}
                  </a>
                </div>
              </div>
            </div>
            
            {/* Accessibility Info */}
            <div>
              <h4 className="font-semibold mb-4">Accessibility</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>This site follows WCAG 2.1 AA guidelines</p>
                <p>Keyboard navigation supported</p>
                <p>Screen reader compatible</p>
                <p>Contact us for accessibility assistance</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-gray-500 text-xs">
              © 2024 EdgeVantage. All rights reserved. | Accessible by design
            </p>
          </div>
        </div>
      </footer>
      
      {/* Enhanced Loading Flow */}
      <EnhancedLoadingFlow 
        isSubmitting={isLoading}
        onComplete={() => handleStepChange('confirmation')}
        onError={setSubmissionError}
        onRetry={handleRetry}
        formData={formData}
        sessionId={sessionId}
        maxRetries={3}
      />
      
      {/* Submission Error Recovery */}
      {submissionError && (
        <SubmissionErrorRecovery
          error={submissionError}
          onRetry={handleRetry}
          onCancel={() => setSubmissionError(null)}
          retryCount={retryCount}
          maxRetries={3}
        />
      )}
      
      {/* Auth Modal */}
      <AuthModalEnhanced 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

// Placeholder components (these would be fully implemented in practice)
const OverviewPage = ({ onNext, onShowAuth, currentUser, referralInfo }) => (
  <Card className="text-center">
    <h2 className="text-3xl font-bold mb-4">Turn Your Home Into a Passive Income Machine</h2>
    <p className="text-lg text-gray-600 mb-8">
      Join hundreds of Americans who earn guaranteed monthly income just by hosting a small computer in their home.
    </p>
    <Button variant="primary" size="xl" onClick={onNext}>
      Check If I Qualify
      <ArrowRight className="w-6 h-6 ml-3" />
    </Button>
  </Card>
);

const ConfirmationPage = ({ formData, referralInfo, onStartNew, sessionId }) => (
  <Card className="text-center">
    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
      <CheckCircle className="w-12 h-12 text-emerald-600" />
    </div>
    <h2 className="text-3xl font-bold text-gray-900 mb-4">
      Application Submitted Successfully!
    </h2>
    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
      <h3 className="text-2xl font-bold text-emerald-800 mb-3">
        Welcome to EdgeVantage, {formData.name}!
        {referralInfo && <span className="block text-lg">+ $50 Referral Bonus!</span>}
      </h3>
      <p className="text-emerald-700 text-lg">
        Your application has been received and is being reviewed.
      </p>
    </div>
    <Button variant="primary" onClick={onStartNew}>
      Submit Another Application
    </Button>
  </Card>
);

// Main App wrapper with routing
function AccessibleApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AccessibleMainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/account" element={<UserDashboardEnhanced />} />
        <Route path="/affiliate" element={<AffiliatePortal />} />
        <Route path="/academy" element={<EducationHub />} />
        <Route path="/testing" element={<ABTestManager />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default AccessibleApp;