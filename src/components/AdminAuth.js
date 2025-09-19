import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

const AdminAuth = ({ onAuthenticated }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Rate limiting - max 3 attempts
    if (attempts >= 3) {
      setError('Too many failed attempts. Please wait 15 minutes.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // API call to authenticate admin
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store admin token securely
        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminUser', JSON.stringify(data.admin));
        onAuthenticated(data.admin);
      } else {
        setAttempts(prev => prev + 1);
        setError(data.message || 'Invalid credentials');
        
        // Clear password field on failed attempt
        setCredentials(prev => ({ ...prev, password: '' }));
      }
    } catch (error) {
      console.error('Admin auth error:', error);
      setError('Authentication service unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-gray-600 mt-2">Secure authentication required</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={credentials.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter admin username"
              disabled={isLoading || attempts >= 3}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter admin password"
                disabled={isLoading || attempts >= 3}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || attempts >= 3 || !credentials.username || !credentials.password}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Unauthorized access is strictly prohibited and monitored.
          </p>
        </div>

        {attempts > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-orange-600">
              Failed attempts: {attempts}/3
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuth;