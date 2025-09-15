'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Download, LogOut } from 'lucide-react';
import { getLeadStats, getLeads } from '@/lib/api/leads';
import { logoutAdmin } from '@/lib/api/auth';
import { StatsResponse, Lead } from '@/types';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch statistics
      const statsResponse = await getLeadStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        toast.error('Failed to fetch statistics');
      }

      // Fetch recent leads
      const leadsResponse = await getLeads(1, 10);
      if (leadsResponse.success && leadsResponse.data && leadsResponse.data.data) {
        setRecentLeads(leadsResponse.data.data);
      } else {
        setRecentLeads([]);
        console.warn('No recent leads data available');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  const handleLogout = async () => {
    try {
      const result = await logoutAdmin();
      if (result.success) {
        toast.success('Logged out successfully');
        window.location.reload(); // Force reload to reset auth state
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const exportToCSV = () => {
    // Implementation for CSV export
    toast.success('Export started');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'installed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'installed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">EdgeVantage Lead Management System</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {stats?.totalLeads || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Applications</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-sm text-gray-500">Approved</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {stats?.approvedLeads || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">Approved Leads</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Rate</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {stats?.conversionRate || 0}%
            </div>
            <p className="text-sm text-gray-600 mt-1">Conversion Rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">Avg</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {Math.round(stats?.averageTimeToComplete || 0)}s
            </div>
            <p className="text-sm text-gray-600 mt-1">Avg Completion Time</p>
          </div>
        </div>

        {/* Top States and Referral Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top States</h2>
            <div className="space-y-3">
              {stats?.topStates?.map((state, index) => (
                <div key={state.state} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                    <span className="font-medium text-gray-900">{state.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(state.count / (stats?.totalLeads || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-12 text-right tabular-nums">
                      {state.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Referral Sources</h2>
            <div className="space-y-3">
              {stats?.topReferralSources?.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                    <span className="font-medium text-gray-900 capitalize">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(source.count / (stats?.totalLeads || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-12 text-right tabular-nums">
                      {source.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qualified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentLeads && recentLeads.length > 0 ? recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.fullName}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.city}, {lead.state}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {getStatusIcon(lead.status)}
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {lead.hasResidence && <CheckCircle className="w-4 h-4 text-green-500" title="Has Residence" />}
                        {lead.hasInternet && <CheckCircle className="w-4 h-4 text-blue-500" title="Has Internet" />}
                        {lead.hasSpace && <CheckCircle className="w-4 h-4 text-purple-500" title="Has Space" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-emerald-600 hover:text-emerald-900">
                        View
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No recent leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedAdminRoute>
      <AdminDashboard />
    </ProtectedAdminRoute>
  );
}