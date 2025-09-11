import React from 'react';
import { DollarSign, Shield, User as UserIcon, TrendingUp } from 'lucide-react';
import Button from '../ui/Button';
import { useApp } from '../../contexts/AppContext';

const Header = () => {
  const { currentUser, referralInfo, setAuthModal, setStep } = useApp();

  return (
    <>
      {/* Sticky CTA Bar */}
      <div 
        className="fixed top-0 left-0 right-0 gradient-primary text-white py-2 px-4 text-center text-sm font-medium z-40 shadow-lg" 
        style={{ marginTop: referralInfo ? '48px' : '0' }}
      >
        <div className="flex items-center justify-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">🔥 Limited spots available - Join 500+ earning members today!</span>
          <span className="sm:hidden">🔥 Limited spots - Join 500+ members!</span>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className="bg-white/80 backdrop-blur-sm border-b border-blue-100" 
        style={{ marginTop: referralInfo ? '88px' : '48px' }}
      >
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">EdgeVantage</h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  {referralInfo ? `Referred by ${referralInfo.referrerName}` : 'Passive Income Made Simple'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="status-online"></div>
                <span className="font-medium">500+ Active Members</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Fully Secure</span>
              </div>
              
              {currentUser ? (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={UserIcon}
                  onClick={() => window.location.href = '/account'}
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={UserIcon}
                  onClick={() => setAuthModal(true)}
                >
                  Login
                </Button>
              )}
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep('application')}
              >
                Apply Now
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center space-x-2">
              {currentUser ? (
                <button
                  onClick={() => window.location.href = '/account'}
                  className="p-2 text-purple-600"
                >
                  <UserIcon className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setAuthModal(true)}
                  className="p-2 text-gray-600"
                >
                  <UserIcon className="w-5 h-5" />
                </button>
              )}
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep('application')}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;