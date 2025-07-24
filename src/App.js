import React, { useState } from 'react';
import { ChevronRight, DollarSign, Users, Shield, CheckCircle, Home, Wifi, Monitor, ArrowRight, Phone, Mail, MapPin, Star, Clock, TrendingUp } from 'lucide-react';

function App() {
  const [currentStep, setCurrentStep] = useState('overview');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    hasResidence: '',
    hasInternet: '',
    hasSpace: '',
    referralSource: '',
    agreeToTerms: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 'overview') {
      setCurrentStep('application');
    } else if (currentStep === 'application') {
      setCurrentStep('confirmation');
    }
  };

  const canProceedToApplication = () => {
    return formData.hasResidence === 'yes' && 
           formData.hasInternet === 'yes' && 
           formData.hasSpace === 'yes';
  };

  const canSubmitApplication = () => {
    return formData.name && 
           formData.email && 
           formData.phone && 
           formData.state && 
           formData.city && 
           formData.referralSource &&
           formData.agreeToTerms &&
           canProceedToApplication();
  };

  if (currentStep === 'overview') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Sticky CTA Bar */}
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-2 px-4 text-center text-sm font-medium z-50 shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span> Limited spots available - Join 500+ earning members today!</span>
          </div>
        </div>

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 mt-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">EdgeVantage</h1>
                  <p className="text-sm text-gray-600">Passive Income Made Simple</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">500+ Active Members</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Fully Secure</span>
                </div>
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-emerald-200">
              <Star className="w-4 h-4 mr-2 text-emerald-600" />
              Earn $500-$1000 Every Month
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Turn Your Home Into a 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600"> Passive Income</span> Machine
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Join hundreds of Americans who earn guaranteed monthly income just by hosting a small computer in their home. 
              <span className="font-semibold text-gray-800"> No work required after setup.</span>
            </p>

            {/* Early CTA */}
            <div className="mb-12">
              <button
                onClick={handleNext}
                className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:shadow-xl transition-all duration-200 transform hover:scale-105 mb-4"
              >
                Check If I Qualify
                <ArrowRight className="w-6 h-6 ml-3" />
              </button>
              <p className="text-gray-500 text-sm">Free application • Takes 2 minutes • Instant qualification check</p>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center space-x-8 mb-16 text-sm
