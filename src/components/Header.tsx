
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCartCount } from '@/hooks/useCartCount';
import AdminAccess from '@/components/AdminAccess';
import SearchModal from '@/components/SearchModal';
import UserProfile from '@/components/UserProfile';
import MobileSidebar from '@/components/MobileSidebar';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const {
    isAuthenticated,
    user,
    logout
  } = useAuth();
  const { cartCount } = useCartCount();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/cart');
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="text-xl font-bold text-gray-900">KIKI'S Learning Hub</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-kiki-purple-600 font-medium transition-colors">
                Home
              </Link>
              <Link to="/programs" className="text-gray-700 hover:text-kiki-purple-600 font-medium transition-colors">
                Programs
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-kiki-purple-600 font-medium transition-colors">
                About
              </Link>
              
              {/* Show Career Test and My Courses in main navbar after login */}
              {isAuthenticated && (
                <>
                  <Link to="/career-test" className="text-gray-700 hover:text-kiki-purple-600 font-medium transition-colors">
                    Career Test
                  </Link>
                  <Link to="/enrolled-courses" className="text-gray-700 hover:text-kiki-purple-600 font-medium transition-colors">
                    My Courses
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)} className="text-gray-600 hover:text-gray-900">
                <Search className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={handleCartClick} className="text-gray-600 hover:text-gray-900 relative">
                <ShoppingCart className="w-4 h-4" />
                {isAuthenticated && cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                )}
              </Button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <AdminAccess />
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                      className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 px-3 py-2"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{getUserDisplayName()}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                    
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border">
                        <div className="px-4 py-3 text-sm text-gray-500 border-b">
                          <div className="font-medium text-gray-900">{getUserDisplayName()}</div>
                          <div className="truncate">{user?.email}</div>
                        </div>
                        <button 
                          onClick={() => {
                            setIsUserProfileOpen(true);
                            setIsUserMenuOpen(false);
                          }} 
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <User className="w-4 h-4 mr-2" />
                          View Profile
                        </button>
                        <button 
                          onClick={handleLogout} 
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <Button className="bg-kiki-purple-600 hover:bg-kiki-purple-700 text-white">
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-900">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onSearchOpen={() => setIsSearchOpen(true)} 
        onCartClick={handleCartClick} 
        onUserProfileOpen={() => setIsUserProfileOpen(true)} 
      />

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <UserProfile isOpen={isUserProfileOpen} onClose={() => setIsUserProfileOpen(false)} />
    </>
  );
};

export default Header;
