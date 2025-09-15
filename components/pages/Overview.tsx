import React, { memo, useEffect } from 'react';
import { ChevronRight, DollarSign, Users, Shield, CheckCircle, Home, Wifi, Monitor, Star, TrendingUp, Phone, Mail, AlertTriangle } from 'lucide-react';
import { ApplicationFormData } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';

interface OverviewProps {
  onContinue: () => void;
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
  estimatedEarnings: number;
}

const Overview = memo(({ 
  onContinue, 
  formData,
  setFormData,
  estimatedEarnings
}: OverviewProps) => {
  const { trackEvent, trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('overview');
  }, [trackPageView]);

  const handleContinueClick = () => {
    trackEvent('cta_click', {
      location: 'overview_page',
      button_text: 'Get Started Now',
      event_category: 'Conversion',
      event_label: 'Primary CTA'
    });
    onContinue();
  };

  const handleQualificationAnswer = (question: 'hasResidence' | 'hasInternet' | 'hasSpace', value: boolean) => {
    setFormData(prev => ({ ...prev, [question]: value }));
    trackEvent('qualification_answer', { question, answer: value ? 'yes' : 'no' });
  };

  const testimonials = [
    {
      name: "Sarah M.",
      location: "Austin, TX",
      monthly: "$385",
      quote: "I couldn't believe how simple it was. They handled everything - installation, maintenance, monitoring. I just collect my monthly check!",
      avatar: "👩‍💼"
    },
    {
      name: "Mike R.",
      location: "Phoenix, AZ", 
      monthly: "$467",
      quote: "Best decision I've made for passive income. The equipment is barely noticeable and the monthly payments are always on time.",
      avatar: "👨‍🔧"
    },
    {
      name: "Lisa K.",
      location: "Denver, CO",
      monthly: "$342",
      quote: "Started 6 months ago and already earned over $2,000. It's truly passive - I barely think about it anymore.",
      avatar: "👩‍🎨"
    },
    {
      name: "David Chen",
      location: "Portland, OR",
      monthly: "$425",
      quote: "The team was professional from day one. Installation took 2 hours and I've been earning ever since. Highly recommend!",
      avatar: "👨‍💻"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 mb-8 animate-fade-in">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-white/90">500+ Members Online</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white/90">Verified & Secure</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 animate-fade-in">
              Earn <span className="text-emerald-400 tabular-nums">$250-$500</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                Every Month
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl font-body text-white/90 mb-8 animate-fade-in">
              Get paid to host equipment at your home.<br />
              <span className="text-emerald-400 font-semibold">100% Passive Income.</span> Zero work required.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-fade-in">
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Zero investment required</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Professional installation</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Guaranteed payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Qualification Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Quick Qualification Check
              </h2>
              <p className="text-lg text-gray-600">
                Answer these 3 questions to see if you qualify
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-start gap-4">
                  <Home className="w-6 h-6 text-emerald-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Do you have a US residence with proof of ownership or lease?
                    </h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleQualificationAnswer('hasResidence', true)}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                          formData.hasResidence
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-600'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleQualificationAnswer('hasResidence', false)}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                          formData.hasResidence === false
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-start gap-4">
                  <Wifi className="w-6 h-6 text-emerald-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Do you have reliable internet access at your residence?
                    </h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleQualificationAnswer('hasInternet', true)}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                          formData.hasInternet
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-600'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleQualificationAnswer('hasInternet', false)}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                          formData.hasInternet === false
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-start gap-4">
                  <Monitor className="w-6 h-6 text-emerald-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Do you have a small area (2x2 ft) available for equipment?
                    </h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleQualificationAnswer('hasSpace', true)}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                          formData.hasSpace
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-600'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleQualificationAnswer('hasSpace', false)}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                          formData.hasSpace === false
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {formData.hasResidence && formData.hasInternet && formData.hasSpace && (
              <div className="mt-8 text-center animate-slide-up">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-emerald-900 mb-2">
                    Congratulations! You Qualify!
                  </h3>
                  <p className="text-emerald-700 mb-4">
                    You could be earning ${estimatedEarnings}/month. Complete your application now!
                  </p>
                  <button
                    onClick={handleContinueClick}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    Continue to Application
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            
            {/* CTA Section */}
            <div className="text-center mt-12">
              <button
                onClick={handleContinueClick}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xl font-display font-bold py-4 px-12 rounded-xl shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 animate-fade-in inline-flex items-center gap-3"
              >
                Get Started Now
                <ChevronRight className="w-6 h-6" />
              </button>

              <p className="text-sm text-gray-600 mt-4 animate-fade-in">
                Free application • Takes 2 minutes • Immediate response
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl font-body text-gray-600 max-w-3xl mx-auto">
                Our program connects homeowners with enterprise equipment needs. You provide the space, we handle everything else.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl group-hover:shadow-blue-500/25">
                  <Home className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">1. Qualify Your Space</h3>
                <p className="text-gray-600 text-lg font-body leading-relaxed">
                  We verify you have a US residence with reliable internet and adequate space for our equipment.
                </p>
              </div>

              <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-emerald-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl group-hover:shadow-emerald-500/25">
                  <Monitor className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">2. Professional Setup</h3>
                <p className="text-gray-600 text-lg font-body leading-relaxed">
                  Our certified technicians handle complete installation, configuration, and testing at no cost to you.
                </p>
              </div>

              <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl group-hover:shadow-purple-500/25">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">3. Collect Monthly Payments</h3>
                <p className="text-gray-600 text-lg font-body leading-relaxed">
                  Receive $250-$500 monthly via direct deposit. Payments are guaranteed and always on time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Real Results from Real People
              </h2>
              <p className="text-xl font-body text-gray-600">
                Join thousands of homeowners already earning passive income
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:scale-105">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-body font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                      <p className="font-body text-gray-600">{testimonial.location}</p>
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold mt-2 inline-block">
                        <span className="tabular-nums">{testimonial.monthly}</span>/month
                      </div>
                    </div>
                  </div>
                  
                  <blockquote className="font-body text-gray-700 text-lg leading-relaxed italic">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-20 bg-gradient-to-br from-emerald-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join EdgeVantage today and start your passive income journey
          </p>
          <button
            onClick={handleContinueClick}
            className="bg-white text-emerald-600 font-bold py-4 px-12 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-3 text-lg"
          >
            Get Started Now
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
});

Overview.displayName = 'Overview';

export default Overview;