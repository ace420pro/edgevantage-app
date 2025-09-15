'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Overview from '@/components/pages/Overview';
import Application from '@/components/pages/Application';
import Confirmation from '@/components/pages/Confirmation';
import { ApplicationFormData } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useFormValidation } from '@/hooks/useFormValidation';
import { submitLead } from '@/lib/api/leads';
import toast from 'react-hot-toast';

export default function Home() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<'overview' | 'application' | 'confirmation'>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [startTime] = useState(() => Date.now());
  const [referralCode, setReferralCode] = useState('');
  const [estimatedEarnings] = useState(() => Math.floor(Math.random() * 501) + 500); // $500-$1000

  const { trackEvent, trackPageView, trackFormProgress, trackConversion } = useAnalytics();
  const { formData, setFormData, errors, validateForm, isFormValid, canProceedToApplication, updateField } = useFormValidation();

  // Handle referral code from URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }));
      trackEvent('referral_link_used', { referral_code: ref });
    }
  }, [searchParams, setFormData, trackEvent]);

  // Track page views
  useEffect(() => {
    trackPageView(currentStep);
  }, [currentStep, trackPageView]);

  // Generate referral code when form is completed
  useEffect(() => {
    if (currentStep === 'confirmation' && formData.fullName) {
      const nameCode = formData.fullName.replace(/\s+/g, '').toUpperCase().substring(0, 3);
      const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();
      setReferralCode(`${nameCode}${randomCode}`);
    }
  }, [currentStep, formData.fullName]);

  // Handle step navigation
  const handleStepChange = useCallback((step: 'overview' | 'application' | 'confirmation') => {
    setCurrentStep(step);
    trackEvent('step_changed', { step });
  }, [trackEvent]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (submissionData: ApplicationFormData) => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);
    trackEvent('form_submit_attempt', { step: 'application' });

    const submissionTime = Date.now();
    const timeToComplete = Math.round((submissionTime - startTime) / 1000);

    try {
      const leadData = {
        ...submissionData,
        sessionId,
        submissionTime: new Date(submissionTime).toISOString(),
        timeToComplete,
        referralSource: searchParams.get('ref') || 'direct',
        utmSource: searchParams.get('utm_source'),
        utmMedium: searchParams.get('utm_medium'),
        utmCampaign: searchParams.get('utm_campaign'),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        ipAddress: 'auto-detected'
      };

      const result = await submitLead(leadData);

      if (result.success) {
        trackConversion('lead_submitted', {
          value: estimatedEarnings,
          currency: 'USD',
        });

        // Track Facebook Pixel conversion
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Lead', {
            value: estimatedEarnings,
            currency: 'USD',
            content_name: 'EdgeVantage Application'
          });
        }

        setCurrentStep('confirmation');
        toast.success('Application submitted successfully!');
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      trackEvent('form_submit_error', { error: error.message });
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    sessionId,
    startTime,
    searchParams,
    estimatedEarnings,
    trackEvent,
    trackConversion
  ]);

  return (
    <main className="min-h-screen">
      {currentStep === 'overview' && (
        <Overview
          onContinue={() => {
            if (canProceedToApplication()) {
              handleStepChange('application');
              trackFormProgress('qualification_completed');
            } else {
              toast.error('Please answer all qualification questions to continue');
            }
          }}
          formData={formData}
          setFormData={setFormData}
          estimatedEarnings={estimatedEarnings}
        />
      )}

      {currentStep === 'application' && (
        <Application
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onSubmit={handleFormSubmit}
          onBack={() => handleStepChange('overview')}
          isSubmitting={isSubmitting}
          updateField={updateField}
        />
      )}

      {currentStep === 'confirmation' && (
        <Confirmation
          formData={formData}
          referralCode={referralCode}
          estimatedEarnings={estimatedEarnings}
          onBackToHome={() => {
            setCurrentStep('overview');
            setFormData({
              fullName: '',
              email: '',
              phone: '',
              city: '',
              state: '',
              hasResidence: false,
              hasInternet: false,
              hasSpace: false,
            });
          }}
        />
      )}
    </main>
  );
}