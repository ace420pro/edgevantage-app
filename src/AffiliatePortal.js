import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, TrendingUp, Link2, Copy, Share2, 
  CheckCircle, Clock, XCircle, Mail, Phone, Calendar,
  Award, BarChart3, Target, Gift, RefreshCw, Download,
  User, Settings, LogOut, Bell, Eye, ExternalLink, Star
} from 'lucide-react';

const AffiliatePortal = () => {
  const [affiliateData, setAffiliateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [affiliateCode, setAffiliateCode] = useState('');

  const API_URL = '';

  useEffect(() => {
    // Get affiliate code from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    const codeFromStorage = localStorage.getItem('affiliateCode');
    
    const code = codeFromUrl || codeFromStorage;
    if (code) {
      setAffiliateCode(code);
      if (!codeFromStorage) {
        localStorage.setItem('affiliateCode', code);
      }
      fetchAffiliateData(code);
    } else {
      // Allow users to access affiliate portal to sign up
      setIsLoading(false);
    }
  }, []);

  const fetchAffiliateData = async (code) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/affiliates/${code}/dashboard`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch affiliate data');
      }

      const data = await response.json();
      setAffiliateData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralUrl = `${window.location.origin}/?ref=${affiliateCode}`;
    navigator.clipboard.writeText(referralUrl);
    alert('Referral link copied to clipboard!');
  };

  const shareReferralLink = () => {
    const referralUrl = `${window.location.origin}/?ref=${affiliateCode}`;
    const text = `Join EdgeVantage and start earning $500-$1000 monthly passive income! Use my referral link: ${referralUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'EdgeVantage Passive Income Opportunity',
        text: text,
        url: referralUrl
      });
    } else {
      copyReferralLink();
    }
  };

  const generateMarketingMaterials = () => {
    const materials = [
      {
        type: 'Social Media Post',
        content: `🚀 Want to earn $500-$1000 monthly passive income? Join EdgeVantage with my referral link and get started today! ${window.location.origin}/?ref=${affiliateCode} #PassiveIncome #EdgeVantage`
      },
      {
        type: 'Email Template',
        content: `Hi [Name],\n\nI wanted to share an amazing passive income opportunity with you. I've been earning consistent monthly income through EdgeVantage, and I think you'd be perfect for this.\n\nHere's my personal referral link: ${window.location.origin}/?ref=${affiliateCode}\n\nLet me know if you have any questions!\n\nBest regards,\n${affiliateData?.affiliate?.name || 'Your Name'}`
      }
    ];
    
    return materials;
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className="text-right">
            <div className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </div>
            <div className="text-xs text-gray-500">vs last month</div>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your affiliate dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && error !== 'No affiliate code provided') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const { affiliate, stats, recentReferrals, commissions, referralStats } = affiliateData || {};

  // Show signup form if no affiliate code is provided
  if (!affiliateCode && !affiliateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🚀 Join the EdgeVantage Affiliate Program
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Earn $50 for every successful referral. Help others discover passive income opportunities and get rewarded for it!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Earn $50 Per Referral</h3>
                </div>
                <p className="text-gray-600">
                  Get paid $50 for every person you refer who gets approved and starts earning with EdgeVantage.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Easy Sharing Tools</h3>
                </div>
                <p className="text-gray-600">
                  Get your personalized referral link and marketing materials to share with friends, family, and social media.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Track Your Success</h3>
                </div>
                <p className="text-gray-600">
                  Monitor your referrals, track conversions, and see your earnings in real-time through your affiliate dashboard.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Get Started as an Affiliate</h2>
              
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    To become an EdgeVantage affiliate, you need to first complete the EdgeVantage application process.
                  </p>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-colors"
                  >
                    Apply for EdgeVantage First
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Already approved?</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    If you're already approved for EdgeVantage, contact us to get your affiliate code.
                  </p>
                  <div className="space-y-3">
                    <a
                      href="tel:(817)204-6783"
                      className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call (817) 204-6783
                    </a>
                    <a
                      href="mailto:support@edgevantagepro.com"
                      className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Affiliate Portal</h1>
              <p className="text-sm text-gray-600">Welcome back, {affiliate?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Exit
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mt-4">
          {['dashboard', 'referrals', 'commissions', 'marketing', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 border-b-2 transition-colors capitalize ${
                activeTab === tab 
                  ? 'border-purple-600 text-purple-600 font-medium' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Referrals"
                value={stats?.totalReferrals || 0}
                change={12.5}
                icon={Users}
                color="bg-blue-600"
                subtitle="All time referrals"
              />
              <MetricCard
                title="Approved Referrals"
                value={stats?.approvedReferrals || 0}
                change={8.3}
                icon={CheckCircle}
                color="bg-green-600"
                subtitle="Earning commissions"
              />
              <MetricCard
                title="Total Earned"
                value={`$${stats?.totalCommissions || 0}`}
                change={15.7}
                icon={DollarSign}
                color="bg-purple-600"
                subtitle="Lifetime earnings"
              />
              <MetricCard
                title="Conversion Rate"
                value={`${stats?.conversionRate || 0}%`}
                change={2.1}
                icon={TrendingUp}
                color="bg-orange-600"
                subtitle="Approval rate"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={copyReferralLink}
                  className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <Link2 className="w-5 h-5 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-blue-700">Copy Referral Link</span>
                </button>
                <button
                  onClick={shareReferralLink}
                  className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                >
                  <Share2 className="w-5 h-5 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-green-700">Share Link</span>
                </button>
                <button
                  onClick={() => setActiveTab('marketing')}
                  className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <Gift className="w-5 h-5 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-purple-700">Marketing Materials</span>
                </button>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Referral Performance</h3>
                <div className="space-y-4">
                  {Object.entries(referralStats || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          status === 'approved' ? 'bg-green-500' :
                          status === 'pending' ? 'bg-yellow-500' :
                          status === 'contacted' ? 'bg-blue-500' :
                          'bg-red-500'
                        }`} />
                        <span className="capitalize text-gray-700">{status}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Commission Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Total Earned</span>
                    <span className="font-bold text-green-600">${stats?.totalCommissions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Pending</span>
                    <span className="font-bold text-blue-600">${stats?.pendingCommissions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Commission Rate</span>
                    <span className="font-bold text-purple-600">${affiliate?.commissionRate || 50}/referral</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">Recent Referrals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentReferrals?.slice(0, 5).map((referral, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{referral.name}</div>
                          <div className="text-sm text-gray-500">{referral.city}, {referral.state}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            referral.status === 'approved' ? 'bg-green-100 text-green-800' :
                            referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            referral.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {referral.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {referral.status === 'approved' ? `$${affiliate?.commissionRate || 50}` : 'Pending'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-6">
            {/* Referral Overview */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">All Referrals</h3>
                <button 
                  onClick={() => fetchAffiliateData(affiliateCode)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentReferrals?.map((referral, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{referral.name}</div>
                          <div className="text-sm text-gray-500">{referral.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {referral.city}, {referral.state}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            referral.status === 'approved' ? 'bg-green-100 text-green-800' :
                            referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            referral.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {referral.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {referral.qualified ? 
                            <CheckCircle className="w-5 h-5 text-green-600" /> : 
                            <XCircle className="w-5 h-5 text-red-600" />
                          }
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {referral.status === 'approved' ? (
                            <span className="text-green-600">${affiliate?.commissionRate || 50}</span>
                          ) : (
                            <span className="text-gray-500">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-6">
            {/* Referral Tools */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Referral Link</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg font-mono text-sm">
                  {window.location.origin}/?ref={affiliateCode}
                </div>
                <button
                  onClick={copyReferralLink}
                  className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </button>
                <button
                  onClick={shareReferralLink}
                  className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Marketing Materials */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Marketing Materials</h3>
              <div className="space-y-6">
                {generateMarketingMaterials().map((material, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-900">{material.type}</h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(material.content);
                          alert(`${material.type} copied to clipboard!`);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {material.content}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Affiliate Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{affiliate?.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{affiliate?.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Affiliate Code</label>
                  <div className="p-3 bg-blue-50 rounded-lg font-mono font-semibold text-blue-700">
                    {affiliate?.affiliateCode}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate</label>
                  <div className="p-3 bg-green-50 rounded-lg font-semibold text-green-700">
                    ${affiliate?.commissionRate || 50} per approved referral
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    affiliate?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {affiliate?.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {affiliate?.createdAt ? new Date(affiliate.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliatePortal;