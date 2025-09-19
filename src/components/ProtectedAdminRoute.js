import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AdminAuth from './AdminAuth';

const ProtectedAdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const adminData = sessionStorage.getItem('adminUser');

      if (!token || !adminData) {
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminUser(data.admin);
        setIsAuthenticated(true);
      } else {
        // Clear invalid token
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
      }
    } catch (error) {
      console.error('Admin auth verification failed:', error);
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticated = (admin) => {
    setAdminUser(admin);
    setIsAuthenticated(true);
    
    // Track admin login for security monitoring
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'admin_login', {
        event_category: 'Security',
        event_label: admin.username
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setAdminUser(null);
    
    // Track admin logout
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'admin_logout', {
        event_category: 'Security',
        event_label: adminUser?.username
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  // Clone children with admin context
  return React.cloneElement(children, { 
    adminUser, 
    onLogout: handleLogout 
  });
};

export default ProtectedAdminRoute;