import React, { useMemo } from 'react';
import { RefreshCw, Filter, Zap, TrendingUp } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import { useAuth } from '../contexts/AuthContext';
import NewsCard from '../components/NewsCard';
import CategoryTabs from '../components/CategoryTabs';
import NewsFeedStatus from '../components/NewsFeedStatus';

const HomePage: React.FC = () => {
  const { articles, selectedCategory, loading, refreshNews } = useNews();
  const { user } = useAuth();

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">News Verification Hub</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Community-driven news verification across 85+ languages
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {!user && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">Join the Community</h3>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              Sign in to vote on news authenticity, submit articles for verification, and join discussions 
              with our global community of fact-checkers.
            </p>
          </div>
        )}
      </div>

      {/* Breaking News Banner */}
      {breakingNews.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">Breaking News</h2>
          </div>
          <div className="space-y-2">
            {breakingNews.map((article) => (
              <div key={article.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-400 text-sm">
                    {article.title}
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-xs">
                    {article.source} • {new Date(article.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Feed Status */}
      <NewsFeedStatus />

      {/* Category Tabs */}
      <CategoryTabs />

      {/* News Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {selectedCategory === 'all' ? 'All News' : 
             selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Feed
          </h2>
          <div className="flex items-center space-x-4">
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
          <div className="space-y-6">
            {filteredArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Filter className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
