
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Menu, Eye, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/AdminSidebar';
import UserManagement from '@/components/UserManagement';
import CourseManagement from '@/components/CourseManagement';
import EnrollmentManagement from '@/components/EnrollmentManagement';
import HomepageContentManagement from '@/components/HomepageContentManagement';
import CouponManagement from '@/components/CouponManagement';
import AdminNotifications from '@/components/AdminNotifications';
import NotificationBell from '@/components/NotificationBell';

const AdminDashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check if user is admin
  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
      } else {
        navigate('/');
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else if (!loading) {
      navigate('/admin-login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleViewSite = () => {
    window.open('/', '_blank');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed positioning */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content - Adjusts based on sidebar state */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'lg:ml-64' : 'ml-0'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage users, courses, and system settings</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewSite}
                className="text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Site
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<AdminNotifications />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/courses" element={<CourseManagement />} />
              <Route path="/enrollments" element={<EnrollmentManagement />} />
              <Route path="/homepage" element={<HomepageContentManagement />} />
              <Route path="/coupons" element={<CouponManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
