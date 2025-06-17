import React from 'react';
import { RefreshCw, Globe, TrendingUp, AlertTriangle } from 'lucide-react';
import { useCountryNews } from '../contexts/CountryNewsContext';
import { useLanguage } from '../contexts/LanguageContext';
import CountrySelector from '../components/CountrySelector';
import EnhancedNewsCard from '../components/EnhancedNewsCard';

const CountryNews: React.FC = () => {
  const { selectedCountry, setSelectedCountry, articles, loading, error, refreshNews, translating } = useCountryNews();
  const { currentLanguage } = useLanguage();

  const handleCountryChange = (countryCode: string) => {
    const country = { code: countryCode, name: '', flag: '' }; // This will be properly resolved in the selector
    // The actual country object will be set by the CountrySelector component
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Country-Specific News</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Top headlines from {selectedCountry.flag} {selectedCountry.name}
              </p>
              {currentLanguage.code !== 'en' && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {currentLanguage.flag} Content translated to {currentLanguage.name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CountrySelector onCountryChange={handleCountryChange} />
            <button
              onClick={refreshNews}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Translation Status */}
        {translating && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-blue-800 dark:text-blue-400">
                Translating content to {currentLanguage.name}...
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Country</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCountry.flag} {selectedCountry.name}
              </p>
            </div>
            <Globe className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Language</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentLanguage.flag} {currentLanguage.name}
              </p>
            </div>
            <div className="text-2xl">{currentLanguage.flag}</div>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Latest from {selectedCountry.name}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {articles.length} articles
          </span>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse transition-colors">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-4"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="space-y-6">
            {articles.map((article) => (
              <EnhancedNewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No articles available for {selectedCountry.name}. Try refreshing or selecting a different country.
            </p>
            <button
              onClick={refreshNews}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Refresh Feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryNews;