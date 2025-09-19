import { useState, useCallback } from 'react';
import { ApplicationFormData, FormErrors } from '@/types';

const initialFormData: ApplicationFormData = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  hasResidence: false,
  hasInternet: false,
  hasSpace: false,
};

export function useFormValidation() {
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digitsOnly.length >= 10;
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate full name
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required (minimum 2 characters)';
      isValid = false;
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate phone
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    // Validate city
    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = 'City is required';
      isValid = false;
    }

    // Validate state
    if (!formData.state || formData.state.trim().length < 2) {
      newErrors.state = 'State is required';
      isValid = false;
    }


    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const isFormValid = useCallback((): boolean => {
    return (
      formData.fullName.trim().length >= 2 &&
      validateEmail(formData.email) &&
      validatePhone(formData.phone) &&
      formData.city.trim().length >= 2 &&
      formData.state.trim().length >= 2
    );
  }, [formData]);

  const canProceedToApplication = useCallback((): boolean => {
    return true; // No qualification requirements anymore
  }, []);

  const updateField = useCallback((field: keyof ApplicationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  }, [errors]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    validateForm,
    isFormValid,
    canProceedToApplication,
    updateField,
    resetForm,
  };
}