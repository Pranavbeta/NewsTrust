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
    <div className="space-y-6 max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6 transition-colors">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Country News</h1>
            <CountrySelector onCountryChange={handleCountryChange} />
      </div>
      {/* News Feed */}
      <div className="space-y-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {articles.map((article) => {
              // Map CountryNewsArticle to NewsArticle shape
              const mappedArticle = {
                id: article.id,
                title: article.title,
                summary: article.summary,
                content: article.content,
                source: article.source,
                source_url: article.source_url,
                category: article.category,
                language: article.language,
                location: article.location,
                image_url: article.image_url,
                admin_status: (article as any).admin_status || 'pending',
                is_breaking: (article as any).is_breaking || false,
                created_at: article.created_at,
                updated_at: (article as any).updated_at || article.created_at,
                votes: article.votes || { valid: 0, fake: 0, not_sure: 0 },
                user_vote: article.user_vote || null,
                // Optionally pass through translation fields if present
                originalTitle: (article as any).originalTitle,
                originalSummary: (article as any).originalSummary,
                isTranslated: (article as any).isTranslated,
                translatedLanguage: (article as any).translatedLanguage,
                translationService: (article as any).translationService,
              };
              return <EnhancedNewsCard key={mappedArticle.id} article={mappedArticle} />;
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <span className="inline-block w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No articles available for the selected country. Try switching to a different country or refresh the feed.
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