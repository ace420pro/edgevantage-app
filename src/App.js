import React, { useState, useEffect } from 'react';
import { ChevronRight, DollarSign, Users, Shield, CheckCircle, Home, Wifi, Monitor, ArrowRight, Phone, Mail, MapPin, Star, Clock, TrendingUp, AlertCircle, Loader2, X } from 'lucide-react';

// Analytics Helper Functions
const trackEvent = (eventName, properties = {}) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      custom_parameter_1: properties.step || '',
      custom_parameter_2: properties.source || '',
      value: properties.value || 0,
      ...properties
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, properties);
  }
  
  // Console log for development
  console.log(' Analytics Event:', eventName, properties);
};

const trackPageView = (pageName) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_TRACKING_ID', {
      page_title: pageName,
      page_location: window.location.href,
    });
  }
  console.log(' Page View:', pageName);
};

const trackFormProgress = (step, completionPercentage) => {
  trackEvent('form_progress', {
    step: step,
    completion_percentage: completionPercentage,
    event_category: 'Form',
    event_label: `Step ${step}`
  });
};

const trackConversion = (conversionType, value = 0) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    conversion_value: value,
    event_category: 'Conversion',
    currency: 'USD'
  });
};

function App() {
  const [currentStep, setCurrentStep] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [sessionId] = useState(Math.random().toString(36).substring(7));
  const [startTime] = useState(Date.now());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    hasResidence: '',
    hasInternet: '',
    hasSpace: '',
    referralSource: '',
    agreeToTerms: false,
    referralCode: '' // Add referral tracking
  });
  const [formErrors, setFormErrors] = useState({});
  const [emailOnlyCapture, setEmailOnlyCapture] = useState('');
  const [referralInfo, setReferralInfo] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Initialize Analytics on component mount
  useEffect(() => {
    // Track initial page load
    trackPageView('Landing Page');
    trackEvent('page_view', {
      page: 'overview',
      session_id: sessionId,
      timestamp: startTime
    });

    // Initialize heatmap tracking (Hotjar/Microsoft Clarity simulation)
    if (typeof window !== 'undefined') {
      // Simulate heatmap initialization
      console.log(' Heatmap tracking initialized');
    }
  }, [sessionId, startTime]);

  // Referral System - Check URL parameters on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    const utm_source = urlParams.get('utm_source');
    const utm_campaign = urlParams.get('utm_campaign');
    const utm_medium = urlParams.get('utm_medium');
    
    if (refCode) {
      // Simulate referral code lookup
      const mockReferralData = {
        code: refCode,
        referrerName: 'John Smith',
        bonus: 50, // $50 bonus for successful referral
        isValid: true
      };
      
      setReferralInfo(mockReferralData);
      setFormData(prev => ({ ...prev, referralCode: refCode }));
      
      // Track referral traffic
      trackEvent('referral_visit', {
        referral_code: refCode,
        referrer_name: mockReferralData.referrerName,
        utm_source: utm_source,
        utm_campaign: utm_campaign,
        utm_medium: utm_medium,
        session_id: sessionId
      });
    }
    
    // Track UTM parameters for marketing attribution
    if (utm_source || utm_campaign) {
      trackEvent('utm_tracking', {
        utm_source: utm_source || 'direct',
        utm_campaign: utm_campaign || 'none',
        utm_medium: utm_medium || 'none',
        session_id: sessionId
      });
    }
  }, [sessionId]);

  // Email validation
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Phone validation
  const validatePhone = (phone) => {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.referralSource) {
      errors.referralSource = 'Please select how you heard about us';
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms of service';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track form field interactions
    trackEvent('form_field_interaction', {
      field_name: field,
      field_value: typeof value === 'boolean' ? value.toString() : (value?.length > 0 ? 'filled' : 'empty'),
      session_id: sessionId,
      step: currentStep
    });
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Track qualification progress
    if (['hasResidence', 'hasInternet', 'hasSpace'].includes(field)) {
      const qualificationAnswers = {
        ...formData,
        [field]: value
      };
      const answeredCount = Object.values(qualificationAnswers)
        .filter(answer => answer === 'yes' || answer === 'no').length;
      const qualificationProgress = (answeredCount / 3) * 100;
      
      trackFormProgress('qualification', qualificationProgress);
      
      if (value === 'no') {
        trackEvent('disqualification', {
          reason: field,
          session_id: sessionId
        });
      }
    }
  };

  const handleNext = async () => {
    if (currentStep === 'overview') {
      // Track CTA clicks
      trackEvent('cta_click', {
        cta_location: 'overview_page',
        cta_text: 'Check If I Qualify',
        session_id: sessionId
      });
      
      setCurrentStep('application');
      trackPageView('Application Form');
    } else if (currentStep === 'application') {
      if (!validateForm()) {
        // Track form validation errors
        const errorFields = Object.keys(formErrors);
        trackEvent('form_validation_error', {
          error_fields: errorFields.join(','),
          error_count: errorFields.length,
          session_id: sessionId
        });
        
        // Scroll to first error
        const firstError = Object.keys(formErrors)[0];
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
        return;
      }
      
      // Track successful form submission
      trackEvent('form_submit_attempt', {
        session_id: sessionId,
        time_to_submit: Date.now() - startTime,
        referral_source: formData.referralSource
      });
      
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      
      // Track successful conversion
      trackConversion('application_completed', 500); // $500 estimated value
      trackEvent('application_success', {
        session_id: sessionId,
        user_email: formData.email,
        user_state: formData.state,
        user_city: formData.city,
        referral_source: formData.referralSource,
        total_time: Date.now() - startTime
      });
      
      setCurrentStep('confirmation');
      trackPageView('Thank You Page');
    }
  };

  const handleEmailCapture = async () => {
    if (!validateEmail(emailOnlyCapture)) {
      return;
    }
    
    // Track email capture attempt
    trackEvent('email_capture_attempt', {
      email: emailOnlyCapture,
      capture_type: 'popup',
      session_id: sessionId
    });
    
    setIsLoading(true);
    // Simulate email capture
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setEmailCaptured(true);
    
    // Track successful email capture
    trackConversion('email_captured', 50); // $50 estimated value
    trackEvent('email_capture_success', {
      email: emailOnlyCapture,
      session_id: sessionId
    });
    
    setTimeout(() => {
      setShowEmailCapture(false);
      setEmailCaptured(false);
    }, 3000);
  };

  const canProceedToApplication = () => {
    return formData.hasResidence === 'yes' && 
           formData.hasInternet === 'yes' && 
           formData.hasSpace === 'yes';
  };

  const canSubmitApplication = () => {
    return formData.name && 
           formData.email && 
           formData.phone && 
           formData.state && 
           formData.city && 
           formData.referralSource &&
           formData.agreeToTerms &&
           canProceedToApplication();
  };

  // Email capture popup
  const EmailCapturePopup = () => {
    if (!showEmailCapture) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in duration-300">
          <button
            onClick={() => setShowEmailCapture(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
          
          {!emailCaptured ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Wait! Don't Miss Out</h3>
                <p className="text-gray-600">Get our free guide: "5 Ways to Maximize Your Passive Income" sent to your inbox!</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="email"
                  value={emailOnlyCapture}
                  onChange={(e) => setEmailOnlyCapture(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleEmailCapture}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Me The Free Guide'
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">No spam. Unsubscribe anytime.</p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600">Check your email for the free passive income guide!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Trigger email capture on scroll or time
  React.useEffect(() => {
    let scrollTriggered = false;
    let timeTriggered = false;

    const handleScroll = () => {
      if (!scrollTriggered && window.scrollY > window.innerHeight * 0.7) {
        scrollTriggered = true;
        
        // Track scroll depth
        trackEvent('scroll_depth', {
          depth_percentage: 70,
          session_id: sessionId,
          trigger_type: 'scroll'
        });
        
        setTimeout(() => {
          setShowEmailCapture(true);
          trackEvent('email_popup_shown', {
            trigger: 'scroll',
            scroll_depth: 70,
            session_id: sessionId
          });
        }, 1000);
      }
    };

    const timeoutId = setTimeout(() => {
      if (!timeTriggered && !scrollTriggered) {
        timeTriggered = true;
        setShowEmailCapture(true);
        trackEvent('email_popup_shown', {
          trigger: 'time',
          time_on_page: 30000,
          session_id: sessionId
        });
      }
    }, 30000); // Show after 30 seconds

    // Track engagement time
    const engagementInterval = setInterval(() => {
      trackEvent('engagement_time', {
        time_on_page: Date.now() - startTime,
        session_id: sessionId,
        current_step: currentStep
      });
    }, 30000); // Every 30 seconds

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
      clearInterval(engagementInterval);
    };
  }, [sessionId, startTime, currentStep]);

  // Admin Dashboard Component
  const AdminDashboard = () => {
    const [applications, setApplications] = useState([
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@email.com',
        phone: '(555) 123-4567',
        state: 'Texas',
        city: 'Austin',
        status: 'approved',
        submitted: '2024-01-15',
        referralCode: 'SARAH123',
        monthlyEarnings: 750
      },
      {
        id: 2,
        name: 'Mike Rodriguez',
        email: 'mike@email.com',
        phone: '(555) 987-6543',
        state: 'Florida',
        city: 'Miami',
        status: 'pending',
        submitted: '2024-01-20',
        referralCode: null,
        monthlyEarnings: 0
      },
      {
        id: 3,
        name: 'Jennifer Lee',
        email: 'jen@email.com',
        phone: '(555) 456-7890',
        state: 'California',
        city: 'Los Angeles',
        status: 'approved',
        submitted: '2024-01-18',
        referralCode: 'FRIEND567',
        monthlyEarnings: 600
      }
    ]);

    const [stats, setStats] = useState({
      totalApplications: 523,
      approvedApplications: 387,
      pendingApplications: 89,
      rejectedApplications: 47,
      totalReferrals: 156,
      avgMonthlyPayout: 675,
      topStates: [
        { state: 'California', count: 45 },
        { state: 'Texas', count: 38 },
        { state: 'Florida', count: 32 },
        { state: 'New York', count: 28 }
      ]
    });

    if (!showAdminDashboard) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-screen p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-7xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">EdgeVantage Admin Dashboard</h2>
              <button
                onClick={() => setShowAdminDashboard(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-blue-600 mb-2">Total Applications</h3>
                <p className="text-3xl font-bold text-blue-900">{stats.totalApplications}</p>
                <p className="text-sm text-blue-600 mt-1">+12% this month</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-green-600 mb-2">Approved</h3>
                <p className="text-3xl font-bold text-green-900">{stats.approvedApplications}</p>
                <p className="text-sm text-green-600 mt-1">74% approval rate</p>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-yellow-600 mb-2">Avg Monthly Payout</h3>
                <p className="text-3xl font-bold text-yellow-900">${stats.avgMonthlyPayout}</p>
                <p className="text-sm text-yellow-600 mt-1">Per member</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-purple-600 mb-2">Referrals</h3>
                <p className="text-3xl font-bold text-purple-900">{stats.totalReferrals}</p>
                <p className="text-sm text-purple-600 mt-1">30% of applications</p>
              </div>
            </div>

            {/* Top States */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top States by Applications</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.topStates.map((item, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                    <p className="text-sm text-gray-600">{item.state}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Recent Applications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{app.name}</div>
                            <div className="text-sm text-gray-500">{app.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.city}, {app.state}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            app.status === 'approved' ? 'bg-green-100 text-green-800' :
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.referralCode || 'Direct'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${app.monthlyEarnings}/mo
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.submitted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Admin access via secret key combination
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Admin access: Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminDashboard(true);
        trackEvent('admin_access', {
          session_id: sessionId,
          timestamp: Date.now()
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sessionId]);

  // Referral Bonus Banner Component
  const ReferralBanner = () => {
    if (!referralInfo || !referralInfo.isValid) return null;

    return (
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 text-center relative">
        <div className="flex items-center justify-center space-x-2">
          <Star className="w-5 h-5 text-yellow-300" />
          <span className="font-semibold">
             Referred by {referralInfo.referrerName}! You'll get an extra ${referralInfo.bonus} bonus when approved!
          </span>
          <Star className="w-5 h-5 text-yellow-300" />
        </div>
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setReferralInfo(null)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (currentStep === 'overview') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <EmailCapturePopup />
        <AdminDashboard />
        <ReferralBanner />
        
        {/* Sticky CTA Bar */}
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-2 px-4 text-center text-sm font-medium z-40 shadow-lg" style={{ marginTop: referralInfo ? '48px' : '0' }}>
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline"> Limited spots available - Join 500+ earning members today!</span>
            <span className="sm:hidden"> Limited spots - Join 500+ members!</span>
          </div>
        </div>

        {/* Header - Improved Mobile */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100" style={{ marginTop: referralInfo ? '88px' : '48px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">EdgeVantage</h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {referralInfo ? `Referred by ${referralInfo.referrerName}` : 'Passive Income Made Simple'}
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">500+ Active Members</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Fully Secure</span>
                </div>
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Apply Now
                </button>
              </div>
              {/* Mobile CTA */}
              <button
                onClick={handleNext}
                className="lg:hidden bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section - Mobile Optimized */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 border border-emerald-200">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-emerald-600" />
              Earn $500-$1000 Every Month
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
              Turn Your Home Into a 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600"> Passive Income</span> Machine
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-4">
              Join hundreds of Americans who earn guaranteed monthly income just by hosting a small computer in their home. 
              <span className="font-semibold text-gray-800"> No work required after setup.</span>
            </p>

            {/* Early CTA - Mobile Optimized */}
            <div className="mb-8 sm:mb-12">
              <button
                onClick={handleNext}
                className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl text-lg sm:text-xl font-bold hover:shadow-xl transition-all duration-200 transform hover:scale-105 mb-4 w-full sm:w-auto justify-center"
              >
                Check If I Qualify
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
              </button>
              <p className="text-gray-500 text-sm px-4">Free application • Takes 2 minutes • Instant qualification check</p>
            </div>

            {/* Trust Badges - Mobile Stack */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12 sm:mb-16 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium">500+ Members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Est. 2022</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Guaranteed Payments</span>
              </div>
            </div>
          </div>

          {/* Social Proof - Mobile Optimized */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-200 mb-12 sm:mb-16">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">What Our Members Say</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic text-sm sm:text-base">"Getting $800 every month has been life-changing. The setup was so easy and I literally don't think about it anymore."</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">Sarah M. - Texas</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic text-sm sm:text-base">"I was skeptical at first, but EdgeVantage has paid me consistently for 8 months now. Best decision I made this year."</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">Mike R. - Florida</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic text-sm sm:text-base">"The extra $600 per month covers my car payment. It's the easiest money I've ever made."</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">Jennifer L. - California</p>
              </div>
            </div>
          </div>

          {/* Value Proposition Cards - Mobile Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Guaranteed Income</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Receive $500-$1000 every month, automatically deposited to your account. No variability, no uncertainty.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Trusted Network</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Join 500+ Americans nationwide who trust us with their passive income goals. Real people, real results.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Zero Risk</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Everything we do is completely transparent and causes no impact to you or your home. Full peace of mind.
              </p>
            </div>
          </div>

          {/* How It Works - Mobile Optimized */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 sm:p-12 mb-12 sm:mb-16 border border-gray-200">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Here's How It Works</h3>
              <p className="text-lg sm:text-xl text-gray-600">Simple steps to start earning passive income</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl transition-shadow border border-blue-100">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                </div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-sm font-bold">1</div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Quick Application</h4>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Fill out our simple form to see if you qualify. Takes less than 2 minutes.</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl transition-shadow border border-emerald-100">
                  <Monitor className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
                </div>
                <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-sm font-bold">2</div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Easy Setup</h4>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">We ship you a small computer and handle all the technical setup for you.</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl transition-shadow border border-purple-100">
                  <Wifi className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                </div>
                <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-sm font-bold">3</div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Safe Connection</h4>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">We securely use your internet connection to create accounts on various platforms.</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl transition-shadow border border-yellow-100">
                  <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" />
                </div>
                <div className="bg-yellow-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-sm font-bold">4</div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Get Paid</h4>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Receive your guaranteed monthly payment automatically. That's it!</p>
              </div>
            </div>

            {/* CTA within How It Works */}
            <div className="text-center mt-8 sm:mt-12">
              <button
                onClick={handleNext}
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 sm:px-8 py-3 rounded-xl text-base sm:text-lg font-bold hover:shadow-lg transition-all transform hover:scale-105 w-full sm:w-auto justify-center"
              >
                Start Step 1 Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Requirements + CTA - Mobile Optimized */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-lg border border-gray-200 mb-12 sm:mb-16">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Do You Qualify?</h3>
              <p className="text-lg sm:text-xl text-gray-600">Just three simple requirements to get started</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
              <div className="flex items-start space-x-4 p-4 sm:p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">US Residence</h4>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">You need a valid US address with proof of residence (utility bill, lease, etc.)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 sm:p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Internet Access</h4>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">A reliable broadband internet connection (most home internet works fine)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 sm:p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Small Space</h4>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Room for a mini computer (size of a small book) near an electrical outlet</p>
                </div>
              </div>
            </div>

            {/* CTA in Requirements */}
            <div className="text-center">
              <button
                onClick={handleNext}
                className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl text-lg sm:text-xl font-bold hover:shadow-xl transition-all duration-200 transform hover:scale-105 mb-4 w-full sm:w-auto justify-center"
              >
                See If I Qualify Now
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
              </button>
              <p className="text-gray-500 text-sm">Most people qualify • Free application • Instant results</p>
            </div>
          </div>

          {/* FAQ Section - Mobile Optimized */}
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl p-8 sm:p-12 mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">How much will I actually earn?</h4>
                <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">You'll earn between $500-$1000 per month, paid automatically. The exact amount depends on your location and internet speed.</p>
                
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">What does the computer actually do?</h4>
                <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">It uses your internet connection and residential IP address to create accounts on various platforms and services that require US-based users.</p>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Will this affect my internet or electricity bill?</h4>
                <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">Minimal impact - the device uses about as much power as a phone charger and very little bandwidth.</p>
                
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">How do I know this is legitimate?</h4>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">We have 500+ active members earning consistently. You can verify everything during our onboarding call before any equipment is shipped.</p>
              </div>
            </div>
          </div>

          {/* Final CTA Section - Mobile Optimized */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Start Earning $500-$1000 Monthly?</h3>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100">Join hundreds of Americans already earning passive income with EdgeVantage</p>
            
            <button
              onClick={handleNext}
              className="inline-flex items-center bg-white text-blue-600 px-8 sm:px-10 py-3 sm:py-4 rounded-2xl text-lg sm:text-xl font-bold hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full sm:w-auto justify-center"
            >
              Apply in Under 2 Minutes
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
            </button>
            
            <p className="text-blue-200 text-sm mt-4 sm:mt-6">Free to apply • Instant qualification • 21+ only • US residents</p>
          </div>
        </section>
      </div>
    );
  }

  if (currentStep === 'application') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header - Mobile Optimized */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">EdgeVantage</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Quick Application</p>
                </div>
              </div>
              <button 
                onClick={() => setCurrentStep('overview')}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-200">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Let's See If You Qualify!</h2>
              <p className="text-lg sm:text-xl text-gray-600">Just a few quick questions to get started</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-8 sm:mb-12">
              <div 
                className="bg-gradient-to-r from-blue-600 to-emerald-600 h-2 sm:h-3 rounded-full transition-all duration-500" 
                style={{ width: canSubmitApplication() ? '100%' : '50%' }}
              ></div>
            </div>

            {/* Qualification Questions */}
            <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Qualification Check</h3>
              
              <div className="space-y-4">
                <label className="block text-base sm:text-lg font-semibold text-gray-700">
                  Do you have a US residence with proof of address?
                </label>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">We'll need to verify your address with a utility bill or lease agreement</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleInputChange('hasResidence', 'yes')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all font-semibold text-sm sm:text-base ${
                      formData.hasResidence === 'yes' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✓ Yes, I have proof
                  </button>
                  <button
                    onClick={() => handleInputChange('hasResidence', 'no')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all font-semibold text-sm sm:text-base ${
                      formData.hasResidence === 'no' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✗ No, I don't
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-base sm:text-lg font-semibold text-gray-700">
                  Do you have reliable internet access at home?
                </label>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Most home broadband connections work perfectly fine</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleInputChange('hasInternet', 'yes')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all font-semibold text-sm sm:text-base ${
                      formData.hasInternet === 'yes' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✓ Yes, I have internet
                  </button>
                  <button
                    onClick={() => handleInputChange('hasInternet', 'no')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all font-semibold text-sm sm:text-base ${
                      formData.hasInternet === 'no' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✗ No internet access
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-base sm:text-lg font-semibold text-gray-700">
                  Do you have space for a small computer near an outlet?
                </label>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">The device is about the size of a small book and needs to stay plugged in</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleInputChange('hasSpace', 'yes')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all font-semibold text-sm sm:text-base ${
                      formData.hasSpace === 'yes' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✓ Yes, I have space
                  </button>
                  <button
                    onClick={() => handleInputChange('hasSpace', 'no')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all font-semibold text-sm sm:text-base ${
                      formData.hasSpace === 'no' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✗ No available space
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Information - Only show if qualified */}
            {canProceedToApplication() && (
              <div className="space-y-6 border-t border-gray-200 pt-8 sm:pt-10">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-700">Excellent! You qualify. Let's get your details:</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Your full name"
                    />
                    {formErrors.name && (
                      <div className="flex items-center mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.name}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {formErrors.email && (
                      <div className="flex items-center mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {formErrors.phone && (
                      <div className="flex items-center mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.phone}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full px-4 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg ${
                        formErrors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Your state"
                    />
                    {formErrors.state && (
                      <div className="flex items-center mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.state}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg ${
                      formErrors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your city"
                  />
                  {formErrors.city && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.city}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">How did you hear about EdgeVantage? *</label>
                  <select
                    name="referralSource"
                    value={formData.referralSource}
                    onChange={(e) => handleInputChange('referralSource', e.target.value)}
                    className={`w-full px-4 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg ${
                      formErrors.referralSource ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Please select...</option>
                    <option value="google">Google Search</option>
                    <option value="social-media">Social Media</option>
                    <option value="friend-referral">Friend or Family Referral</option>
                    <option value="advertisement">Online Advertisement</option>
                    <option value="networking">Networking Event</option>
                    <option value="referral-link">Referral Link</option>
                    <option value="other">Other</option>
                  </select>
                  {formErrors.referralSource && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.referralSource}
                    </div>
                  )}
                </div>

                {/* Referral Code Field - Show if referral detected or selected */}
                {(referralInfo || formData.referralSource === 'referral-link' || formData.referralSource === 'friend-referral') && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 sm:p-6">
                    <label className="block text-sm font-semibold text-emerald-700 mb-2 sm:mb-3">
                      Referral Code {referralInfo ? '(Auto-filled)' : ''}
                    </label>
                    <input
                      type="text"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 sm:py-4 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base sm:text-lg bg-white"
                      placeholder="Enter referral code"
                      readOnly={!!referralInfo}
                    />
                    {referralInfo && (
                      <div className="flex items-center mt-2 text-emerald-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Valid referral! You'll get an extra ${referralInfo.bonus} bonus when approved.
                      </div>
                    )}
                  </div>
                )}

                <div className={`flex items-start space-x-4 p-4 sm:p-6 bg-blue-50 rounded-xl border ${
                  formErrors.agreeToTerms ? 'border-red-200' : 'border-blue-200'
                }`}>
                  <input
                    type="checkbox"
                    id="terms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold">I confirm that:</span> I am 21+ years old, a US resident, and agree to EdgeVantage's terms of service. 
                      I understand that EdgeVantage will place a small computer in my home and use my residential information 
                      to create accounts on various platforms in exchange for guaranteed monthly payments of $500-$1000.
                    </label>
                    {formErrors.agreeToTerms && (
                      <div className="flex items-center mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.agreeToTerms}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Disqualification Message */}
            {(formData.hasResidence === 'no' || formData.hasInternet === 'no' || formData.hasSpace === 'no') && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8 text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-red-800 mb-3 sm:mb-4">We're sorry, but you don't qualify at this time</h3>
                <p className="text-red-700 text-base sm:text-lg leading-relaxed">
                  Our program requires a US residence with proof of address, reliable internet access, and space for our equipment. 
                  Feel free to apply again if your situation changes in the future!
                </p>
              </div>
            )}

            {/* Submit Button */}
            {canProceedToApplication() && (
              <div className="text-center mt-8 sm:mt-10">
                <button
                  onClick={handleNext}
                  disabled={!canSubmitApplication() || isLoading}
                  className={`inline-flex items-center px-8 sm:px-10 py-3 sm:py-4 rounded-2xl text-lg sm:text-xl font-bold transition-all duration-200 w-full sm:w-auto justify-center ${
                    canSubmitApplication() && !isLoading
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit My Application
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'confirmation') {
    const generateReferralLink = () => {
      const referralCode = formData.name.split(' ').map(n => n.substring(0, 3).toUpperCase()).join('') + Math.floor(Math.random() * 100);
      return `${window.location.origin}?ref=${referralCode}`;
    };

    const copyReferralLink = async () => {
      const link = generateReferralLink();
      try {
        await navigator.clipboard.writeText(link);
        trackEvent('referral_link_copied', {
          referral_code: link.split('ref=')[1],
          user_email: formData.email,
          session_id: sessionId
        });
        alert('Referral link copied! Share it to earn $50 for each successful referral.');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center border border-gray-200">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-in zoom-in duration-500">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Application Submitted Successfully! </h2>
            
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-10">
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-800 mb-2 sm:mb-3">
                Welcome to EdgeVantage, {formData.name}!
                {referralInfo && <span className="block text-lg">+ $50 Referral Bonus! </span>}
              </h3>
              <p className="text-emerald-700 text-base sm:text-lg leading-relaxed">
                Your application has been received and is being reviewed. Here's what happens next:
              </p>
            </div>

            {/* Referral Link Generator */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-10">
              <h4 className="text-xl font-bold text-gray-900 mb-3"> Start Earning Referral Bonuses!</h4>
              <p className="text-gray-600 mb-4">Share EdgeVantage with friends and earn $50 for each person who gets approved!</p>
              <button
                onClick={copyReferralLink}
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                <Users className="w-5 h-5 mr-2" />
                Generate My Referral Link
              </button>
              <p className="text-xs text-gray-500 mt-2">Click to copy your unique referral link</p>
            </div>

            <div className="text-left space-y-6 sm:space-y-8 mb-8 sm:mb-10">
              <div className="flex items-start space-x-4 sm:space-x-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-base sm:text-lg">1</span>
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Qualification Review</h4>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed">We'll verify your information and confirm eligibility within 1-2 business days</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 sm:space-x-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold text-base sm:text-lg">2</span>
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Welcome Call</h4>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed">If approved, we'll schedule a friendly call to explain everything and answer your questions</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 sm:space-x-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-base sm:text-lg">3</span>
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Equipment Delivery</h4>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed">We'll ship your computer and coordinate easy setup within 1-2 weeks</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 sm:space-x-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Start Earning!</h4>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                    Begin receiving your ${referralInfo ? '550' : '500'}-$1000 monthly payments automatically
                    {referralInfo && <span className="text-emerald-600 font-semibold"> (includes your $50 referral bonus!)</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-10">
              <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <h4 className="text-lg sm:text-xl font-bold text-blue-800">We'll Be In Touch Soon!</h4>
              </div>
              <p className="text-blue-700 text-base sm:text-lg leading-relaxed">
                We'll contact you at <span className="font-bold">{formData.email}</span> and <span className="font-bold">{formData.phone}</span> within 1-2 business days.
                Please check your email (including spam folder) and answer calls from our team.
              </p>
            </div>

            <div className="space-y-6">
              <button
                onClick={() => {
                  trackEvent('new_application_started', {
                    previous_applicant: formData.email,
                    session_id: sessionId
                  });
                  
                  setCurrentStep('overview');
                  setFormData({
                    name: '', email: '', phone: '', state: '', city: '',
                    hasResidence: '', hasInternet: '', hasSpace: '',
                    referralSource: '', agreeToTerms: false, referralCode: ''
                  });
                  setFormErrors({});
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-2xl text-base sm:text-lg font-bold hover:shadow-xl transition-all transform hover:scale-105"
              >
                Submit Another Application
              </button>
              
              <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
                Questions? Feel free to email us or call for immediate assistance. We're here to help!
              </p>
              
              {/* Debug info for admin (hidden in production) */}
              <div className="text-xs text-gray-400 pt-4 border-t border-gray-200">
                Session ID: {sessionId} | Admin Access: Ctrl+Shift+A
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
