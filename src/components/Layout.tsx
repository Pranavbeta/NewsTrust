import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Radio, MessageSquare, Plus, MapPin, LogOut, AlertTriangle, RefreshCw, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNews } from '../contexts/NewsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigationTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import Profile from '../pages/Profile';
import NewsFeedStatus from './NewsFeedStatus';
import Footer from './Footer';

interface Props {
  children: React.ReactNode;
  onAuthClick: () => void;
}

const Layout: React.FC<Props> = ({ children, onAuthClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut, loading, connectionError, retryConnection } = useAuth();
  const { translating } = useNews();
  const { t, translateBatch } = useNavigationTranslation();
  const { currentLanguage } = useLanguage();

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
    { name: t('nav.country', 'Country News'), path: '/country', icon: Home },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Add placeholder sidebar widgets
  const sidebarWidgetClass = "bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 max-w-xs w-full mx-auto overflow-hidden";
  const LatestNewsSidebar = () => (
    <div className={sidebarWidgetClass}>
      <h3 className="font-bold mb-3">Latest News</h3>
      {/* TODO: Map latest news headlines here */}
      <ul className="space-y-2">
        <li className="text-sm text-gray-700 dark:text-gray-300">Supreme Court rules to allow Medicaid funding cuts for Planned Parenthood</li>
        <li className="text-sm text-gray-700 dark:text-gray-300">US economy shrank 0.5% between January and March</li>
        <li className="text-sm text-gray-700 dark:text-gray-300">Lab-grown barbecue banned in Texas</li>
      </ul>
    </div>
  );
  const CricketScoreWidget = () => (
    <div className={sidebarWidgetClass}>
      <h3 className="font-bold mb-3">Cricket Scores</h3>
      <div className="text-sm text-gray-700 dark:text-gray-300">India 245/6 (50) vs Australia 210/8 (48)</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Live: IND vs AUS, ODI Series</div>
    </div>
  );
  const AdsWidget = () => (
    <div className={sidebarWidgetClass + " flex items-center justify-center min-h-[120px]"}>
      <span className="text-gray-400 dark:text-gray-500 text-sm">Ad Space</span>
    </div>
  );

  // Profile dropdown state and outside click handler
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [openSubDropdown, setOpenSubDropdown] = useState<'theme' | 'language' | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.profile-dropdown')) {
        setProfileMenuOpen(false);
        setOpenSubDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileMenuOpen]);

  useEffect(() => {
    if (showProfileModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showProfileModal]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors max-w-full overflow-x-hidden w-full">
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
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors w-full max-w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 w-full max-w-full">
          <div className="flex items-center justify-between h-16 min-w-0 w-full max-w-full">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 min-w-0 relative mr-8" style={{ minWidth: 0 }}>
              <span className="mr-2 flex items-center">
                {/* Shield-check SVG icon with animation and golden border */}
                <svg className="w-8 h-8 shield-animate" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32 6L56 16V32C56 47 32 58 32 58C32 58 8 47 8 32V16L32 6Z" fill="none" stroke="#FFD700" strokeWidth="4"/>
                  <path d="M24 34L30 40L44 26" stroke="#43A047" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight truncate max-w-[120px] relative z-10">NewsTrust</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center space-x-2 overflow-x-auto scrollbar-hide min-w-0 flex-1 w-full max-w-full flex-wrap">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-base sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="truncate break-words max-w-[80px]">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-2 flex-shrink-0 min-w-0">
              {/* Desktop: Profile Dropdown */}
              {user && profile && (
                <div className="relative hidden sm:block">
                  <button
                    className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center text-white font-bold text-base uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Open profile menu"
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    tabIndex={0}
                  >
                    {profile.full_name
                      ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
                      : (profile.email ? profile.email[0].toUpperCase() : '?')}
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 py-2 flex flex-col gap-1 profile-dropdown" tabIndex={-1}>
                      <button
                        onClick={() => { setShowProfileModal(true); setProfileMenuOpen(false); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-left"
                      >
                        <User className="h-4 w-4 mr-2" /> Profile
                      </button>
                      {/* Theme sub-dropdown */}
                      <div className="relative">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-left"
                          onClick={() => setOpenSubDropdown(openSubDropdown === 'theme' ? null : 'theme')}
                        >
                          <User className="h-4 w-4 mr-2" /> Theme
                        </button>
                        {openSubDropdown === 'theme' && (
                          <div className="mt-1 ml-4"><ThemeToggle inline /></div>
                        )}
                      </div>
                      {/* Language sub-dropdown */}
                      <div className="relative">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-left"
                          onClick={() => setOpenSubDropdown(openSubDropdown === 'language' ? null : 'language')}
                        >
                          <User className="h-4 w-4 mr-2" /> Language
                        </button>
                        {openSubDropdown === 'language' && (
                          <div className="mt-1 ml-4"><LanguageSwitcher /></div>
                        )}
                      </div>
                      <Link to="/about" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <User className="h-4 w-4 mr-2" /> About Us
                      </Link>
                      {profile.is_admin && (
                        <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                          <User className="h-4 w-4 mr-2" /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Mobile: Show both avatar and menu icon side by side */}
              <div className="flex items-center space-x-2 sm:hidden">
                {user && profile && (
                  <button
                    className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center text-white font-bold text-base uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Open profile menu"
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    tabIndex={0}
                  >
                    {profile.full_name
                      ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
                      : (profile.email ? profile.email[0].toUpperCase() : '?')}
                  </button>
                )}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
              {/* If not logged in, show sign in on desktop, nothing on mobile */}
              {!user && (
                <button
                  onClick={onAuthClick}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 hidden sm:block"
                >
                  {loading ? 'Loading...' : t('auth.signin', 'Sign In')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden w-full max-w-full">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-full h-full bg-white dark:bg-gray-800 shadow-xl transition-colors max-w-full flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-base font-semibold text-gray-900 dark:text-white truncate">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-2 space-y-2 w-full max-w-full">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-5 py-3 rounded-full text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="truncate break-words max-w-[120px]">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50"
          style={{ overscrollBehavior: 'contain' }}
        >
          <div
            className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl mx-4 my-8 p-0 overflow-y-auto max-h-[90vh]"
            style={{ boxSizing: 'border-box' }}
          >
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full p-1 focus:outline-none z-10"
              aria-label="Close profile modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-4 sm:p-6">
              <Profile />
            </div>
          </div>
        </div>
      )}

      {/* Profile Dropdown for mobile (avatar click) */}
      {profileMenuOpen && user && profile && (
        <div className="fixed inset-0 z-50 sm:hidden flex items-end justify-end">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setProfileMenuOpen(false)} />
          <div className="absolute top-16 right-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 py-2 flex flex-col gap-1 profile-dropdown">
            <button
              onClick={() => { setShowProfileModal(true); setProfileMenuOpen(false); }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-left"
            >
              <User className="h-4 w-4 mr-2" /> Profile
            </button>
            {/* Theme sub-dropdown */}
            <div className="relative">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-left"
                onClick={() => setOpenSubDropdown(openSubDropdown === 'theme' ? null : 'theme')}
              >
                <User className="h-4 w-4 mr-2" /> Theme
              </button>
              {openSubDropdown === 'theme' && (
                <div className="mt-1 ml-4"><ThemeToggle inline /></div>
              )}
            </div>
            {/* Language sub-dropdown */}
            <div className="relative">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-left"
                onClick={() => setOpenSubDropdown(openSubDropdown === 'language' ? null : 'language')}
              >
                <User className="h-4 w-4 mr-2" /> Language
              </button>
              {openSubDropdown === 'language' && (
                <div className="mt-1 ml-4"><LanguageSwitcher /></div>
              )}
            </div>
            <Link to="/about" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              <User className="h-4 w-4 mr-2" /> About Us
            </Link>
            {profile.is_admin && (
              <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                <User className="h-4 w-4 mr-2" /> Admin Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4 mr-2" /> Log Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 w-full max-w-full">
        <div className="flex flex-col lg:flex-row gap-4 w-full max-w-full min-w-0">
          {/* Main Feed */}
          <div className="w-full min-w-0 max-w-full">
            {/* Shrink main feed width for HomePage and similar pages */}
            <div className="max-w-2xl mx-auto">
              {children}
            </div>
          </div>
          {/* Sidebar (hidden on mobile) */}
          <aside className="hidden lg:block w-full lg:w-1/4 min-w-0 max-w-xs mx-auto">
            <LatestNewsSidebar />
            {/* Insert NewsFeedStatus here with spacing */}
            <div className="mb-6">
              <NewsFeedStatus />
            </div>
            <CricketScoreWidget />
            <AdsWidget />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;