import React, { useState } from 'react';
import { X, Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES, getGNewsSupportedLanguages } from '../lib/languages';

const LanguageSelector: React.FC = () => {
  const { 
    currentLanguage, 
    setLanguage, 
    showLanguageSelector, 
    setShowLanguageSelector 
  } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyGNewsSupported, setShowOnlyGNewsSupported] = useState(false);

  if (!showLanguageSelector) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => {
    const matchesSearch = lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !showOnlyGNewsSupported || lang.gNewsSupported;
    return matchesSearch && matchesFilter;
  });

  const gNewsSupported = getGNewsSupportedLanguages();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Choose Your Language
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select your preferred language for news content
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLanguageSelector(false)}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
            <input
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showOnlyGNewsSupported}
                  onChange={(e) => setShowOnlyGNewsSupported(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show only native news languages ({gNewsSupported.length})
                </span>
              </label>
            </div>
          </div>

          {/* Language List */}
          <div className="overflow-y-auto max-h-96">
            <div className="p-4 space-y-2">
              {filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => setLanguage(language.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    currentLanguage.code === language.code
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{language.flag}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {language.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {language.nativeName}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!language.gNewsSupported && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded-full">
                        Translated
                      </span>
                    )}
                    {currentLanguage.code === language.code && (
                      <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                <strong>Native:</strong> News fetched directly in your language from GNews
              </p>
              <p>
                <strong>Translated:</strong> English news translated using AI-powered Lingo.dev
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;