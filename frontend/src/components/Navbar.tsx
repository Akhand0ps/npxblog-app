import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Debug authentication state
  useEffect(() => {
    console.log('🔄 Navbar - Auth state changed:', {
      isAuthenticated,
      user: user?.name || 'No user',
      loading
    });
  }, [isAuthenticated, user, loading]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-white/90 safe-area-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 rounded-md px-2 py-1 -ml-2"
            aria-label="npx homepage"
          >
            <span className="gradient-text">npx</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {loading ? (
              // Show loading skeleton while checking authentication
              <div className="flex items-center space-x-4">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/write"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium px-3 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 btn-touch"
                  aria-label="Write a new story"
                >
                  <PenTool size={18} aria-hidden="true" />
                  <span className="hidden lg:inline">Write</span>
                </Link>
                
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium px-3 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 btn-touch"
                  aria-label="View your profile"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <User size={18} aria-hidden="true" />
                  )}
                  <span className="hidden lg:inline">Profile</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium px-3 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 btn-touch"
                  aria-label="Sign out"
                >
                  <LogOut size={18} aria-hidden="true" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 btn-touch"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-black text-white px-4 sm:px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 shadow-sm hover:shadow-md btn-touch"
                  aria-label="Create a new account"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 btn-touch"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X size={24} aria-hidden="true" />
              ) : (
                <Menu size={24} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden border-t border-gray-200 py-3 space-y-1 bg-white animate-fadeIn safe-area-padding"
          >
            {loading ? (
              // Show loading skeleton in mobile menu
              <div className="px-4 space-y-3">
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/write"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-3 rounded-md transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 btn-touch mx-2"
                  aria-label="Write a new story"
                >
                  <PenTool size={20} aria-hidden="true" />
                  <span>Write</span>
                </Link>
                
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-3 rounded-md transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 btn-touch mx-2"
                  aria-label="View your profile"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <User size={20} aria-hidden="true" />
                  )}
                  <span>Profile</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-3 rounded-md transition-colors duration-200 font-medium w-full text-left focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 btn-touch mx-2"
                  aria-label="Sign out"
                >
                  <LogOut size={20} aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-3 rounded-md transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 btn-touch mx-2"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block bg-black text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 mx-4 text-center btn-touch"
                  aria-label="Create a new account"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
