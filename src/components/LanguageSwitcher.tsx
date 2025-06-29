import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../lib/languages';

const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, setLanguage, setShowLanguageSelector } = useLanguage();

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  const popularLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'hi'].includes(lang.code)
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:block">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <span className="sm:hidden">{currentLanguage.flag}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-20">
            <div className="py-1">
              {/* Current Language */}
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Current
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span>{currentLanguage.flag}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currentLanguage.name}
                  </span>
                  {!currentLanguage.gNewsSupported && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-1 py-0.5 rounded">
                      Translated
                    </span>
                  )}
                </div>
              </div>

              {/* Popular Languages */}
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Popular
                </div>
                <div className="space-y-1">
                  {popularLanguages.slice(0, 6).map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`flex items-center space-x-2 w-full px-2 py-1 text-sm text-left rounded transition-colors ${
                        currentLanguage.code === language.code
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* View All Languages */}
              <div className="px-4 py-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowLanguageSelector(true);
                  }}
                  className="flex items-center space-x-2 w-full px-2 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>View all {SUPPORTED_LANGUAGES.length} languages</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;