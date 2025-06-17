import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface NewsStats {
  totalArticles: number;
  articlesByCategory: Record<string, number>;
  articlesByLanguage: Record<string, number>;
  articlesByStatus: Record<string, number>;
  breakingNewsCount: number;
}

interface FetchLog {
  id: string;
  source_api: string;
  articles_processed: number;
  articles_inserted: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export const useNewsAPI = () => {
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [fetchLogs, setFetchLogs] = useState<FetchLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsStats = async () => {
    try {
      setError(null);
      
      // Try to call the RPC function
      const { data, error } = await supabase.rpc('get_news_stats');
      
      if (error) {
        console.error('RPC Error:', error);
        // Fallback to manual queries if RPC fails
        return await fetchStatsManually();
      }
      
      if (data && data.length > 0) {
        const statsData = data[0];
        setStats({
          totalArticles: Number(statsData.total_articles) || 0,
          articlesByCategory: statsData.articles_by_category || {},
          articlesByLanguage: statsData.articles_by_language || {},
          articlesByStatus: statsData.articles_by_status || {},
          breakingNewsCount: Number(statsData.breaking_news_count) || 0,
        });
      } else {
        // If no data, set empty stats
        setStats({
          totalArticles: 0,
          articlesByCategory: {},
          articlesByLanguage: {},
          articlesByStatus: {},
          breakingNewsCount: 0,
        });
      }
    } catch (err) {
      console.error('Error fetching news stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      // Try fallback method
      await fetchStatsManually();
    }
  };

  const fetchStatsManually = async () => {
    try {
      // Manual fallback queries
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('category, language, admin_status, is_breaking');

      if (newsError) throw newsError;

      const articles = newsData || [];
      
      // Calculate stats manually
      const categoryStats: Record<string, number> = {};
      const languageStats: Record<string, number> = {};
      const statusStats: Record<string, number> = {};
      let breakingCount = 0;

      articles.forEach(article => {
        // Category stats
        categoryStats[article.category] = (categoryStats[article.category] || 0) + 1;
        
        // Language stats
        languageStats[article.language] = (languageStats[article.language] || 0) + 1;
        
        // Status stats
        statusStats[article.admin_status] = (statusStats[article.admin_status] || 0) + 1;
        
        // Breaking news count
        if (article.is_breaking) breakingCount++;
      });

      setStats({
        totalArticles: articles.length,
        articlesByCategory: categoryStats,
        articlesByLanguage: languageStats,
        articlesByStatus: statusStats,
        breakingNewsCount: breakingCount,
      });
    } catch (err) {
      console.error('Manual stats fetch failed:', err);
      setError('Failed to fetch statistics');
    }
  };

  const fetchLogsData = async () => {
    try {
      const { data, error } = await supabase
        .from('news_fetch_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }
      
      setFetchLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const triggerNewsFetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing. Please check your environment variables.');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/fetch-news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manual: true }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to fetch news';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Refresh stats and logs
      await Promise.all([fetchNewsStats(), fetchLogsData()]);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger news fetch';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const setupScheduledFetch = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/schedule-news-fetch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to setup scheduled fetch');
      }

      return await response.json();
    } catch (err) {
      console.error('Error setting up scheduled fetch:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchNewsStats();
    fetchLogsData();
  }, []);

  return {
    stats,
    fetchLogs,
    loading,
    error,
    triggerNewsFetch,
    setupScheduledFetch,
    refreshStats: fetchNewsStats,
    refreshLogs: fetchLogsData,
  };
};