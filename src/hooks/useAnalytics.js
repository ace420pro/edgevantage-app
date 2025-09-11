import { useCallback } from 'react';

const useAnalytics = () => {
  const trackEvent = useCallback((eventName, properties = {}) => {
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
    console.log('🔍 Analytics Event:', eventName, properties);
  }, []);

  const trackPageView = useCallback((pageName) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_TRACKING_ID', {
        page_title: pageName,
        page_location: window.location.href,
      });
    }
    console.log('📄 Page View:', pageName);
  }, []);

  const trackFormProgress = useCallback((step, completionPercentage) => {
    trackEvent('form_progress', {
      step: step,
      completion_percentage: completionPercentage,
      event_category: 'Form',
      event_label: `Step ${step}`
    });
  }, [trackEvent]);

  const trackConversion = useCallback((conversionData) => {
    trackEvent('conversion', {
      ...conversionData,
      event_category: 'Conversion',
      event_label: 'Lead Submission'
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackFormProgress,
    trackConversion
  };
};

export default useAnalytics;