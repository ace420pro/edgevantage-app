import { useState, useMemo, useCallback } from 'react';

const useFormValidation = (initialData = {}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    state: '',
    address: '',
    hasResidence: '',
    hasInternet: '',
    hasSpace: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePhone = useCallback((phone) => {
    const phoneRegex = /^\+?1?[\s-]?\(?([0-9]{3})\)?[\s-]?([0-9]{3})[\s-]?([0-9]{4})$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required field validation
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid US phone number';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    // Qualification validation
    if (!formData.hasResidence) {
      newErrors.hasResidence = 'Please answer this question';
    }

    if (!formData.hasInternet) {
      newErrors.hasInternet = 'Please answer this question';
    }

    if (!formData.hasSpace) {
      newErrors.hasSpace = 'Please answer this question';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail, validatePhone]);

  const isFormValid = useMemo(() => {
    return (
      formData.fullName?.trim() &&
      formData.email?.trim() &&
      validateEmail(formData.email) &&
      formData.phone?.trim() &&
      validatePhone(formData.phone) &&
      formData.state &&
      formData.address?.trim() &&
      formData.hasResidence === 'yes' &&
      formData.hasInternet === 'yes' &&
      formData.hasSpace === 'yes'
    );
  }, [formData, validateEmail, validatePhone]);

  const canProceedToApplication = useMemo(() => {
    return (
      formData.hasResidence === 'yes' &&
      formData.hasInternet === 'yes' &&
      formData.hasSpace === 'yes'
    );
  }, [formData.hasResidence, formData.hasInternet, formData.hasSpace]);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const resetForm = useCallback(() => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      state: '',
      address: '',
      hasResidence: '',
      hasInternet: '',
      hasSpace: '',
      ...initialData
    });
    setErrors({});
  }, [initialData]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    validateForm,
    isFormValid,
    canProceedToApplication,
    updateField,
    resetForm
  };
};

export default useFormValidation;