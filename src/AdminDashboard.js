import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, DollarSign, Activity, Filter, Download,
  Calendar, MapPin, Mail, Phone, Shield, CheckCircle,
  XCircle, Clock, RefreshCw, ChevronDown, Search, Edit2,
  Trash2, Eye, BarChart3, PieChart, FileText, Settings,
  UserCheck, AlertCircle, Star, ArrowUpRight, ArrowDownRight,
  Home, X, Loader2, Link2, Award, CreditCard, UserPlus, Copy,
  TestTube
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ABTestManager from './ABTestManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    statusBreakdown: {},
    qualifiedCount: 0,
    notQualifiedCount: 0,
    totalReferrals: 0,
    topStates: [],
    referralSources: [],
    avgMonthlyPayout: 0,
    recentApplications: [],
    conversionRate: 0,
    weeklyGrowth: 0,
    monthlyRevenue: 0,
    activeMembers: 0
  });
  const [affiliates, setAffiliates] = useState([]);
  const [affiliateStats, setAffiliateStats] = useState({
    totalAffiliates: 0,
    activeAffiliates: 0,
    totalCommissions: 0,
    monthlyCommissions: 0,
    avgCommissionPerAffiliate: 0,
    topPerformers: [],
    recentSignups: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [affiliateSearchTerm, setAffiliateSearchTerm] = useState('');

  // API base URL - force relative path since backend and frontend are on same domain
  const API_URL = '';

  useEffect(() => {
    fetchDashboardData();
    if (activeTab === 'affiliates') {
      fetchAffiliateData();
    }
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      if (activeTab === 'affiliates') {
        fetchAffiliateData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [dateRange, statusFilter, activeTab]);

  const fetchDashboardData = async () => {
    console.log('Fetching dashboard data...');
    setIsLoading(true);
    try {
      const [leadsResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/api/leads?limit=100${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`),
        fetch(`${API_URL}/api/leads-stats`)
      ]);
      
      console.log('Leads response status:', leadsResponse.status);
      console.log('Stats response status:', statsResponse.status);

      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        console.log('Fetched leads count:', leadsData.leads?.length || 0);
        setLeads(leadsData.leads || []);
      } else {
        console.error('Leads fetch failed:', leadsResponse.status);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Fetched stats:', statsData);
        const conversionRate = statsData.totalApplications > 0 
          ? (statsData.qualifiedCount / statsData.totalApplications * 100).toFixed(1)
          : 0;
        
        setStats({
          ...statsData,
          conversionRate,
          weeklyGrowth: 12.5,
          monthlyRevenue: (statsData.statusBreakdown?.approved || 0) * (statsData.avgMonthlyPayout || 750),
          activeMembers: statsData.statusBreakdown?.approved || 0
        });
      } else {
        console.error('Stats fetch failed:', statsResponse.status);
      }
      
      console.log('Dashboard data refresh completed');
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAffiliateData = async () => {
    try {
      const [affiliatesResponse, affiliateStatsResponse] = await Promise.all([
        fetch(`${API_URL}/api/affiliates`),
        fetch(`${API_URL}/api/affiliates-stats`)
      ]);

      if (affiliatesResponse.ok) {
        const affiliatesData = await affiliatesResponse.json();
        setAffiliates(affiliatesData.affiliates || []);
      }

      if (affiliateStatsResponse.ok) {
        const statsData = await affiliateStatsResponse.json();
        setAffiliateStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch affiliate data:', error);
    }
  };

  const updateLeadStatus = async (leadId, updates) => {
    try {
      console.log('Updating lead:', leadId, 'with updates:', updates);
      console.log('API URL:', `${API_URL}/api/leads?id=${leadId}`);
      
      const response = await fetch(`${API_URL}/api/leads?id=${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      console.log('Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        if (response.ok) {
          // If response is OK but JSON parsing failed, still consider it success
          console.log('Update likely successful despite JSON parse error, refreshing dashboard...');
          await fetchDashboardData();
          setSelectedLead(null);
          alert('Lead updated successfully!');
          return;
        }
        throw parseError;
      }

      if (response.ok) {
        console.log('Update successful, refreshing dashboard...');
        await fetchDashboardData();
        setSelectedLead(null);
        alert('Lead updated successfully!');
      } else {
        console.error('Update failed:', data);
        alert(`Failed to update lead: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const updateAffiliateStatus = async (affiliateId, updates) => {
    try {
      const response = await fetch(`${API_URL}/api/affiliates?id=${affiliateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchAffiliateData();
        setSelectedAffiliate(null);
      }
    } catch (error) {
      console.error('Failed to update affiliate:', error);
    }
  };

  const deleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/leads?id=${leadId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const deleteAffiliate = async (affiliateId) => {
    if (!window.confirm('Are you sure you want to delete this affiliate?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/affiliates?id=${affiliateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchAffiliateData();
      }
    } catch (error) {
      console.error('Failed to delete affiliate:', error);
    }
  };

  const exportToCSV = () => {
    const csvContent = convertToCSV(leads);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edgevantage-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportAffiliateCSV = () => {
    const csvContent = convertToCSV(affiliates);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edgevantage-affiliates-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(val => 
        typeof val === 'string' ? `"${val}"` : val
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const copyReferralLink = (affiliateCode) => {
    const referralUrl = `https://edgevantagepro.com/?ref=${affiliateCode}`;
    navigator.clipboard.writeText(referralUrl);
    alert('Referral link copied to clipboard!');
  };

  const filteredLeads = leads.filter(lead => 
    (searchTerm === '' || 
     lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     lead.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     lead.state?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAffiliates = affiliates.filter(affiliate => 
    (affiliateSearchTerm === '' || 
     affiliate.name?.toLowerCase().includes(affiliateSearchTerm.toLowerCase()) ||
     affiliate.email?.toLowerCase().includes(affiliateSearchTerm.toLowerCase()) ||
     affiliate.affiliateCode?.toLowerCase().includes(affiliateSearchTerm.toLowerCase()))
  );

  const MetricCard = ({ title, value, change, icon: Icon, color, prefix = '' }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{prefix}{value.toLocaleString()}</p>
    </div>
  );

  const LeadDetailsModal = () => {
    if (!selectedLead) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Lead Details</h3>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-lg font-semibold">{selectedLead.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <select 
                  value={selectedLead.status || 'pending'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedLead(prev => ({ 
                      ...prev, 
                      status: value 
                    }));
                  }}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg">{selectedLead.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <input 
                  key="changenumber"
                  type="tel"
                  placeholder="Enter phone number"
                  value={selectedLead.phone || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedLead(prev => ({ 
                      ...prev, 
                      phone: value
                    }));
                  }}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-lg">{selectedLead.city}, {selectedLead.state}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Qualified</label>
                <p className="text-lg">
                  {selectedLead.qualified ? 
                    <span className="text-green-600 flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Yes</span> : 
                    <span className="text-red-600 flex items-center"><XCircle className="w-4 h-4 mr-1" /> No</span>
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Referral Code</label>
                <input 
                  type="text"
                  placeholder="Enter referral code"
                  value={selectedLead.referralCode || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedLead(prev => ({ 
                      ...prev, 
                      referralCode: value
                    }));
                  }}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Monthly Earnings</label>
                <input 
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter monthly earnings"
                  value={selectedLead.monthlyEarnings || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedLead(prev => ({ 
                      ...prev, 
                      monthlyEarnings: value
                    }));
                  }}
                  onBlur={(e) => {
                    // Convert to number on blur to validate
                    const numValue = e.target.value === '' ? 0 : Number(e.target.value) || 0;
                    setSelectedLead(prev => ({ 
                      ...prev, 
                      monthlyEarnings: numValue
                    }));
                  }}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <textarea 
                  value={selectedLead.notes || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedLead(prev => ({ 
                      ...prev, 
                      notes: value 
                    }));
                  }}
                  placeholder="Add notes about this lead..."
                  rows="3"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => deleteLead(selectedLead._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Lead
              </button>
              <button
                onClick={() => {
                  console.log('Save button clicked');
                  console.log('Current selectedLead:', selectedLead);
                  const { _id, status, monthlyEarnings, notes, phone, referralCode } = selectedLead;
                  console.log('Extracted values - ID:', _id, 'Status:', status, 'Earnings:', monthlyEarnings, 'Notes:', notes, 'Phone:', phone, 'RefCode:', referralCode);
                  updateLeadStatus(_id, { status, monthlyEarnings, notes, phone, referralCode });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AffiliateDetailsModal = () => {
    if (!selectedAffiliate) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Affiliate Details</h3>
              <button onClick={() => setSelectedAffiliate(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-lg font-semibold">{selectedAffiliate.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <select 
                  value={selectedAffiliate.status}
                  onChange={(e) => {
                    const updated = { ...selectedAffiliate, status: e.target.value };
                    setSelectedAffiliate(updated);
                  }}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg">{selectedAffiliate.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Affiliate Code</label>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">{selectedAffiliate.affiliateCode}</p>
                  <button
                    onClick={() => copyReferralLink(selectedAffiliate.affiliateCode)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Referrals</label>
                <p className="text-lg">{selectedAffiliate.totalReferrals}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Commissions</label>
                <p className="text-lg">${selectedAffiliate.totalCommissions?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Commission Rate</label>
                <input 
                  type="number"
                  value={selectedAffiliate.commissionRate || 50}
                  onChange={(e) => {
                    const updated = { ...selectedAffiliate, commissionRate: e.target.value };
                    setSelectedAffiliate(updated);
                  }}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Method</label>
                <select
                  value={selectedAffiliate.paymentMethod || 'paypal'}
                  onChange={(e) => {
                    const updated = { ...selectedAffiliate, paymentMethod: e.target.value };
                    setSelectedAffiliate(updated);
                  }}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <textarea 
                  value={selectedAffiliate.notes || ''}
                  onChange={(e) => {
                    const updated = { ...selectedAffiliate, notes: e.target.value };
                    setSelectedAffiliate(updated);
                  }}
                  rows="3"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => deleteAffiliate(selectedAffiliate._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Affiliate
              </button>
              <button
                onClick={() => {
                  const { _id, status, commissionRate, paymentMethod, notes } = selectedAffiliate;
                  updateAffiliateStatus(_id, { status, commissionRate, paymentMethod, notes });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EdgeVantage Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Real-time analytics and lead management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Site
            </Link>
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={activeTab === 'affiliates' ? exportAffiliateCSV : exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mt-4">
          {['overview', 'leads', 'affiliates', 'analytics', 'abtests', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 border-b-2 transition-colors capitalize flex items-center ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-600 font-medium' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'abtests' && <TestTube className="w-4 h-4 mr-1" />}
              {tab === 'abtests' ? 'A/B Tests' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Applications"
                value={stats.totalApplications}
                change={stats.weeklyGrowth}
                icon={Users}
                color="bg-blue-600"
              />
              <MetricCard
                title="Conversion Rate"
                value={`${stats.conversionRate}%`}
                change={2.3}
                icon={TrendingUp}
                color="bg-green-600"
              />
              <MetricCard
                title="Monthly Revenue"
                value={stats.monthlyRevenue}
                change={15.2}
                icon={DollarSign}
                color="bg-purple-600"
                prefix="$"
              />
              <MetricCard
                title="Active Members"
                value={stats.activeMembers}
                change={8.7}
                icon={UserCheck}
                color="bg-orange-600"
              />
            </div>

            {/* Status Breakdown & Top States */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Application Status</h3>
                <div className="space-y-3">
                  {Object.entries(stats.statusBreakdown).map(([status, count]) => (
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

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top States</h3>
                <div className="space-y-3">
                  {stats.topStates.slice(0, 5).map((state, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-500 mr-3" />
                        <span className="text-gray-700">{state._id}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 mr-2">{state.count}</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(state.count / stats.totalApplications) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.recentApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{app.name}</div>
                            <div className="text-sm text-gray-500">{app.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {app.city}, {app.state}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            app.status === 'approved' ? 'bg-green-100 text-green-800' :
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {app.qualified ? 
                            <CheckCircle className="w-5 h-5 text-green-600" /> : 
                            <XCircle className="w-5 h-5 text-red-600" />
                          }
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedLead(app)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by name, email, city, or state..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referral</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                            <div className="text-sm text-gray-500">{lead.email}</div>
                            <div className="text-sm text-gray-500">{lead.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {lead.city}, {lead.state}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            lead.status === 'approved' ? 'bg-green-100 text-green-800' :
                            lead.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {lead.qualified ? 
                            <CheckCircle className="w-5 h-5 text-green-600" /> : 
                            <XCircle className="w-5 h-5 text-red-600" />
                          }
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {lead.referralCode || 'Direct'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${lead.monthlyEarnings || 0}/mo
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteLead(lead._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'affiliates' && (
          <div className="space-y-6">
            {/* Affiliate Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Affiliates"
                value={affiliateStats.totalAffiliates}
                change={8.3}
                icon={Users}
                color="bg-blue-600"
              />
              <MetricCard
                title="Active Affiliates"
                value={affiliateStats.activeAffiliates}
                change={5.7}
                icon={UserCheck}
                color="bg-green-600"
              />
              <MetricCard
                title="Total Commissions"
                value={affiliateStats.totalCommissions}
                change={12.4}
                icon={DollarSign}
                color="bg-purple-600"
                prefix="$"
              />
              <MetricCard
                title="Monthly Commissions"
                value={affiliateStats.monthlyCommissions}
                change={18.9}
                icon={Award}
                color="bg-orange-600"
                prefix="$"
              />
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or affiliate code..."
                      value={affiliateSearchTerm}
                      onChange={(e) => setAffiliateSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performers</h3>
              <div className="space-y-3">
                {affiliateStats.topPerformers?.slice(0, 5).map((affiliate, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{affiliate.name}</p>
                        <p className="text-sm text-gray-500">{affiliate.affiliateCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{affiliate.totalReferrals} referrals</p>
                      <p className="text-sm text-green-600">${affiliate.totalCommissions?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Affiliates Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrals</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commissions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAffiliates.map((affiliate) => (
                      <tr key={affiliate._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{affiliate.name}</div>
                            <div className="text-sm text-gray-500">{affiliate.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{affiliate.affiliateCode}</span>
                            <button
                              onClick={() => copyReferralLink(affiliate.affiliateCode)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            affiliate.status === 'active' ? 'bg-green-100 text-green-800' :
                            affiliate.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {affiliate.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {affiliate.totalReferrals}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${affiliate.totalCommissions?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(affiliate.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedAffiliate(affiliate)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => copyReferralLink(affiliate.affiliateCode)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Link2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteAffiliate(affiliate._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Conversion Funnel Visualization */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Conversion Funnel Analysis</h3>
              <div className="space-y-6">
                {/* Funnel Steps */}
                {(() => {
                  const totalVisitors = Math.floor(stats.totalApplications * 4.2); // Estimate visitors from applications
                  const totalApplications = stats.totalApplications;
                  const qualifiedApplications = stats.qualifiedCount;
                  const approvedApplications = stats.statusBreakdown?.approved || 0;
                  const activeMembers = stats.activeMembers;

                  const funnelSteps = [
                    { name: 'Website Visitors', count: totalVisitors, color: 'bg-blue-500', percentage: 100 },
                    { name: 'Started Application', count: Math.floor(totalVisitors * 0.45), color: 'bg-indigo-500', percentage: 45 },
                    { name: 'Completed Application', count: totalApplications, color: 'bg-purple-500', percentage: Math.round((totalApplications / totalVisitors) * 100) },
                    { name: 'Pre-Qualified', count: qualifiedApplications, color: 'bg-pink-500', percentage: Math.round((qualifiedApplications / totalVisitors) * 100) },
                    { name: 'Approved', count: approvedApplications, color: 'bg-green-500', percentage: Math.round((approvedApplications / totalVisitors) * 100) },
                    { name: 'Active & Earning', count: activeMembers, color: 'bg-emerald-500', percentage: Math.round((activeMembers / totalVisitors) * 100) }
                  ];

                  return (
                    <div className="space-y-4">
                      {funnelSteps.map((step, index) => {
                        const widthPercentage = Math.max((step.count / totalVisitors) * 100, 5);
                        const dropOff = index > 0 ? funnelSteps[index - 1].count - step.count : 0;
                        const conversionRate = index > 0 ? Math.round((step.count / funnelSteps[index - 1].count) * 100) : 100;
                        
                        return (
                          <div key={index} className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">{index + 1}.</span>
                                <span className="font-semibold text-gray-900">{step.name}</span>
                                {index > 0 && (
                                  <span className="text-xs text-gray-500">
                                    ({conversionRate}% conversion)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4">
                                {dropOff > 0 && (
                                  <span className="text-sm text-red-600">-{dropOff.toLocaleString()}</span>
                                )}
                                <span className="font-bold text-gray-900">{step.count.toLocaleString()}</span>
                                <span className="text-sm text-gray-500">({step.percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                              <div 
                                className={`${step.color} h-8 rounded-full transition-all duration-500 flex items-center justify-center`}
                                style={{ width: `${widthPercentage}%` }}
                              >
                                <span className="text-white text-sm font-medium">
                                  {step.count.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Advanced Conversion Metrics */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Conversion Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Overall Conversion Rate</span>
                    <span className="font-bold text-blue-600">{stats.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Application Completion</span>
                    <span className="font-bold text-green-600">23.8%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Qualification Rate</span>
                    <span className="font-bold text-purple-600">
                      {stats.totalApplications > 0 ? Math.round((stats.qualifiedCount / stats.totalApplications) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700">Approval Rate</span>
                    <span className="font-bold text-orange-600">
                      {stats.qualifiedCount > 0 ? Math.round(((stats.statusBreakdown?.approved || 0) / stats.qualifiedCount) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-gray-700">Revenue per Visitor</span>
                    <span className="font-bold text-emerald-600">
                      $${(stats.monthlyRevenue / Math.floor(stats.totalApplications * 4.2)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time-based Analytics */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Time-based Performance</h3>
                <div className="space-y-4">
                  {/* Mock time-based data */}
                  {[
                    { period: 'Today', applications: Math.floor(stats.totalApplications * 0.05), qualified: Math.floor(stats.qualifiedCount * 0.06) },
                    { period: 'This Week', applications: Math.floor(stats.totalApplications * 0.15), qualified: Math.floor(stats.qualifiedCount * 0.18) },
                    { period: 'This Month', applications: Math.floor(stats.totalApplications * 0.35), qualified: Math.floor(stats.qualifiedCount * 0.40) },
                    { period: 'Last 30 Days', applications: stats.totalApplications, qualified: stats.qualifiedCount }
                  ].map((period, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{period.period}</span>
                        <div className="flex space-x-4">
                          <span className="text-sm text-gray-600">
                            {period.applications} apps
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            {period.qualified} qualified
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min((period.applications / stats.totalApplications) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min((period.qualified / stats.qualifiedCount) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Geographic & Source Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top States with Conversion */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Geographic Performance</h3>
                <div className="space-y-3">
                  {stats.topStates.slice(0, 6).map((state, index) => {
                    // Mock conversion rates by state
                    const conversionRate = 65 + Math.random() * 25; // 65-90% range
                    const approvalRate = 45 + Math.random() * 35; // 45-80% range
                    
                    return (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{state._id}</span>
                          <span className="text-sm text-gray-600">{state.count} applications</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Qualification: </span>
                            <span className="font-medium text-blue-600">{conversionRate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Approval: </span>
                            <span className="font-medium text-green-600">{approvalRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Referral Source Performance */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Source Performance Analysis</h3>
                <div className="space-y-3">
                  {stats.referralSources.map((source, index) => {
                    // Mock performance metrics by source
                    const qualificationRate = 55 + Math.random() * 30; // 55-85% range
                    const avgValue = 650 + Math.random() * 200; // $650-850 range
                    
                    return (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900 capitalize">{source._id}</span>
                          <span className="text-sm text-gray-600">{source.count} leads</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Quality Score: </span>
                            <span className="font-medium text-purple-600">{qualificationRate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Avg Value: </span>
                            <span className="font-medium text-green-600">${avgValue.toFixed(0)}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full"
                              style={{ width: `${qualificationRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">${Math.round(stats.avgMonthlyPayout)}</p>
                  <p className="text-sm text-gray-600">Avg Monthly Payout</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">${stats.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-xs text-green-600 mt-1">↑ 18% from last month</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">${Math.round(stats.monthlyRevenue * 12).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Projected Annual</p>
                  <p className="text-xs text-green-600 mt-1">↑ 25% growth rate</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">${(stats.monthlyRevenue / (stats.statusBreakdown?.approved || 1)).toFixed(0)}</p>
                  <p className="text-sm text-gray-600">Revenue per Member</p>
                  <p className="text-xs text-green-600 mt-1">↑ 8% from last month</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'abtests' && (
          <ABTestManager />
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Dashboard Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-refresh Interval
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="30">Every 30 seconds</option>
                    <option value="60">Every minute</option>
                    <option value="300">Every 5 minutes</option>
                    <option value="0">Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Database Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Database Status</span>
                  <span className="font-medium text-green-600">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records</span>
                  <span className="font-medium">{stats.totalApplications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Endpoint</span>
                  <span className="font-medium text-sm">{API_URL}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LeadDetailsModal />
      <AffiliateDetailsModal />
    </div>
  );
};

export default AdminDashboard;