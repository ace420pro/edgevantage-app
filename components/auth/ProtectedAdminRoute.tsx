'use client';

import { useState, useEffect, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { verifyAdminToken, AdminUser } from '@/lib/api/auth';
import AdminLogin from './AdminLogin';

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const result = await verifyAdminToken();
      if (result.success && result.data) {
        setIsAuthenticated(true);
        setAdmin(result.data.admin);
      } else {
        setIsAuthenticated(false);
        setAdmin(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    checkAuth(); // Re-check auth after successful login
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  // Provide admin context to children if needed
  return <>{children}</>;
}