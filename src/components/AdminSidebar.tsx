
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Bell,
  Home,
  Ticket,
  Shield,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      icon: Bell, 
      label: 'Dashboard', 
      path: '/admin',
      description: 'Overview & notifications'
    },
    { 
      icon: Users, 
      label: 'Users', 
      path: '/admin/users',
      description: 'Manage user accounts'
    },
    { 
      icon: BookOpen, 
      label: 'Courses', 
      path: '/admin/courses',
      description: 'Manage course content'
    },
    { 
      icon: GraduationCap, 
      label: 'Enrollments', 
      path: '/admin/enrollments',
      description: 'Track student progress'
    },
    { 
      icon: Home, 
      label: 'Homepage', 
      path: '/admin/homepage',
      description: 'Manage homepage content'
    },
    { 
      icon: Ticket, 
      label: 'Coupons', 
      path: '/admin/coupons',
      description: 'Manage discount codes'
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <div className="w-64 h-full bg-white shadow-xl border-r border-gray-200 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
              <p className="text-xs text-gray-500">KIKI Learning Hub</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start h-auto p-4 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-red-600' : 'text-gray-500'}`} />
              <div className="text-left flex-1 min-w-0">
                <div className={`font-medium truncate ${isActive ? 'text-red-700' : 'text-gray-900'}`}>
                  {item.label}
                </div>
                <div className={`text-xs truncate ${isActive ? 'text-red-600' : 'text-gray-500'}`}>
                  {item.description}
                </div>
              </div>
            </Button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="text-sm">
            <div className="font-semibold text-red-800 mb-1">System Status</div>
            <div className="text-red-600 text-xs">All systems operational</div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-red-700">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
