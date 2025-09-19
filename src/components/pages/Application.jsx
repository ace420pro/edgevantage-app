import React, { memo, useCallback, useMemo } from 'react';
import { ChevronRight, Home, Wifi, Monitor, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Footer from '../layout/Footer';

const Application = memo(({
  formData,
  setFormData,
  errors,
  setErrors,
  isSubmitting,
  setIsSubmitting,
  trackEvent,
  trackFormProgress,
  trackPageView,
  onSubmit,
  onBack,
  validateForm,
  isFormValid
}) => {
  const [submitError, setSubmitError] = React.useState('');
  React.useEffect(() => {
    trackPageView('Application Page');
    trackFormProgress('application_started', 0);
  }, [trackPageView, trackFormProgress]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Track form progress
    const completedFields = Object.values({ ...formData, [field]: value }).filter(val => val && val !== '').length;
    const totalFields = 8; // Total required fields
    const progress = Math.round((completedFields / totalFields) * 100);
    trackFormProgress('application_progress', progress);
  }, [formData, errors, setFormData, setErrors, trackFormProgress]);

  const canProceedToApplication = useMemo(() => {
    return formData.hasResidence === 'yes' && 
           formData.hasInternet === 'yes' && 
           formData.hasSpace === 'yes';
  }, [formData.hasResidence, formData.hasInternet, formData.hasSpace]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitError(''); // Clear any previous errors

    if (!validateForm()) {
      trackEvent('form_validation_error', {
        page: 'application',
        errors: Object.keys(errors).filter(key => errors[key])
      });
      return;
    }

    if (!canProceedToApplication) {
      trackEvent('qualification_failed', {
        hasResidence: formData.hasResidence,
        hasInternet: formData.hasInternet,
        hasSpace: formData.hasSpace
      });
      return;
    }

    setIsSubmitting(true);
    trackEvent('form_submission_started', { page: 'application' });

    try {
      await onSubmit(formData);
      trackEvent('form_submission_success', { page: 'application' });
      trackFormProgress('application_completed', 100);
    } catch (error) {
      console.error('Form submission failed:', error);
      setSubmitError(error.message || 'Failed to submit application. Please try again.');
      trackEvent('form_submission_error', {
        page: 'application',
        error: error.message
      });
      setIsSubmitting(false);
    }
  }, [formData, errors, validateForm, canProceedToApplication, onSubmit, trackEvent, trackFormProgress, setIsSubmitting]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Process</h2>
              <div className="text-sm text-gray-500">Step 2 of 3</div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: '66%' }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 p-8 text-white text-center">
              <h1 className="text-4xl font-bold mb-4">Let's Get You Qualified</h1>
              <p className="text-xl text-white/90">
                Answer a few quick questions to see if you're eligible for our program
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Qualification Questions */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Qualification Requirements</h3>

                {/* Question 1: US Residence */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="flex items-center gap-4 text-lg font-semibold text-gray-900 mb-4">
                    <Home className="w-6 h-6 text-emerald-600" />
                    Do you own or rent a residence in the United States with proof of address?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('hasResidence', 'yes');
                        trackEvent('qualification_answer', { question: 'residence', answer: 'yes' });
                      }}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        formData.hasResidence === 'yes'
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-500'
                      }`}
                    >
                      Yes, I have proof of US residence
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('hasResidence', 'no');
                        trackEvent('qualification_answer', { question: 'residence', answer: 'no' });
                      }}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        formData.hasResidence === 'no'
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-red-500'
                      }`}
                    >
                      No
                    </button>
                  </div>
                  {formData.hasResidence === 'no' && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Unfortunately, you don't qualify at this time.</span>
                      </div>
                      <p className="text-red-600 mt-1">Our program requires US residents with proof of address.</p>
                    </div>
                  )}
                </div>

                {/* Question 2: Internet Access */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="flex items-center gap-4 text-lg font-semibold text-gray-900 mb-4">
                    <Wifi className="w-6 h-6 text-emerald-600" />
                    Do you have reliable high-speed internet access at your residence?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('hasInternet', 'yes');
                        trackEvent('qualification_answer', { question: 'internet', answer: 'yes' });
                      }}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        formData.hasInternet === 'yes'
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-500'
                      }`}
                    >
                      Yes, reliable internet access
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('hasInternet', 'no');
                        trackEvent('qualification_answer', { question: 'internet', answer: 'no' });
                      }}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        formData.hasInternet === 'no'
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-red-500'
                      }`}
                    >
                      No
                    </button>
                  </div>
                  {formData.hasInternet === 'no' && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Unfortunately, you don't qualify at this time.</span>
                      </div>
                      <p className="text-red-600 mt-1">Our equipment requires reliable high-speed internet access.</p>
                    </div>
                  )}
                </div>

                {/* Question 3: Space */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="flex items-center gap-4 text-lg font-semibold text-gray-900 mb-4">
                    <Monitor className="w-6 h-6 text-emerald-600" />
                    Do you have adequate space for our equipment (approximately 2x2 feet)?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('hasSpace', 'yes');
                        trackEvent('qualification_answer', { question: 'space', answer: 'yes' });
                      }}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        formData.hasSpace === 'yes'
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-500'
                      }`}
                    >
                      Yes, I have adequate space
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('hasSpace', 'no');
                        trackEvent('qualification_answer', { question: 'space', answer: 'no' });
                      }}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        formData.hasSpace === 'no'
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-red-500'
                      }`}
                    >
                      No
                    </button>
                  </div>
                  {formData.hasSpace === 'no' && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Unfortunately, you don't qualify at this time.</span>
                      </div>
                      <p className="text-red-600 mt-1">Our equipment requires approximately 2x2 feet of space.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information - Only show if qualified */}
              {canProceedToApplication && (
                <div className="space-y-6 pt-8 border-t border-gray-200">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Great! You qualify for our program.</span>
                    </div>
                    <p className="text-emerald-600">Please provide your contact information to complete your application.</p>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900">Contact Information</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                          errors.fullName 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-emerald-500'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && (
                        <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                          errors.email 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-emerald-500'
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                          errors.phone 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-emerald-500'
                        }`}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                          errors.state 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-emerald-500'
                        }`}
                      >
                        <option value="">Select your state</option>
                        <option value="AL">Alabama</option>
                        <option value="AZ">Arizona</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="TX">Texas</option>
                        <option value="NY">New York</option>
                        {/* Add more states as needed */}
                      </select>
                      {errors.state && (
                        <p className="text-red-600 text-sm mt-1">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                        errors.address 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-emerald-500'
                      }`}
                      placeholder="123 Main Street, City, State"
                    />
                    {errors.address && (
                      <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submission Error Message */}
              {submitError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Submission Failed</span>
                  </div>
                  <p className="text-red-600 mt-1">{submitError}</p>
                  <button
                    type="button"
                    onClick={() => setSubmitError('')}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  ← Back
                </button>

                {canProceedToApplication && (
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 inline-flex items-center gap-3 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Complete Application
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer variant="minimal" />
    </div>
  );
});

Application.displayName = 'Application';

export default Application;