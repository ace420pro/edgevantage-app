import React, { memo } from 'react';
import { ChevronRight, DollarSign, Users, Shield, CheckCircle, Home, Wifi, Monitor, Star, TrendingUp } from 'lucide-react';

const Overview = memo(({ 
  onContinue, 
  trackEvent, 
  trackPageView,
  showEmailPopup,
  setShowEmailPopup,
  emailModalStep,
  setEmailModalStep,
  emailFormData,
  setEmailFormData,
  handleEmailCapture
}) => {
  React.useEffect(() => {
    trackPageView('Overview Page');
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

  const testimonials = [
    {
      name: "Sarah M.",
      location: "Austin, TX",
      monthly: "$847",
      quote: "I couldn't believe how simple it was. They handled everything - installation, maintenance, monitoring. I just collect my monthly check!",
      avatar: "👩‍💼"
    },
    {
      name: "Mike R.",
      location: "Phoenix, AZ", 
      monthly: "$923",
      quote: "Best decision I've made for passive income. The equipment is barely noticeable and the monthly payments are always on time.",
      avatar: "👨‍🔧"
    },
    {
      name: "Lisa K.",
      location: "Denver, CO",
      monthly: "$756",
      quote: "Started 6 months ago and already earned over $4,500. It's truly passive - I barely think about it anymore.",
      avatar: "👩‍🎨"
    },
    {
      name: "David Chen",
      location: "Portland, OR",
      monthly: "$892",
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
              Earn <span className="text-emerald-400 font-numbers">$250-$500</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                Every Month
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl font-body text-white/90 mb-8 animate-fade-in animation-delay-200">
              Get paid to host equipment at your home.<br />
              <span className="text-emerald-400 font-semibold">100% Passive Income.</span> Zero work required.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-fade-in animation-delay-400">
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>No upfront costs</span>
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

            <button
              onClick={handleContinueClick}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xl font-display font-bold py-4 px-12 rounded-xl shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 animate-fade-in animation-delay-600 inline-flex items-center gap-3"
            >
              Get Started Now
              <ChevronRight className="w-6 h-6" />
            </button>

            <p className="text-sm text-white/60 mt-4 animate-fade-in animation-delay-800">
              Free application • Takes 2 minutes • Immediate response
            </p>
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
                        {testimonial.monthly}/month
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

      {/* Stats Section */}
      <div className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-16">
              Trusted by Thousands
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-display font-bold text-emerald-400 mb-4">2,847</div>
                <p className="text-xl font-body text-white/90">Active Members</p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-display font-bold text-emerald-400 mb-4">$2.3M+</div>
                <p className="text-xl font-body text-white/90">Paid to Members</p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-display font-bold text-emerald-400 mb-4">98%</div>
                <p className="text-xl font-body text-white/90">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl font-body text-gray-600 mb-12">
              Join thousands of homeowners earning $250-$500 monthly in passive income.
            </p>
            
            <button
              onClick={handleContinueClick}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xl font-display font-bold py-4 px-12 rounded-xl shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
            >
              Apply Now - It's Free
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Takes 2 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>No obligations</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Instant response</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Popup Modal */}
      {showEmailPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button 
              onClick={() => setShowEmailPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
            
            {emailModalStep === 1 && (
              <div className="text-center">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">
                  Don't Miss Out!
                </h3>
                <p className="font-body text-gray-600 mb-6">
                  Get our free guide: "5 Ways to Maximize Your Passive Income"
                </p>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={emailFormData.email}
                  onChange={(e) => setEmailFormData({...emailFormData, email: e.target.value})}
                />
                <button 
                  onClick={handleEmailCapture}
                  className="w-full bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors font-semibold"
                >
                  Send Me The Guide
                </button>
              </div>
            )}
            
            {emailModalStep === 2 && (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">
                  Check Your Email!
                </h3>
                <p className="font-body text-gray-600 mb-6">
                  Your free guide is on its way. Ready to start your application?
                </p>
                <button 
                  onClick={() => {
                    setShowEmailPopup(false);
                    handleContinueClick();
                  }}
                  className="w-full bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors font-semibold"
                >
                  Start My Application
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

Overview.displayName = 'Overview';

export default Overview;