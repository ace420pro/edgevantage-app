import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle, 
  AlertCircle, Shield, Key, Info, Check, XCircle 
} from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';

const AuthModalEnhanced = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    Object.values(checks).forEach(passed => {
      if (passed) score++;
    });

    const strengthLevels = [
      { score: 0, text: 'Very Weak', color: 'bg-red-500' },
      { score: 1, text: 'Weak', color: 'bg-orange-500' },
      { score: 2, text: 'Fair', color: 'bg-yellow-500' },
      { score: 3, text: 'Good', color: 'bg-blue-500' },
      { score: 4, text: 'Strong', color: 'bg-green-500' },
      { score: 5, text: 'Very Strong', color: 'bg-green-600' }
    ];

    const level = strengthLevels[score];
    setPasswordStrength(level);

    return checks;
  };

  // Real-time validation
  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case 'email':
        if (!value) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;

      case 'password':
        if (!isLogin) {
          if (!value) {
            errors.password = 'Password is required';
          } else if (value.length < 6) {
            errors.password = 'Password must be at least 6 characters';
          } else {
            delete errors.password;
          }
          checkPasswordStrength(value);
        }
        break;

      case 'confirmPassword':
        if (!isLogin) {
          if (!value) {
            errors.confirmPassword = 'Please confirm your password';
          } else if (value !== formData.password) {
            errors.confirmPassword = 'Passwords do not match';
          } else {
            delete errors.confirmPassword;
          }
        }
        break;

      case 'name':
        if (!isLogin) {
          if (!value) {
            errors.name = 'Name is required';
          } else if (value.length < 2) {
            errors.name = 'Name must be at least 2 characters';
          } else {
            delete errors.name;
          }
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate all fields
    const isValid = !isLogin ? 
      validateField('name', formData.name) &&
      validateField('email', formData.email) &&
      validateField('password', formData.password) &&
      validateField('confirmPassword', formData.confirmPassword) :
      validateField('email', formData.email);

    if (!isValid) {
      setError('Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      const action = isLogin ? 'login' : 'register';
      const body = isLogin 
        ? { action, email: formData.email, password: formData.password }
        : { action, email: formData.email, password: formData.password, name: formData.name };

      const response = await fetch(`${API_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        // Enhanced error handling
        if (data.code === 'USER_EXISTS') {
          setError('An account with this email already exists. Please login instead.');
        } else if (data.code === 'INVALID_CREDENTIALS') {
          setError('Invalid email or password. Please try again.');
        } else if (data.code === 'ACCOUNT_LOCKED') {
          setError('Account locked due to too many failed attempts. Please reset your password.');
        } else if (data.code === 'PASSWORD_TOO_SHORT') {
          setError('Password must be at least 6 characters long.');
        } else {
          setError(data.error || 'Authentication failed');
        }
        return;
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (!isLogin) {
        // Show email verification message for new registrations
        setEmailVerificationSent(true);
        setSuccess('Account created! Please check your email to verify your account.');
        
        // Show success for 3 seconds then close
        setTimeout(() => {
          if (onSuccess) {
            onSuccess({ ...data, isNewUser: true });
          }
          onClose();
        }, 3000);
      } else {
        // Check if email is verified
        if (data.user && !data.user.emailVerified) {
          setSuccess('Welcome back! Note: Your email is not yet verified. Check your inbox.');
        } else {
          setSuccess('Login successful! Redirecting...');
        }
        
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(data);
          }
          onClose();
        }, 1500);
      }

    } catch (err) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear general error
    setError('');
    
    // Real-time validation
    validateField(name, value);
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Verification email sent! Please check your inbox.');
      } else {
        setError(data.error || 'Failed to send verification email');
      }
    } catch (err) {
      setError('Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (showForgotPassword) {
    return <ForgotPasswordModal 
      isOpen={showForgotPassword} 
      onClose={() => setShowForgotPassword(false)} 
    />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Enhanced Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin 
              ? 'Secure login to your EdgeVantage dashboard' 
              : 'Join EdgeVantage and start earning passive income'}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 text-sm font-medium">{success}</p>
              {emailVerificationSent && !isLogin && (
                <button
                  onClick={handleResendVerification}
                  className="text-green-700 underline text-sm mt-2 hover:text-green-900"
                  disabled={isLoading}
                >
                  Resend verification email
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Registration only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  {validationErrors.name}
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
              />
            </div>
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <XCircle className="w-3 h-3 mr-1" />
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <XCircle className="w-3 h-3 mr-1" />
                {validationErrors.password}
              </p>
            )}
            
            {/* Password Strength Indicator (Registration only) */}
            {!isLogin && formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.score >= 3 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <p className="font-medium mb-1">Requirements:</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center ${formData.password.length >= 6 ? 'text-green-600' : ''}`}>
                      {formData.password.length >= 6 ? 
                        <Check className="w-3 h-3 mr-1" /> : 
                        <X className="w-3 h-3 mr-1 text-gray-400" />
                      }
                      At least 6 characters
                    </li>
                    <li className="flex items-center text-gray-500">
                      <Info className="w-3 h-3 mr-1" />
                      Mix of letters, numbers & symbols recommended
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password (Registration only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  {validationErrors.confirmPassword}
                </p>
              )}
              {!validationErrors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-green-500 text-xs mt-1 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Passwords match
                </p>
              )}
            </div>
          )}

          {/* Forgot Password Link (Login only) */}
          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || Object.keys(validationErrors).length > 0}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center ${
              isLoading || Object.keys(validationErrors).length > 0
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {isLogin ? 'Sign In Securely' : 'Create Account'}
                {!isLogin && <Shield className="w-5 h-5 ml-2" />}
              </>
            )}
          </button>

          {/* Security Badge */}
          <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
            <Lock className="w-3 h-3 mr-1" />
            <span>Secured with 256-bit encryption</span>
          </div>

          {/* Toggle Login/Register */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                  setValidationErrors({});
                  setFormData({
                    email: '',
                    password: '',
                    name: '',
                    confirmPassword: ''
                  });
                }}
                className="ml-2 text-purple-600 hover:text-purple-800 font-semibold"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModalEnhanced;