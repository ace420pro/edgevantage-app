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
            <div className="flex items-center justify-center space-x-8 mb-16 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium">500+ Members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Est. 2022</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Guaranteed Payments</span>
              </div>
            </div>
          </div>

          {/* Social Proof - Member Testimonials */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">What Our Members Say</h3>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"Getting $800 every month has been life-changing. The setup was so easy and I literally don't think about it anymore."</p>
                <p className="font-semibold text-gray-900">Sarah M. - Texas</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"I was skeptical at first, but EdgeVantage has paid me consistently for 8 months now. Best decision I made this year."</p>
                <p className="font-semibold text-gray-900">Mike R. - Florida</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"The extra $600 per month covers my car payment. It's the easiest money I've ever made."</p>
                <p className="font-semibold text-gray-900">Jennifer L. - California</p>
              </div>
            </div>
          </div>

          {/* Value Proposition Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Guaranteed Income</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Receive $500-$1000 every month, automatically deposited to your account. No variability, no uncertainty.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted Network</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Join 500+ Americans nationwide who trust us with their passive income goals. Real people, real results.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Zero Risk</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Everything we do is completely transparent and causes no impact to you or your home. Full peace of mind.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12 mb-16 border border-gray-200">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Here's How It Works</h3>
              <p className="text-xl text-gray-600">Simple steps to start earning passive income</p>
            </div>
            
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow border border-blue-100">
                  <CheckCircle className="w-10 h-10 text-blue-600" />
                </div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">1</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Quick Application</h4>
                <p className="text-gray-600 leading-relaxed">Fill out our simple form to see if you qualify. Takes less than 2 minutes.</p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow border border-emerald-100">
                  <Monitor className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">2</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Easy Setup</h4>
                <p className="text-gray-600 leading-relaxed">We ship you a small computer and handle all the technical setup for you.</p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow border border-purple-100">
                  <Wifi className="w-10 h-10 text-purple-600" />
                </div>
                <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">3</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Safe Connection</h4>
                <p className="text-gray-600 leading-relaxed">We securely use your internet connection to create accounts on various platforms.</p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow border border-yellow-100">
                  <DollarSign className="w-10 h-10 text-yellow-600" />
                </div>
                <div className="bg-yellow-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">4</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Get Paid</h4>
                <p className="text-gray-600 leading-relaxed">Receive your guaranteed monthly payment automatically. That's it!</p>
