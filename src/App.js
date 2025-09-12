import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAnalytics from './hooks/useAnalytics';
import useFormValidation from './hooks/useFormValidation';

// Lazy load components for code splitting
const Overview = lazy(() => import('./components/pages/Overview'));
const Application = lazy(() => import('./components/pages/Application'));
const Confirmation = lazy(() => import('./components/pages/Confirmation'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const ProtectedAdminRoute = lazy(() => import('./components/ProtectedAdminRoute'));
const UserDashboardEnhanced = lazy(() => import('./UserDashboardEnhanced'));
const AuthModalEnhanced = lazy(() => import('./AuthModalEnhanced'));
const ResetPassword = lazy(() => import('./ResetPassword'));
const AffiliatePortal = lazy(() => import('./AffiliatePortal'));
const EducationHub = lazy(() => import('./EducationHub'));
const ABTestManager = lazy(() => import('./ABTestManager'));

// Loading component for Suspense fallback
const LoadingSpinner = React.memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

function MainApp() {
  // API URL - use production API URL for deployment
  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://edgevantagepro.com/api' 
    : '';
  
  // Company Contact Information
  const COMPANY_PHONE_FORMATTED = '(817) 204-6783';
  const COMPANY_SMS = '+18172046783';
  const COMPANY_EMAIL = 'support@edgevantagepro.com';
  
  // Application state
  const [currentStep, setCurrentStep] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [startTime] = useState(() => Date.now());
  const [currentUser, setCurrentUser] = useState(null);
  
  
  // Referral tracking
  const [referralCode, setReferralCode] = useState('');
  const [estimatedEarnings] = useState(() => Math.floor(Math.random() * 251) + 250); // $250-$500

  // Custom hooks
  const { trackEvent, trackPageView, trackFormProgress, trackConversion } = useAnalytics();
  const { formData, setFormData, errors, setErrors, validateForm, isFormValid, canProceedToApplication, updateField } = useFormValidation();

  // Generate referral code when form is completed
  useEffect(() => {
    if (currentStep === 'confirmation' && formData.fullName) {
      const nameCode = formData.fullName.replace(/\s+/g, '').toUpperCase().substring(0, 3);
      const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();
      setReferralCode(`${nameCode}${randomCode}`);
    }
  }, [currentStep, formData.fullName]);


  // Handle form submission
  const handleFormSubmit = useCallback(async (submissionData) => {
    const submissionTime = Date.now();
    
    const leadData = {
      ...submissionData,
      sessionId,
      submissionTime: new Date(submissionTime).toISOString(),
      timeToComplete: Math.round((submissionTime - startTime) / 1000),
      referralSource: new URLSearchParams(window.location.search).get('ref') || 'direct',
      utmSource: new URLSearchParams(window.location.search).get('utm_source'),
      utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
      utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign'),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      ipAddress: 'auto-detected'
    };

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      // Track successful conversion
      trackConversion({
        lead_id: result._id,
        user_email: leadData.email,
        user_state: leadData.state,
        estimated_earnings: estimatedEarnings,
        form_completion_time: leadData.timeToComplete
      });

      setCurrentStep('confirmation');
      return result;
    } catch (error) {
      console.error('Form submission error:', error);
      trackEvent('form_submission_error', {
        error_message: error.message,
        step: 'application'
      });
      throw error;
    }
  }, [API_URL, sessionId, startTime, trackConversion, trackEvent, estimatedEarnings]);


  // REMOVED: Keyboard shortcut backdoor for security
  // Admin access is now properly secured via /admin route with authentication

  // Memoized step navigation handlers
  const handleContinue = useCallback(() => {
    trackEvent('step_navigation', { from: 'overview', to: 'application' });
    setCurrentStep('application');
  }, [trackEvent]);

  const handleBack = useCallback(() => {
    trackEvent('step_navigation', { from: 'application', to: 'overview' });
    setCurrentStep('overview');
  }, [trackEvent]);

  // Memoized props for components
  const overviewProps = useMemo(() => ({
    onContinue: handleContinue,
    trackEvent,
    trackPageView
  }), [handleContinue, trackEvent, trackPageView]);

  const applicationProps = useMemo(() => ({
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    trackEvent,
    trackFormProgress,
    trackPageView,
    onSubmit: handleFormSubmit,
    onBack: handleBack,
    validateForm,
    isFormValid,
    canProceedToApplication,
    updateField
  }), [formData, setFormData, errors, setErrors, isSubmitting, setIsSubmitting, trackEvent, trackFormProgress, trackPageView, handleFormSubmit, handleBack, validateForm, isFormValid, canProceedToApplication, updateField]);

  const confirmationProps = useMemo(() => ({
    formData,
    trackEvent,
    trackPageView,
    referralCode,
    estimatedEarnings
  }), [formData, trackEvent, trackPageView, referralCode, estimatedEarnings]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main Application Flow */}
          <Route path="/" element={
            <Suspense fallback={<LoadingSpinner />}>
              {currentStep === 'overview' && <Overview {...overviewProps} />}
              {currentStep === 'application' && <Application {...applicationProps} />}
              {currentStep === 'confirmation' && <Confirmation {...confirmationProps} />}
            </Suspense>
          } />

          {/* Admin and User Dashboard Routes */}
          <Route path="/admin" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            </Suspense>
          } />
          
          <Route path="/dashboard" element={
            <Suspense fallback={<LoadingSpinner />}>
              <UserDashboardEnhanced currentUser={currentUser} />
            </Suspense>
          } />

          <Route path="/education" element={
            <Suspense fallback={<LoadingSpinner />}>
              <EducationHub currentUser={currentUser} />
            </Suspense>
          } />

          <Route path="/affiliate" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AffiliatePortal currentUser={currentUser} />
            </Suspense>
          } />

          <Route path="/reset-password" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ResetPassword />
            </Suspense>
          } />

          <Route path="/ab-test" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ABTestManager />
            </Suspense>
          } />
        </Routes>


        {/* REMOVED: AuthModal backdoor - admin access now properly secured */}
      </div>
    </Router>
  );
}

// Wrap with React.memo for performance
const App = React.memo(MainApp);
App.displayName = 'App';

export default App;