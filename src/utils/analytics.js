// Analytics utility with proper tracking
export const analytics = {
  // Initialize analytics (call this once on app start)
  init() {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX', {
        page_title: 'EdgeVantage Landing',
        page_location: window.location.href,
        custom_map: {
          'custom_parameter_1': 'step',
          'custom_parameter_2': 'source'
        }
      });
    }
    
    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('init', process.env.REACT_APP_FACEBOOK_PIXEL_ID || 'YOUR_PIXEL_ID');
      window.fbq('track', 'PageView');
    }
    
    console.log('🔍 Analytics initialized');
  },

  // Track custom events
  track(eventName, properties = {}) {
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
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventName, properties);
    }
  },

  // Track page views
  pageView(pageName, properties = {}) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX', {
        page_title: pageName,
        page_location: window.location.href,
        ...properties
      });
    }
    
    this.track('page_view', {
      page: pageName,
      timestamp: Date.now(),
      ...properties
    });
  },

  // Track form interactions
  formProgress(step, completionPercentage, sessionId) {
    this.track('form_progress', {
      step: step,
      completion_percentage: completionPercentage,
      event_category: 'Form',
      event_label: `Step ${step}`,
      session_id: sessionId
    });
  },

  // Track conversions
  conversion(conversionType, value = 0, properties = {}) {
    this.track('conversion', {
      conversion_type: conversionType,
      conversion_value: value,
      event_category: 'Conversion',
      currency: 'USD',
      ...properties
    });
  },

  // Track CTA clicks
  ctaClick(ctaLocation, ctaText, sessionId) {
    this.track('cta_click', {
      cta_location: ctaLocation,
      cta_text: ctaText,
      session_id: sessionId,
      event_category: 'Engagement'
    });
  },

  // Track form validation errors
  formError(errorFields, errorCount, sessionId) {
    this.track('form_validation_error', {
      error_fields: errorFields.join(','),
      error_count: errorCount,
      session_id: sessionId,
      event_category: 'Form Error'
    });
  },

  // Track successful submissions
  formSubmit(sessionId, timeToSubmit, referralSource, leadId) {
    this.track('application_success', {
      session_id: sessionId,
      total_time: timeToSubmit,
      referral_source: referralSource,
      lead_id: leadId,
      event_category: 'Form Success'
    });
  },

  // Track referral events
  referral(action, referralCode, properties = {}) {
    this.track(`referral_${action}`, {
      referral_code: referralCode,
      event_category: 'Referral',
      ...properties
    });
  },

  // Track user engagement
  engagement(action, properties = {}) {
    this.track(`engagement_${action}`, {
      event_category: 'Engagement',
      timestamp: Date.now(),
      ...properties
    });
  }
};

// Export individual functions for convenience
export const {
  track,
  pageView,
  formProgress,
  conversion,
  ctaClick,
  formError,
  formSubmit,
  referral,
  engagement
} = analytics;