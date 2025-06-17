import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import { useAuth } from '../contexts/AuthContext';

const NewsFeedStatus: React.FC = () => {
  const { articles, loading, refreshNews } = useNews();
  const { profile } = useAuth();
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [nextFetch, setNextFetch] = useState<string | null>(null);

  useEffect(() => {
    // Simulate last fetch time (in real app, this would come from API)
    const now = new Date();
    const lastFetchTime = new Date(now.getTime() - Math.random() * 30 * 60 * 1000); // Random time within last 30 minutes
    setLastFetch(lastFetchTime.toISOString());

    // Calculate next fetch (30 minutes from last fetch)
    const nextFetchTime = new Date(lastFetchTime.getTime() + 30 * 60 * 1000);
    setNextFetch(nextFetchTime.toISOString());
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatTimeUntil = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 0) return 'Overdue';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    return `${Math.floor(diffInMinutes / 60)}h ${diffInMinutes % 60}m`;
  };

  const recentArticles = articles.filter(article => {
    const articleDate = new Date(article.created_at);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return articleDate > oneDayAgo;
  });

  const breakingNews = articles.filter(article => article.is_breaking);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">News Feed Status</h3>
        <button
          onClick={refreshNews}
          disabled={loading}
          className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Total Articles */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-400">Total Articles</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{articles.length}</div>
        </div>

        {/* Recent Articles (24h) */}
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-400">Last 24h</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{recentArticles.length}</div>
        </div>

        {/* Breaking News */}
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-900 dark:text-red-400">Breaking</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{breakingNews.length}</div>
        </div>
      </div>

      {/* Fetch Status */}
      <div className="space-y-2">
        {lastFetch && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Last update:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatTimeAgo(lastFetch)}
            </span>
          </div>
        )}

        {nextFetch && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Next update:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatTimeUntil(nextFetch)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Auto-fetch:</span>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-green-600">Active</span>
          </div>
        </div>
      </div>

      {/* Admin Quick Actions */}
      {profile?.is_admin && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Admin:</span>
            <button
              onClick={() => window.location.href = '/admin'}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Manage News Feed
            </button>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="mt-4 flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">System operational</span>
        </div>
        {loading && (
          <div className="flex items-center space-x-1">
            <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
            <span className="text-xs text-blue-600">Updating...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeedStatus;