import React, { useState, useEffect } from 'react';
import { 
  User, Package, Calendar, DollarSign, CheckCircle, 
  Clock, Truck, Home, Settings, LogOut, RefreshCw,
  AlertCircle, ChevronRight, Mail, Phone, MapPin,
  TrendingUp, FileText, Download, Shield, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  const API_URL = '';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`${API_URL}/api/user/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'contacted': 'bg-blue-100 text-blue-800',
      'rejected': 'bg-red-100 text-red-800',
      'new': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const ProgressStep = ({ title, completed, active, icon: Icon }) => (
    <div className="flex flex-col items-center relative">
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center
        ${completed ? 'bg-green-600 text-white' : active ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'}
      `}>
        {completed ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
      </div>
      <p className={`mt-2 text-xs font-medium ${completed || active ? 'text-gray-900' : 'text-gray-400'}`}>
        {title}
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { user, application, shipment, appointment, earnings, progress } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">EdgeVantage Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* User Info Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
              <p className="text-purple-100 mt-1">{user?.email}</p>
            </div>
            {application && (
              <div className="text-right">
                <p className="text-sm text-purple-100">Application ID</p>
                <p className="text-lg font-semibold">{application.id}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      {application && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
            <div className="flex items-center justify-between">
              <ProgressStep title="Applied" completed={progress?.applied} active={true} icon={FileText} />
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div className={`h-full bg-green-600 transition-all ${progress?.reviewed ? 'w-full' : 'w-0'}`} />
              </div>
              <ProgressStep title="Reviewed" completed={progress?.reviewed} active={progress?.reviewed && !progress?.approved} icon={Clock} />
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div className={`h-full bg-green-600 transition-all ${progress?.approved ? 'w-full' : 'w-0'}`} />
              </div>
              <ProgressStep title="Approved" completed={progress?.approved} active={progress?.approved && !progress?.shipped} icon={CheckCircle} />
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div className={`h-full bg-green-600 transition-all ${progress?.shipped ? 'w-full' : 'w-0'}`} />
              </div>
              <ProgressStep title="Shipped" completed={progress?.shipped} active={progress?.shipped && !progress?.installed} icon={Truck} />
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div className={`h-full bg-green-600 transition-all ${progress?.installed ? 'w-full' : 'w-0'}`} />
              </div>
              <ProgressStep title="Installed" completed={progress?.installed} active={progress?.installed && !progress?.earning} icon={Home} />
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div className={`h-full bg-green-600 transition-all ${progress?.earning ? 'w-full' : 'w-0'}`} />
              </div>
              <ProgressStep title="Earning" completed={progress?.earning} active={progress?.earning} icon={DollarSign} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Status Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
              {application ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {application.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Submitted {new Date(application.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Qualification Status</span>
                      <span className="font-medium">
                        {application.qualified ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Pre-Qualified
                          </span>
                        ) : (
                          <span className="text-yellow-600">Under Review</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Monthly Earnings Potential</span>
                      <span className="font-medium text-green-600">
                        ${application.monthlyEarnings || '500-1000'}/month
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Equipment Status</span>
                      <span className="font-medium">
                        {application.equipmentShipped ? 'Shipped' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No application found</p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              )}
            </div>

            {/* Shipment Tracking */}
            {shipment && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Tracking</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tracking Number</span>
                    <span className="font-mono font-medium">{shipment.trackingNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Carrier</span>
                    <span className="font-medium">{shipment.carrier}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium text-blue-600">{shipment.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estimated Delivery</span>
                    <span className="font-medium">
                      {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                  {shipment.installationGuideUrl && (
                    <a
                      href={shipment.installationGuideUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-purple-50 text-purple-600 py-2 px-4 rounded-lg hover:bg-purple-100 transition-colors mt-4"
                    >
                      View Installation Guide
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Earnings Summary */}
            {earnings && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">${earnings.totalEarnings}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Average</p>
                    <p className="text-xl font-semibold text-gray-900">${earnings.averageMonthly}</p>
                  </div>
                  {earnings.lastPayment && (
                    <div>
                      <p className="text-sm text-gray-600">Last Payment</p>
                      <p className="font-medium">${earnings.lastPayment.amount}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(earnings.lastPayment.date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming Appointment */}
            {appointment && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointment</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{new Date(appointment.scheduledDate).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm">{appointment.type}</span>
                  </div>
                  {appointment.meetingLink && (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Join Meeting
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between">
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between">
                  <span className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download Documents
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between">
                  <span className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Update Profile
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;