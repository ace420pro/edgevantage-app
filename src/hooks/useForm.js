import { useState, useCallback } from 'react';
import { analytics } from '../utils/analytics';

const useForm = (initialData = {}, validationSchema = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Email validation
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Phone validation
  const validatePhone = (phone) => {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  // Validate form based on schema
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.entries(validationSchema).forEach(([field, rules]) => {
      const value = formData[field];
      
      // Required field validation
      if (rules.required && (!value || value === '')) {
        newErrors[field] = `${rules.label || field} is required`;
        return;
      }
      
      // Skip validation for optional empty fields
      if (!rules.required && (!value || value === '')) {
        return;
      }
      
      // Type-specific validation
      if (rules.type === 'email' && !validateEmail(value)) {
        newErrors[field] = 'Please enter a valid email address';
      } else if (rules.type === 'phone' && !validatePhone(value)) {
        newErrors[field] = 'Please enter a valid phone number';
      } else if (rules.minLength && value.length < rules.minLength) {
        newErrors[field] = `${rules.label || field} must be at least ${rules.minLength} characters`;
      } else if (rules.maxLength && value.length > rules.maxLength) {
        newErrors[field] = `${rules.label || field} must not exceed ${rules.maxLength} characters`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validationSchema]);

  // Update form field
  const updateField = useCallback((field, value, sessionId) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Track form field interaction
    analytics.track('form_field_interaction', {
      field_name: field,
      field_value: typeof value === 'boolean' ? value.toString() : (value?.length > 0 ? 'filled' : 'empty'),
      session_id: sessionId,
      step: 'application'
    });
    
    // Track qualification progress for specific fields
    if (['hasResidence', 'hasInternet', 'hasSpace'].includes(field)) {
      const qualificationAnswers = { ...formData, [field]: value };
      const answeredCount = Object.values(qualificationAnswers)
        .filter(answer => answer === 'yes' || answer === 'no').length;
      const qualificationProgress = (answeredCount / 3) * 100;
      
      analytics.formProgress('qualification', qualificationProgress, sessionId);
      
      if (value === 'no') {
        analytics.track('disqualification', {
          reason: field,
          session_id: sessionId
        });
      }
    }
  }, [formData, errors]);

  // Submit form
  const submitForm = useCallback(async (apiUrl, sessionId, startTime, referralSource) => {
    // Validate first
    if (!validateForm()) {
      const errorFields = Object.keys(errors);
      analytics.formError(errorFields, errorFields.length, sessionId);
      
      // Scroll to first error
      const firstError = errorFields[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return { success: false, errors };
    }

    // Track submission attempt
    analytics.track('form_submit_attempt', {
      session_id: sessionId,
      time_to_submit: Date.now() - startTime,
      referral_source: referralSource
    });

    setIsLoading(true);

    try {
      // Submit to backend API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sessionId: sessionId,
          utmSource: new URLSearchParams(window.location.search).get('utm_source'),
          utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          utmMedium: new URLSearchParams(window.location.search).get('utm_medium')
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      // Track successful conversion
      analytics.conversion('application_completed', 500);
      analytics.formSubmit(sessionId, Date.now() - startTime, referralSource, result.leadId);

      return { success: true, data: result };

    } catch (error) {
      console.error('Application submission error:', error);
      
      // Track submission error
      analytics.track('application_error', {
        session_id: sessionId,
        error_message: error.message
      });
      
      return { 
        success: false, 
        error: error.message || 'Failed to submit application. Please try again or contact support.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, errors]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsLoading(false);
  }, [initialData]);

  return {
    formData,
    errors,
    isLoading,
    updateField,
    validateForm,
    submitForm,
    resetForm,
    setFormData
  };
};

export default useForm;