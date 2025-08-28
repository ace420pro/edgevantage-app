import React, { useState, useEffect } from 'react';
import { Star, Shield, Zap, X, ChevronRight, CheckCircle } from 'lucide-react';

const FeatureBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "New password requirements, email verification & account security features",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Zap,
      title: "Improved Authentication", 
      description: "Faster login, better error handling, and session management",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: CheckCircle,
      title: "Better User Experience",
      description: "Enhanced dashboard, real-time validation, and security notifications",
      color: "from-blue-500 to-cyan-600"
    }
  ];

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('feature-banner-dismissed');
    if (!dismissed) {
      setShowBanner(true);
    }

    // Rotate features every 4 seconds
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [features.length]);

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('feature-banner-dismissed', 'true');
  };

  if (!showBanner) return null;

  const feature = features[currentFeature];

  return (
    <div className={`bg-gradient-to-r ${feature.color} text-white relative overflow-hidden`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -inset-10 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Animated icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-ping"></div>
              <div className="relative bg-white bg-opacity-20 p-3 rounded-full">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Feature content with slide animation */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-bold text-white">
                  🎉 New: {feature.title}
                </h3>
                <div className="hidden sm:flex items-center space-x-1">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentFeature 
                          ? 'bg-white scale-125' 
                          : 'bg-white bg-opacity-40'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-white text-opacity-90 text-sm mt-1">
                {feature.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 ml-4">
            {/* Try Now Button */}
            <button 
              className="hidden sm:flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200 text-white font-medium text-sm"
              onClick={() => {
                // Scroll to login area or open auth modal
                window.dispatchEvent(new CustomEvent('openAuthModal'));
              }}
            >
              Try Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
            
            {/* Dismiss button */}
            <button
              onClick={dismissBanner}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors text-white"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureBanner;