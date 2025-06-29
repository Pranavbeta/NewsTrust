import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RealTimeNews from './pages/RealTimeNews';
import ChatValidator from './pages/ChatValidator';
import SubmitNews from './pages/SubmitNews';
import LocalNews from './pages/LocalNews';
import CountryNews from './pages/CountryNews';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import AuthModal from './components/AuthModal';
import LanguageSelector from './components/LanguageSelector';
import LanguagePrompt from './components/LanguagePrompt';
import { AuthProvider } from './contexts/AuthContext';
import { NewsProvider } from './contexts/NewsContext';
import { CountryNewsProvider } from './contexts/CountryNewsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AboutUs from './pages/AboutUs';
import './index.css';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NewsProvider>
            <CountryNewsProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                  <Layout onAuthClick={() => setShowAuthModal(true)}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/real-time" element={<RealTimeNews />} />
                      <Route path="/validator" element={<ChatValidator />} />
                      <Route path="/submit" element={<SubmitNews />} />
                      <Route path="/local" element={<LocalNews />} />
                      <Route path="/country" element={<CountryNews />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/about" element={<AboutUs />} />
                    </Routes>
                  </Layout>
                  
                  {showAuthModal && (
                    <AuthModal onClose={() => setShowAuthModal(false)} />
                  )}
                  
                  <LanguagePrompt />
                  <LanguageSelector />
                </div>
              </Router>
            </CountryNewsProvider>
          </NewsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;