import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Menu, 
  X, 
  Home, 
  Radio, 
  MessageSquare, 
  Plus, 
  MapPin, 
  Globe,
  Settings,
  User,
  LogOut,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNews } from '../contexts/NewsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigationTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

interface Props {
  children: React.ReactNode;
  onAuthClick: () => void;
}

const Layout: React.FC<Props> = ({ children, onAuthClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut, loading, connectionError, retryConnection } = useAuth();
  const { translating } = useNews();
  const { currentLanguage } = useLanguage();
  const { t, translateBatch } = useNavigationTranslation();

  // Pre-load navigation translations
  useEffect(() => {
    translateBatch([
      { key: 'nav.home', text: 'Home' },
      { key: 'nav.realtime', text: 'Real-Time' },
      { key: 'nav.validator', text: 'Validator' },
      { key: 'nav.submit', text: 'Submit' },
      { key: 'nav.local', text: 'Local' },
      { key: 'nav.country', text: 'Country News' },
      { key: 'auth.signin', text: 'Sign In' },
      { key: 'auth.signout', text: 'Sign Out' },
      { key: 'admin.dashboard', text: 'Admin Dashboard' },
    ]);
  }, [translateBatch]);

  const navigation = [
    { name: t('nav.home', 'Home'), path: '/', icon: Home },
    { name: t('nav.realtime', 'Real-Time'), path: '/real-time', icon: Radio },
    { name: t('nav.validator', 'Validator'), path: '/validator', icon: MessageSquare },
    { name: t('nav.submit', 'Submit'), path: '/submit', icon: Plus },
    { name: t('nav.local', 'Local'), path: '/local', icon: MapPin },
    { name: t('nav.country', 'Country News'), path: '/country', icon: Globe },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 dark:text-red-400">
                  {connectionError}
                </span>
              </div>
              <button
                onClick={retryConnection}
                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Translation Status Banner */}
      {translating && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm text-blue-800 dark:text-blue-400">
                Translating content to {currentLanguage.name}...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">NewsVerify</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageSwitcher />
              
              {user && profile ? (
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <img
                      src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`}
                      alt={profile.full_name}
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {profile.full_name}
                    </span>
                    {profile.is_admin && (
                      <Link
                        to="/admin"
                        className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs px-2 py-1 rounded-full font-medium"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 transition-colors disabled:opacity-50"
                      title={t('auth.signout', 'Sign Out')}
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : t('auth.signin', 'Sign In')}
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-full max-w-xs h-full bg-white dark:bg-gray-800 shadow-xl transition-colors">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {user && profile?.is_admin && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>{t('admin.dashboard', 'Admin Dashboard')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;