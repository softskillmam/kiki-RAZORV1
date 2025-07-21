
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Home, BookOpen, Info, ShoppingCart, User, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AdminAccess from '@/components/AdminAccess';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchOpen: () => void;
  onCartClick: () => void;
  onUserProfileOpen: () => void;
}

const MobileSidebar = ({ isOpen, onClose, onSearchOpen, onCartClick, onUserProfileOpen }: MobileSidebarProps) => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 md:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold text-gray-900">KIKI</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              <Link
                to="/"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-kiki-purple-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                onClick={onClose}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link
                to="/programs"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-kiki-purple-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                onClick={onClose}
              >
                <BookOpen className="w-5 h-5" />
                <span>Programs</span>
              </Link>
              <Link
                to="/about"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-kiki-purple-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                onClick={onClose}
              >
                <Info className="w-5 h-5" />
                <span>About</span>
              </Link>
              
              <div className="border-t pt-4 mt-4">
                <button
                  onClick={() => {
                    onSearchOpen();
                    onClose();
                  }}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-kiki-purple-600 hover:bg-gray-100 rounded-lg font-medium transition-colors w-full text-left"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
                
                <button
                  onClick={() => {
                    onCartClick();
                    onClose();
                  }}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-kiki-purple-600 hover:bg-gray-100 rounded-lg font-medium transition-colors w-full text-left"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                </button>
              </div>

              {isAuthenticated ? (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-500 font-medium">
                    {user?.email}
                  </div>
                  
                  <AdminAccess />
                  
                  <button
                    onClick={() => {
                      onUserProfileOpen();
                      onClose();
                    }}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-kiki-purple-600 hover:bg-gray-100 rounded-lg font-medium transition-colors w-full text-left"
                  >
                    <User className="w-5 h-5" />
                    <span>View Profile</span>
                  </button>
                  
                  <Link
                    to="/enrolled-courses"
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-kiki-purple-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    onClick={onClose}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>My Courses</span>
                  </Link>
                  
                  <Link
                    to="/career-test"
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-kiki-purple-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    onClick={onClose}
                  >
                    <User className="w-5 h-5" />
                    <span>Career Test</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="border-t pt-4 mt-4">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="block"
                  >
                    <Button className="w-full bg-kiki-purple-600 hover:bg-kiki-purple-700 text-white">
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
