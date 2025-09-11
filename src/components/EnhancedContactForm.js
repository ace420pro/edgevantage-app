import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Input, Select, Button, Card, Alert, ProgressBar } from './DesignSystem';

// Enhanced Contact Form - Accessibility-first with real-time validation
// Implements progressive validation, auto-formatting, and smart suggestions

const EnhancedContactForm = ({ 
  onSubmit, 
  trackEvent,
  sessionId,
  qualificationData = {},
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [validationProgress, setValidationProgress] = useState(0);
  const [suggestions, setSuggestions] = useState({});

  // US States for dropdown
  const US_STATES = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];

  // Validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s'-]+$/,
      requiredMessage: 'Full name is required',
      invalidMessage: 'Please enter a valid name (letters, spaces, hyphens, apostrophes only)'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      requiredMessage: 'Email address is required',
      invalidMessage: 'Please enter a valid email address'
    },
    phone: {
      required: true,
      pattern: /^\(\d{3}\) \d{3}-\d{4}$/,
      requiredMessage: 'Phone number is required',
      invalidMessage: 'Please enter a valid US phone number'
    },
    address: {
      required: true,
      minLength: 5,
      requiredMessage: 'Street address is required',
      invalidMessage: 'Please enter a complete street address'
    },
    city: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s'-]+$/,
      requiredMessage: 'City is required',
      invalidMessage: 'Please enter a valid city name'
    },
    state: {
      required: true,
      requiredMessage: 'State is required'
    },
    zipCode: {
      required: true,
      pattern: /^\d{5}(-\d{4})?$/,
      requiredMessage: 'ZIP code is required',
      invalidMessage: 'Please enter a valid ZIP code (12345 or 12345-6789)'
    }
  };

  // Debounced validation function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Validate individual field
  const validateField = useCallback((fieldName, value) => {
    const rule = validationRules[fieldName];
    if (!rule) return null;

    if (rule.required && (!value || value.trim() === '')) {
      return rule.requiredMessage;
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      return rule.invalidMessage;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      return rule.invalidMessage;
    }

    return null;
  }, []);

  // Debounced field validation
  const debouncedValidateField = useCallback(
    debounce((fieldName, value) => {
      if (touchedFields[fieldName]) {
        const error = validateField(fieldName, value);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    }, 500),
    [validateField, touchedFields]
  );

  // Auto-formatting functions
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const formatName = (value) => {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatZipCode = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 9)}`;
  };

  // Handle field changes with auto-formatting and validation
  const handleFieldChange = (fieldName, value) => {
    let formattedValue = value;

    // Apply auto-formatting
    switch (fieldName) {
      case 'phone':
        formattedValue = formatPhone(value);
        break;
      case 'name':
        formattedValue = formatName(value);
        break;
      case 'city':
        formattedValue = formatName(value);
        break;
      case 'zipCode':
        formattedValue = formatZipCode(value);
        break;
      default:
        break;
    }

    setFormData(prev => ({ ...prev, [fieldName]: formattedValue }));

    // Clear existing error if field was previously invalid
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }

    // Debounced validation for real-time feedback
    debouncedValidateField(fieldName, formattedValue);

    // Update progress
    updateValidationProgress({ ...formData, [fieldName]: formattedValue });

    // Track interaction
    trackEvent('contact_form_field_change', {
      field_name: fieldName,
      field_filled: formattedValue.length > 0,
      session_id: sessionId,
      qualification_score: qualificationData.score || 0
    });

    // Generate suggestions
    generateSuggestions(fieldName, formattedValue);
  };

  // Handle field blur (when user leaves field)
  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    
    // Immediate validation on blur
    const error = validateField(fieldName, formData[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));

    // Track field completion
    trackEvent('contact_form_field_blur', {
      field_name: fieldName,
      has_error: !!error,
      session_id: sessionId
    });
  };

  // Update validation progress
  const updateValidationProgress = (data = formData) => {
    const totalFields = Object.keys(validationRules).length;
    const validFields = Object.keys(validationRules).filter(fieldName => {
      const value = data[fieldName];
      return value && !validateField(fieldName, value);
    }).length;

    const progress = Math.round((validFields / totalFields) * 100);
    setValidationProgress(progress);
  };

  // Generate smart suggestions
  const generateSuggestions = (fieldName, value) => {
    const newSuggestions = { ...suggestions };

    switch (fieldName) {
      case 'email':
        if (value && value.includes('@') && !value.includes('.')) {
          const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
          const localPart = value.split('@')[0];
          const domainPart = value.split('@')[1] || '';
          
          const matchedDomain = commonDomains.find(domain => 
            domain.startsWith(domainPart.toLowerCase())
          );
          
          if (matchedDomain) {
            newSuggestions.email = `${localPart}@${matchedDomain}`;
          }
        } else {
          delete newSuggestions.email;
        }
        break;
      
      case 'state':
        if (value && value.length >= 2) {
          const matchedState = US_STATES.find(state => 
            state.label.toLowerCase().startsWith(value.toLowerCase()) ||
            state.value.toLowerCase().startsWith(value.toLowerCase())
          );
          
          if (matchedState) {
            newSuggestions.state = matchedState.value;
          }
        } else {
          delete newSuggestions.state;
        }
        break;
        
      default:
        break;
    }

    setSuggestions(newSuggestions);
  };

  // Apply suggestion
  const applySuggestion = (fieldName, suggestion) => {
    handleFieldChange(fieldName, suggestion);
    setSuggestions(prev => ({ ...prev, [fieldName]: undefined }));
    
    trackEvent('contact_form_suggestion_applied', {
      field_name: fieldName,
      suggestion: suggestion,
      session_id: sessionId
    });
  };

  // Validate all fields
  const validateAllFields = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouchedFields(
      Object.keys(validationRules).reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      trackEvent('contact_form_validation_error', {
        error_fields: Object.keys(errors).filter(field => errors[field]),
        session_id: sessionId
      });

      // Focus first error field
      const firstErrorField = Object.keys(errors).find(field => errors[field]);
      if (firstErrorField) {
        const element = document.getElementById(`${firstErrorField}-input`);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    trackEvent('contact_form_submit', {
      qualification_score: qualificationData.score || 0,
      form_completion_percentage: validationProgress,
      session_id: sessionId
    });

    onSubmit({
      ...formData,
      qualificationData: qualificationData
    });
  };

  // Update progress on component mount and form data changes
  useEffect(() => {
    updateValidationProgress();
  }, [formData]);

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <ProgressBar 
        value={validationProgress} 
        label="Form Completion"
        color={validationProgress >= 80 ? 'emerald' : validationProgress >= 40 ? 'blue' : 'orange'}
      />

      {/* Qualification summary */}
      {qualificationData.level && (
        <Alert 
          type={qualificationData.level === 'full' ? 'success' : 'warning'}
          title={
            qualificationData.level === 'full' 
              ? 'Congratulations! You qualify for our program.' 
              : 'You\'re on our priority list!'
          }
        >
          {qualificationData.level === 'full' 
            ? 'Complete your application below to get started earning $500-$1000/month.'
            : 'We\'ll review your application for priority consideration and available opportunities.'
          }
        </Alert>
      )}

      {/* Contact form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Complete Your Application
            </h3>
            <p className="text-gray-600">
              Provide your contact information to finalize your application
            </p>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Personal Information
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  id="name-input"
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  placeholder="Enter your full name"
                  error={touchedFields.name ? errors.name : ''}
                  required
                  autoComplete="name"
                  helpText="As it appears on your government ID"
                />
                {suggestions.name && (
                  <button
                    type="button"
                    onClick={() => applySuggestion('name', suggestions.name)}
                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Apply suggestion: {suggestions.name}
                  </button>
                )}
              </div>

              <Input
                id="email-input"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                placeholder="your.email@example.com"
                error={touchedFields.email ? errors.email : ''}
                required
                autoComplete="email"
                helpText="We'll send confirmation and updates here"
              />
              {suggestions.email && (
                <button
                  type="button"
                  onClick={() => applySuggestion('email', suggestions.email)}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                >
                  Did you mean: {suggestions.email}?
                </button>
              )}

              <Input
                id="phone-input"
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                onBlur={() => handleFieldBlur('phone')}
                placeholder="(555) 123-4567"
                error={touchedFields.phone ? errors.phone : ''}
                required
                autoComplete="tel"
                helpText="US phone number for verification"
              />
            </div>
          </div>

          {/* Address Information Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Address Information
            </h4>
            
            <div className="space-y-4">
              <Input
                id="address-input"
                label="Street Address"
                type="text"
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                onBlur={() => handleFieldBlur('address')}
                placeholder="123 Main Street"
                error={touchedFields.address ? errors.address : ''}
                required
                autoComplete="street-address"
                helpText="Where equipment will be installed"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  id="city-input"
                  label="City"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  onBlur={() => handleFieldBlur('city')}
                  placeholder="City"
                  error={touchedFields.city ? errors.city : ''}
                  required
                  autoComplete="address-level2"
                />

                <Select
                  id="state-input"
                  label="State"
                  value={formData.state}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
                  onBlur={() => handleFieldBlur('state')}
                  options={US_STATES}
                  placeholder="Select State"
                  error={touchedFields.state ? errors.state : ''}
                  required
                  autoComplete="address-level1"
                />

                <Input
                  id="zipCode-input"
                  label="ZIP Code"
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                  onBlur={() => handleFieldBlur('zipCode')}
                  placeholder="12345"
                  error={touchedFields.zipCode ? errors.zipCode : ''}
                  required
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-6 border-t border-gray-200">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={validationProgress < 100 || isLoading}
              className="w-full"
              ariaLabel={isLoading ? 'Submitting application' : 'Submit application'}
            >
              {isLoading ? (
                'Submitting Application...'
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            {validationProgress < 100 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Complete all required fields to submit your application
              </p>
            )}
          </div>
        </form>
      </Card>

      {/* Privacy notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          By submitting this form, you agree to our{' '}
          <button className="text-blue-600 hover:text-blue-800 underline">
            Privacy Policy
          </button>{' '}
          and{' '}
          <button className="text-blue-600 hover:text-blue-800 underline">
            Terms of Service
          </button>
        </p>
      </div>
    </div>
  );
};

export default EnhancedContactForm;