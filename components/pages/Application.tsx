import React, { memo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Loader2, User, Mail, Phone, MapPin } from 'lucide-react';
import { ApplicationFormData, FormErrors } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ApplicationProps {
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
  errors: FormErrors;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
  updateField: (field: keyof ApplicationFormData, value: any) => void;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const Application = memo(({ 
  formData,
  setFormData,
  errors,
  onSubmit,
  onBack,
  isSubmitting,
  updateField
}: ApplicationProps) => {
  const { trackEvent, trackPageView, trackFormProgress } = useAnalytics();

  useEffect(() => {
    trackPageView('application');
    trackFormProgress('application_started');
  }, [trackPageView, trackFormProgress]);

  const handleInputChange = useCallback((field: keyof ApplicationFormData, value: any) => {
    updateField(field, value);
    
    // Track form progress
    const filledFields = Object.values({ ...formData, [field]: value })
      .filter(val => val && val !== '').length;
    const totalFields = 5; // fullName, email, phone, city, state
    const progress = Math.round((filledFields / totalFields) * 100);
    
    if (progress > 0 && progress % 20 === 0) {
      trackFormProgress(`application_${progress}_percent`);
    }
  }, [formData, updateField, trackFormProgress]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    trackEvent('form_submit_attempt', { page: 'application' });
    
    // Validate qualification requirements
    if (!formData.hasResidence || !formData.hasInternet || !formData.hasSpace) {
      trackEvent('qualification_failed', {
        hasResidence: formData.hasResidence,
        hasInternet: formData.hasInternet,
        hasSpace: formData.hasSpace
      });
      return;
    }

    await onSubmit(formData);
  }, [formData, onSubmit, trackEvent]);

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleInputChange('phone', formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Application Process</h2>
              <div className="text-sm text-gray-500">Step 2 of 3</div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: '66%' }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 p-8 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Complete Your Application</h1>
              <p className="text-lg text-white/90">
                You're almost there! Just need your contact information.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Qualification Status */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-emerald-900 mb-2">You Qualify!</h3>
                    <ul className="space-y-1 text-sm text-emerald-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        US Residence Confirmed
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Internet Access Available
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Equipment Space Ready
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Contact Information</h3>

                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    } focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="John Smith"
                    required
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="john@example.com"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    } focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="(555) 123-4567"
                    required
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4" />
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      } focus:border-emerald-500 focus:outline-none transition-colors`}
                      placeholder="Austin"
                      required
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4" />
                      State *
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      } focus:border-emerald-500 focus:outline-none transition-colors`}
                      required
                    >
                      <option value="">Select State</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I confirm that I meet all qualification requirements and that the information provided is accurate. 
                    I understand that EdgeVantage will contact me within 24-48 hours to discuss next steps.
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Security Note */}
              <div className="text-center text-sm text-gray-600 mt-6">
                <p className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Your information is secure and will never be shared
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});

Application.displayName = 'Application';

export default Application;