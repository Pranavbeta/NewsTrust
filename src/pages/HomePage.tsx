import React, { useMemo } from 'react';
import { RefreshCw, Filter, Zap, TrendingUp } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import EnhancedNewsCard from '../components/EnhancedNewsCard';
import CategoryTabs from '../components/CategoryTabs';

const HomePage: React.FC = () => {
  const { articles, selectedCategory, loading, refreshNews } = useNews();
  const { user } = useAuth();
  const { actualTheme } = useTheme();

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'all') return articles;
    return articles.filter(article => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  const breakingNews = useMemo(() => {
    return articles.filter(article => article.is_breaking).slice(0, 3);
  }, [articles]);

  const handleRefresh = () => {
    refreshNews();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-0">
      {/* Breaking News Ticker (between header and category tabs) */}
      {breakingNews.length > 0 && (
        <div className="relative overflow-hidden w-full my-2">
          <div className="bg-red-600 py-2 w-full">
            <div className="ticker-tape flex items-center space-x-8 animate-ticker">
              {breakingNews.map((article, idx) => (
                <div key={article.id || idx} className="flex items-center space-x-3 min-w-max">
                  <span className="bg-white text-red-600 font-bold px-3 py-1 rounded-full text-xs mr-2">Breaking News</span>
                  <span className="text-white font-semibold text-sm">{article.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="-mx-2 sm:mx-0">
        <CategoryTabs />
      </div>

      {/* Bolt Badge - just below title and navbar */}
      <div className="flex justify-center my-2">
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          title="Powered by Bolt"
        >
          <img
            src={actualTheme === 'dark' ? '/white_circle_360x360.png' : '/black_circle_360x360.png'}
            alt="Bolt Badge"
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
            style={{ objectFit: 'cover' }}
          />
        </a>
      </div>

      {/* News Feed */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {selectedCategory === 'all' ? 'All News' : 
             selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Feed
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Filter className="h-4 w-4" />
              <span>{filteredArticles.length} articles</span>
            </div>
            {articles.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>Live updates</span>
              </div>
            )}
          </div>
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
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <EnhancedNewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Filter className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No articles available for the selected category. Try switching to a different category or refresh the feed.
            </p>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Refresh Feed
            </button>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {articles.reduce((sum, article) =>
                sum +
                (article.votes?.valid ?? 0) +
                (article.votes?.fake ?? 0) +
                (article.votes?.not_sure ?? 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Votes Cast</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {articles.filter(article => article.admin_status === 'valid').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Verified Articles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {articles.filter(article => article.admin_status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Under Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {articles.filter(article => article.is_breaking).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Breaking News</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
