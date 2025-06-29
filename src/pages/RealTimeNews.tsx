import React, { useState, useEffect } from 'react';
import { RefreshCw, Radio, Filter, MapPin, Clock, Zap } from 'lucide-react';
import EnhancedNewsCard from '../components/EnhancedNewsCard';

const REGION_COUNTRY_MAP: Record<string, string[]> = {
  all: [],
  us: ['us'],
  eu: ['gb', 'de', 'fr', 'it', 'es', 'nl', 'be', 'pl', 'se', 'no', 'fi', 'dk', 'ie', 'pt', 'gr', 'cz', 'at', 'ch', 'hu', 'ro', 'bg', 'sk', 'si', 'hr', 'lt', 'lv', 'ee', 'lu', 'mt', 'cy'],
  asia: ['in', 'jp', 'cn', 'kr'],
  africa: ['ng', 'eg', 'za', 'dz', 'ma', 'ke'],
  americas: ['us', 'ca', 'mx', 'br'],
};

const regions = [
  { id: 'all', name: 'All Regions', flag: '🌍' },
  { id: 'us', name: 'United States', flag: '🇺🇸' },
  { id: 'eu', name: 'Europe', flag: '🇪🇺' },
  { id: 'asia', name: 'Asia', flag: '🌏' },
  { id: 'africa', name: 'Africa', flag: '🌍' },
  { id: 'americas', name: 'Americas', flag: '🌎' },
];

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'politics', name: 'Politics' },
  { id: 'business', name: 'Business' },
  { id: 'sports', name: 'Sports' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'science', name: 'Science' },
  { id: 'tech', name: 'Tech' },
  { id: 'general', name: 'General' },
];

const COUNTRY_NEWS_ENDPOINT = 'https://jgaiopkkcplaewibqwaf.supabase.co/functions/v1/country-news';

const RealTimeNews: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch(COUNTRY_NEWS_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (e) {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // No interval, no auto-refresh!
  }, []);

  // Filtering logic
  const filteredArticles = articles.filter(article => {
    // Region filter
    if (selectedRegion !== 'all') {
      const regionCountries = REGION_COUNTRY_MAP[selectedRegion] || [];
      if (!regionCountries.includes(article.country_code)) return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && article.category !== selectedCategory) return false;
    return true;
  });

  // Deduplicate by title + published_at (or created_at as fallback)
  const dedupedArticles: typeof articles = [];
  const seen = new Set();
  for (const article of filteredArticles) {
    const key = `${article.title}|${article.published_at || article.created_at}`;
    if (!seen.has(key)) {
      seen.add(key);
      dedupedArticles.push(article);
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Radio className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real-Time News</h1>
              <p className="text-gray-600">Live updates from global news sources</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchArticles}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.flag} {region.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Live Updates Feed */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Live Updates</span>
            <span className="text-sm font-normal text-gray-500">({dedupedArticles.length})</span>
          </h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading live updates...</h3>
            </div>
          ) : dedupedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dedupedArticles.map((article) => (
                <EnhancedNewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No live updates</h3>
              <p className="text-gray-600">
                No updates match your current filters. Try adjusting your region or category selection.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Recent News Feed */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Verified News</h2>
        {dedupedArticles.slice(0, 5).map((article) => (
          <EnhancedNewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default RealTimeNews;