import React from 'react';
import { Globe, X, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../lib/languages';

const LanguagePrompt: React.FC = () => {
  const { 
    currentLanguage, 
    setLanguage, 
    showLanguagePrompt, 
    setShowLanguagePrompt 
  } = useLanguage(); 

  if (!showLanguagePrompt) return null;

  // Detect browser language and suggest it
  const browserLang = navigator.language.split('-')[0];
  const suggestedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
  
  // Popular languages to show as quick options
  const popularLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    ['es', 'fr', 'de', 'zh', 'ja', 'ar', 'hi', 'pt'].includes(lang.code)
  ).slice(0, 6);

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
  };

  const handleDismiss = () => {
    setShowLanguagePrompt(false);
    localStorage.setItem('newsverify_language_prompt_seen', 'true');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Choose Your Language
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get news in your preferred language
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Browser Language Suggestion */}
            {suggestedLanguage && suggestedLanguage.code !== 'en' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{suggestedLanguage.flag}</span>
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-400">
                        {suggestedLanguage.name}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        Detected from your browser
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLanguageSelect(suggestedLanguage.code)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Use This
                  </button>
                </div>
              </div>
            )}

            {/* Popular Languages */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Popular Languages
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {popularLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    className={`flex items-center space-x-2 p-3 rounded-lg text-left transition-colors border ${
                      currentLanguage.code === language.code
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {language.name}
                      </div>
                      {!language.gNewsSupported && (
                        <div className="text-xs text-yellow-600 dark:text-yellow-400">
                          Translated
                        </div>
                      )}
                    </div>
                    {currentLanguage.code === language.code && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* English Option */}
            <div>
              <button
                onClick={() => handleLanguageSelect('en')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors border ${
                  currentLanguage.code === 'en'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-lg">🇺🇸</span>
                <div className="flex-1">
                  <div className="font-medium">English</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Original language
                  </div>
                </div>
                {currentLanguage.code === 'en' && (
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            </div>

            {/* More Languages Link */}
            <div className="text-center">
              <button
                onClick={() => {
                  setShowLanguagePrompt(false);
                  // setShowLanguageSelector(true); // Removed: not defined in context
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View all {SUPPORTED_LANGUAGES.length} languages
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
              You can change your language anytime from the language selector
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguagePrompt;