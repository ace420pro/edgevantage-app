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
              </div>
            </div>

            {/* CTA within How It Works */}
            <div className="text-center mt-12">
              <button
                onClick={handleNext}
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-3 rounded-xl text-lg font-bold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Start Step 1 Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Requirements + CTA */}
          <div className="bg-white rounded-3xl p-12 shadow-lg border border-gray-200 mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Do You Qualify?</h3>
              <p className="text-xl text-gray-600">Just three simple requirements to get started</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 mb-10">
              <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">US Residence</h4>
                  <p className="text-gray-600 leading-relaxed">You need a valid US address with proof of residence (utility bill, lease, etc.)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wifi className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Internet Access</h4>
                  <p className="text-gray-600 leading-relaxed">A reliable broadband internet connection (most home internet works fine)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Small Space</h4>
                  <p className="text-gray-600 leading-relaxed">Room for a mini computer (size of a small book) near an electrical outlet</p>
                </div>
              </div>
            </div>

            {/* CTA in Requirements */}
            <div className="text-center">
              <button
                onClick={handleNext}
                className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:shadow-xl transition-all duration-200 transform hover:scale-105 mb-4"
              >
                See If I Qualify Now
                <ArrowRight className="w-6 h-6 ml-3" />
              </button>
              <p className="text-gray-500 text-sm">Most people qualify • Free application • Instant results</p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl p-12 mb-16">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h3>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">How much will I actually earn?</h4>
                <p className="text-gray-600 leading-relaxed mb-6">You'll earn between $500-$1000 per month, paid automatically. The exact amount depends on your location and internet speed.</p>
                
                <h4 className="text-xl font-bold text-gray-900 mb-3">What does the computer actually do?</h4>
                <p className="text-gray-600 leading-relaxed mb-6">It uses your internet connection and residential IP address to create accounts on various platforms and services that require US-based users.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Will this affect my internet or electricity bill?</h4>
                <p className="text-gray-600 leading-relaxed mb-6">Minimal impact - the device uses about as much power as a phone charger and very little bandwidth.</p>
                
                <h4 className="text-xl font-bold text-gray-900 mb-3">How do I know this is legitimate?</h4>
                <p className="text-gray-600 leading-relaxed">We have 500+ active members earning consistently. You can verify everything during our onboarding call before any equipment is shipped.</p>
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl p-12 text-white shadow-xl">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Earning $500-$1000 Monthly?</h3>
            <p className="text-xl mb-8 text-blue-100">Join hundreds of Americans already earning passive income with EdgeVantage</p>
            
            <button
              onClick={handleNext}
              className="inline-flex items-center bg-white text-blue-600 px-10 py-4 rounded-2xl text-xl font-bold hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Apply in Under 2 Minutes
              <ArrowRight className="w-6 h-6 ml-3" />
            </button>
            
            <p className="text-blue-200 text-sm mt-6">Free to apply • Instant qualification • 21+ only • US residents</p>
          </div>
        </section>
      </div>
    );
  }

  if (currentStep === 'application') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">EdgeVantage</h1>
                  <p className="text-sm text-gray-600">Quick Application</p>
                </div>
              </div>
              <button 
                onClick={() => setCurrentStep('overview')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-200">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Let's See If You Qualify!</h2>
              <p className="text-xl text-gray-600">Just a few quick questions to get started</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-12">
              <div 
                className="bg-gradient-to-r from-blue-600 to-emerald-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: canSubmitApplication() ? '100%' : '50%' }}
              ></div>
            </div>

            {/* Qualification Questions */}
            <div className="space-y-8 mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Qualification Check</h3>
              
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  Do you have a US residence with proof of address?
                </label>
                <p className="text-gray-600 mb-4">We'll need to verify your address with a utility bill or lease agreement</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleInputChange('hasResidence', 'yes')}
                    className={`p-4 rounded-2xl border-2 transition-all font-semibold ${
                      formData.hasResidence === 'yes' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✓ Yes, I have proof
                  </button>
                  <button
                    onClick={() => handleInputChange('hasResidence', 'no')}
                    className={`p-4 rounded-2xl border-2 transition-all font-semibold ${
                      formData.hasResidence === 'no' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✗ No, I don't
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  Do you have reliable internet access at home?
                </label>
                <p className="text-gray-600 mb-4">Most home broadband connections work perfectly fine</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleInputChange('hasInternet', 'yes')}
                    className={`p-4 rounded-2xl border-2 transition-all font-semibold ${
                      formData.hasInternet === 'yes' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✓ Yes, I have internet
                  </button>
                  <button
                    onClick={() => handleInputChange('hasInternet', 'no')}
                    className={`p-4 rounded-2xl border-2 transition-all font-semibold ${
                      formData.hasInternet === 'no' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✗ No internet access
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  Do you have space for a small computer near an outlet?
                </label>
                <p className="text-gray-600 mb-4">The device is about the size of a small book and needs to stay plugged in</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleInputChange('hasSpace', 'yes')}
                    className={`p-4 rounded-2xl border-2 transition-all font-semibold ${
                      formData.hasSpace === 'yes' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✓ Yes, I have space
                  </button>
                  <button
                    onClick={() => handleInputChange('hasSpace', 'no')}
                    className={`p-4 rounded-2xl border-2 transition-all font-semibold ${
                      formData.hasSpace === 'no' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    ✗ No available space
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Information - Only show if qualified */}
            {canProceedToApplication() && (
              <div className="space-y-6 border-t border-gray-200 pt-10">
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-emerald-700">Excellent! You qualify. Let's get your details:</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="Your state"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Your city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">How did you hear about EdgeVantage? *</label>
                  <select
                    value={formData.referralSource}
                    onChange={(e) => handleInputChange('referralSource', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    <option value="">Please select...</option>
                    <option value="google">Google Search</option>
                    <option value="social-media">Social Media</option>
                    <option value="friend-referral">Friend or Family Referral</option>
                    <option value="advertisement">Online Advertisement</option>
                    <option value="networking">Networking Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold">I confirm that:</span> I am 21+ years old, a US resident, and agree to EdgeVantage's terms of service. 
                    I understand that EdgeVantage will place a small computer in my home and use my residential information 
                    to create accounts on various platforms in exchange for guaranteed monthly payments of $500-$1000.
                  </label>
                </div>
              </div>
            )}

            {/* Disqualification Message */}
            {(formData.hasResidence === 'no' || formData.hasInternet === 'no' || formData.hasSpace === 'no') && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-red-800 mb-4">We're sorry, but you don't qualify at this time</h3>
                <p className="text-red-700 text-lg leading-relaxed">
                  Our program requires a US residence with proof of address, reliable internet access, and space for our equipment. 
                  Feel free to apply again if your situation changes in the future!
                </p>
              </div>
            )}

            {/* Submit Button */}
            {canProceedToApplication() && (
              <div className="text-center mt-10">
                <button
                  onClick={handleNext}
                  disabled={!canSubmitApplication()}
                  className={`inline-flex items-center px-10 py-4 rounded-2xl text-xl font-bold transition-all duration-200 ${
                    canSubmitApplication()
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit My Application
                  <ChevronRight className="w-6 h-6 ml-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-200">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Application Submitted Successfully! </h2>
            
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8 mb-10">
              <h3 className="text-2xl font-bold text-emerald-800 mb-3">Welcome to EdgeVantage, {formData.name}!</h3>
              <p className="text-emerald-700 text-lg leading-relaxed">
                Your application has been received and is being reviewed. Here's what happens next:
              </p>
            </div>

            <div className="text-left space-y-8 mb-10">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Qualification Review</h4>
                  <p className="text-gray-600 text-lg leading-relaxed">We'll verify your information and confirm eligibility within 1-2 business days</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold text-lg">2</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Welcome Call</h4>
                  <p className="text-gray-600 text-lg leading-relaxed">If approved, we'll schedule a friendly call to explain everything and answer your questions</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Equipment Delivery</h4>
                  <p className="text-gray-600 text-lg leading-relaxed">We'll ship your computer and coordinate easy setup within 1-2 weeks</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Start Earning!</h4>
                  <p className="text-gray-600 text-lg leading-relaxed">Begin receiving your $500-$1000 monthly payments automatically</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-10">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Mail className="w-5 h-5 text-blue-600" />
                <h4 className="text-xl font-bold text-blue-800">We'll Be In Touch Soon!</h4>
              </div>
              <p className="text-blue-700 text-lg leading-relaxed">
                We'll contact you at <span className="font-bold">{formData.email}</span> and <span className="font-bold">{formData.phone}</span> within 1-2 business days.
                Please check your email (including spam folder) and answer calls from our team.
              </p>
            </div>

            <div className="space-y-6">
              <button
                onClick={() => {
                  setCurrentStep('overview');
                  setFormData({
                    name: '', email: '', phone: '', state: '', city: '',
                    hasResidence: '', hasInternet: '', hasSpace: '',
                    referralSource: '', agreeToTerms: false
                  });
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-4 px-8 rounded-2xl text-lg font-bold hover:shadow-xl transition-all transform hover:scale-105"
              >
                Submit Another Application
              </button>
              
              <p className="text-gray-500 leading-relaxed">
                Questions? Feel free to email us or call for immediate assistance. We're here to help!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
