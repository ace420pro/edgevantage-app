import React, { useState, useEffect } from 'react';
import { 
  User, DollarSign, Package, Calendar, CheckCircle, Clock, 
  AlertCircle, TrendingUp, Download, Settings, LogOut, Bell,
  Shield, Mail, Award, Activity, CreditCard, FileText,
  ChevronRight, ExternalLink, Zap, Star, Lock, Key,
  MailCheck, AlertTriangle, X, Users
} from 'lucide-react';

const UserDashboardEnhanced = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token) {
        setError('Please login to access your dashboard');
        setIsLoading(false);
        return;
      }

      // Set user from localStorage
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check if email is verified
        if (!parsedUser.emailVerified) {
          setShowVerificationBanner(true);
        }
      }

      // Fetch dashboard data
      const response = await fetch(`${API_URL}/api/user/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        // If API fails, use mock data for demonstration
        setDashboardData(getMockDashboardData());
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      // Use mock data if API is not available
      setDashboardData(getMockDashboardData());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockDashboardData = () => ({
    user: {
      name: user?.name || 'User',
      email: user?.email || 'user@example.com',
      joinDate: new Date('2024-01-15'),
      lastLogin: new Date()
    },
    application: {
      status: 'approved',
      qualified: true,
      equipment: {
        status: 'shipped',
        shippedDate: new Date('2024-01-20'),
        trackingNumber: 'EV123456789'
      },
      earnings: {
        monthlyAmount: 750,
        totalEarned: 2250,
        lastPaymentDate: new Date('2024-02-01'),
        nextPaymentDate: new Date('2024-03-01')
      }
    },
    enrollments: 2,
    completedCourses: 1,
    totalEarnings: 2250,
    recentPayments: [
      { amount: 750, date: new Date('2024-02-01'), status: 'completed' },
      { amount: 750, date: new Date('2024-01-01'), status: 'completed' },
      { amount: 750, date: new Date('2023-12-01'), status: 'completed' }
    ],
    accountSecurity: {
      emailVerified: user?.emailVerified || false,
      twoFactorEnabled: false,
      lastPasswordChange: new Date('2024-01-15'),
      loginAttempts: 0,
      sessions: 1
    }
  });

  const handleResendVerification = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      if (response.ok) {
        alert('Verification email sent! Please check your inbox.');
      }
    } catch (err) {
      console.error('Failed to resend verification:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Monthly Earnings',
      value: `$${dashboardData?.application?.earnings?.monthlyAmount || 0}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+12%'
    },
    {
      label: 'Total Earned',
      value: `$${dashboardData?.totalEarnings || 0}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+8%'
    },
    {
      label: 'Application Status',
      value: dashboardData?.application?.status || 'Pending',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Equipment Status',
      value: dashboardData?.application?.equipment?.status || 'Pending',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
              <p className="text-purple-100 mt-1">
                Member since {new Date(dashboardData?.user?.joinDate || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <Settings className="w-6 h-6" />
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification Banner */}
      {showVerificationBanner && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                <p className="text-yellow-800">
                  <strong>Verify your email</strong> to unlock all features and secure your account.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleResendVerification}
                  className="text-yellow-700 hover:text-yellow-900 underline text-sm"
                >
                  Resend verification
                </button>
                <button
                  onClick={() => setShowVerificationBanner(false)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['overview', 'earnings', 'security', 'courses', 'referrals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition-colors capitalize ${
                  activeTab === tab 
                    ? 'border-purple-500 text-purple-600 font-medium' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    {stat.trend && (
                      <span className="text-green-600 text-sm font-medium">{stat.trend}</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="text-gray-700">View Documents</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="text-gray-700">Payment History</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="text-gray-700">My Courses</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Equipment Tracking */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Tracking</h3>
                {dashboardData?.application?.equipment?.status === 'shipped' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Shipped</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tracking:</span>
                      <span className="font-mono text-sm">{dashboardData.application.equipment.trackingNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Shipped:</span>
                      <span className="text-gray-900">
                        {new Date(dashboardData.application.equipment.shippedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                      <Package className="w-5 h-5 mr-2" />
                      Track Package
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Equipment pending approval</p>
                  </div>
                )}
              </div>

              {/* Recent Earnings */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
                <div className="space-y-3">
                  {dashboardData?.recentPayments?.slice(0, 3).map((payment, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">${payment.amount}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Security</h2>
            
            <div className="space-y-6">
              {/* Email Verification Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-4 ${
                    dashboardData?.accountSecurity?.emailVerified 
                      ? 'bg-green-100' 
                      : 'bg-yellow-100'
                  }`}>
                    <Mail className={`w-6 h-6 ${
                      dashboardData?.accountSecurity?.emailVerified 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Verification</h3>
                    <p className="text-sm text-gray-600">
                      {dashboardData?.accountSecurity?.emailVerified 
                        ? 'Your email is verified' 
                        : 'Please verify your email address'}
                    </p>
                  </div>
                </div>
                {!dashboardData?.accountSecurity?.emailVerified && (
                  <button 
                    onClick={handleResendVerification}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Verify Now
                  </button>
                )}
                {dashboardData?.accountSecurity?.emailVerified && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-4">
                    <Shield className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <button className="text-purple-600 hover:text-purple-800 font-medium">
                  Enable
                </button>
              </div>

              {/* Password Change */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-4">
                    <Key className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Password</h3>
                    <p className="text-sm text-gray-600">
                      Last changed {new Date(dashboardData?.accountSecurity?.lastPasswordChange || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="text-purple-600 hover:text-purple-800 font-medium">
                  Change Password
                </button>
              </div>

              {/* Active Sessions */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-4">
                    <Activity className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Active Sessions</h3>
                    <p className="text-sm text-gray-600">
                      {dashboardData?.accountSecurity?.sessions || 1} active session(s)
                    </p>
                  </div>
                </div>
                <button className="text-purple-600 hover:text-purple-800 font-medium">
                  Manage
                </button>
              </div>
            </div>

            {/* Security Tips */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  Use a strong, unique password with at least 8 characters
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  Enable two-factor authentication for enhanced security
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  Regularly review your active sessions and logout from unused devices
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  Keep your email address verified and up to date
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Other tabs content */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Earnings Overview</h2>
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Detailed earnings analytics coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">You have {dashboardData?.enrollments || 0} enrolled courses</p>
              <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                Browse Courses
              </button>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Referral Program</h2>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Earn $50 for each successful referral</p>
              <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                Get Referral Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardEnhanced;