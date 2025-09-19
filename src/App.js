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
  // API URL - use Next.js environment variable for consistency
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  
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


  // Handle form submission with retry logic and user feedback
  const handleFormSubmit = useCallback(async (submissionData, retryCount = 0) => {
    const submissionTime = Date.now();
    const maxRetries = 3;

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }

        const errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Track successful conversion
      trackConversion({
        lead_id: result._id || result.id,
        user_email: leadData.email,
        user_state: leadData.state,
        estimated_earnings: estimatedEarnings,
        form_completion_time: leadData.timeToComplete,
        retry_count: retryCount
      });

      setCurrentStep('confirmation');
      return result;
    } catch (error) {
      console.error('Form submission error:', error);

      // Handle timeout and network errors with retry logic
      if ((error.name === 'AbortError' || error.message.includes('fetch')) && retryCount < maxRetries) {
        console.log(`Retrying submission (attempt ${retryCount + 1}/${maxRetries})...`);
        trackEvent('form_submission_retry', {
          error_message: error.message,
          retry_count: retryCount + 1,
          step: 'application'
        });

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return handleFormSubmit(submissionData, retryCount + 1);
      }

      trackEvent('form_submission_error', {
        error_message: error.message,
        retry_count: retryCount,
        step: 'application'
      });

      // Provide user-friendly error messages
      let userMessage = 'An unexpected error occurred. Please try again.';
      if (error.name === 'AbortError') {
        userMessage = 'The request timed out. Please check your internet connection and try again.';
      } else if (error.message.includes('fetch') || error.message.includes('Network')) {
        userMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('400')) {
        userMessage = 'Invalid application data. Please check your information and try again.';
      } else if (error.message.includes('500')) {
        userMessage = 'Server error. Please try again in a few moments.';
      }

      throw new Error(userMessage);
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