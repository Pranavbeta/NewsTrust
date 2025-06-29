import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Language, 
  SUPPORTED_LANGUAGES, 
  getUserPreferredLanguage, 
  setUserPreferredLanguage,
  getLanguageByCode 
} from '../lib/languages';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (languageCode: string) => void;
  isGNewsSupported: boolean;
  needsTranslation: boolean;
  showLanguageSelector: boolean;
  setShowLanguageSelector: (show: boolean) => void;
  showLanguagePrompt: boolean;
  setShowLanguagePrompt: (show: boolean) => void;
  saveLanguageToProfile: (languageCode: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const preferredCode = getUserPreferredLanguage();
    return getLanguageByCode(preferredCode) || SUPPORTED_LANGUAGES[0];
  });
  
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showLanguagePrompt, setShowLanguagePrompt] = useState(() => {
    // Show language prompt on first visit if browser language is not English
    const hasSeenPrompt = localStorage.getItem('newsverify_language_prompt_seen');
    const browserLang = navigator.language.split('-')[0];
    return !hasSeenPrompt && browserLang !== 'en';
  });

  const setLanguage = (languageCode: string) => {
    const language = getLanguageByCode(languageCode);
    if (language) {
      setCurrentLanguage(language);
      setUserPreferredLanguage(languageCode);
      setShowLanguageSelector(false);
      setShowLanguagePrompt(false);
      
      // Mark that user has seen the language prompt
      localStorage.setItem('newsverify_language_prompt_seen', 'true');
      
      // Update document direction for RTL languages
      document.documentElement.dir = language.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = language.code;

      // Save to user profile if logged in
      saveLanguageToProfile(languageCode);
    }
  };

  const saveLanguageToProfile = async (languageCode: string) => {
    try {
      // This would save to Supabase user profile in a real implementation
      // For now, we just use localStorage
      localStorage.setItem('newsverify_user_language', languageCode);
    } catch (error) {
      console.warn('Failed to save language to profile:', error);
    }
  };

  useEffect(() => {
    // Set initial document properties
    document.documentElement.dir = currentLanguage.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage]);

  const isGNewsSupported = currentLanguage.gNewsSupported;
  const needsTranslation = currentLanguage.code !== 'en';

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      isGNewsSupported,
      needsTranslation,
      showLanguageSelector,
      setShowLanguageSelector,
      showLanguagePrompt,
      setShowLanguagePrompt,
      saveLanguageToProfile,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};