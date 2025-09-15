import { useCallback } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export function useAnalytics() {
  const trackEvent = useCallback((
    event: string,
    parameters?: Record<string, any>
  ) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, parameters);
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', event, parameters);
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event, parameters);
    }
  }, []);

  const trackPageView = useCallback((page: string) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: page,
      });
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, []);

  const trackFormProgress = useCallback((step: string) => {
    trackEvent('form_progress', {
      step,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  const trackConversion = useCallback((
    conversionType: string,
    value?: { value: number; currency: string }
  ) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        value: value?.value,
        currency: value?.currency,
        conversion_type: conversionType,
      });
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: value?.value,
        currency: value?.currency,
        content_name: conversionType,
      });
    }
  }, []);

  const trackUserInteraction = useCallback((
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    trackEvent('user_interaction', {
      action,
      category,
      label,
      value,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackFormProgress,
    trackConversion,
    trackUserInteraction,
  };
}