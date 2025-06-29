import React, { useState } from 'react';
import { 
  RefreshCw, 
  Database, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  Globe,
  Zap,
  Play,
  ExternalLink
} from 'lucide-react';
import { useNewsAPI } from '../hooks/useNewsAPI';
import { useAuth } from '../contexts/AuthContext';

const NewsAPIStatus: React.FC = () => {
  const { profile } = useAuth();
  const { 
    stats, 
    fetchLogs, 
    loading, 
    error, 
    triggerNewsFetch, 
    refreshStats, 
    refreshLogs 
  } = useNewsAPI();
  const [triggering, setTriggering] = useState(false);

  const handleTriggerFetch = async () => {
    setTriggering(true);
    try {
      await triggerNewsFetch();
    } catch (error) {
      console.error('Failed to trigger fetch:', error);
    } finally {
      setTriggering(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refreshStats(), refreshLogs()]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  if (!profile?.is_admin) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">News API Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">External news feed integration</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleTriggerFetch}
            disabled={triggering}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors"
          >
            {triggering ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{triggering ? 'Fetching...' : 'Fetch Now'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalArticles.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Breaking News</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {stats.breakingNewsCount}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Languages</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(stats.articlesByLanguage).length}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.articlesByStatus.valid || 0}
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {stats && Object.keys(stats.articlesByCategory).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Articles by Category</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {Object.entries(stats.articlesByCategory).map(([category, count]) => (
              <div key={category} className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{count}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">{category}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Fetch Logs */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Fetch Logs</h4>
        <div className="space-y-2">
          {fetchLogs.length > 0 ? (
            fetchLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(log.success)}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {log.source_api} - {log.articles_inserted} articles inserted
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Processed: {log.articles_processed} | {formatDate(log.created_at)}
                    </div>
                    {log.error_message && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Error: {log.error_message}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(log.created_at)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No fetch logs available
            </div>
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-2">Setup Status</h4>
        <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>API keys configured in Supabase Edge Function secrets</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Database tables and functions created</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span>Set up cron job for automatic fetching every 30 minutes</span>
          </div>
          <div className="mt-3">
            <a 
              href="https://supabase.com/docs/guides/database/functions#scheduling-functions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Learn about setting up cron jobs</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsAPIStatus;