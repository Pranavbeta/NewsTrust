import React, { useState, useEffect } from 'react';
import { RefreshCw, Radio, Filter, MapPin, Clock, Zap } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import NewsCard from '../components/NewsCard';

interface LiveUpdate {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  region: string;
  category: string;
  isBreaking: boolean;
}

const RealTimeNews: React.FC = () => {
  const { articles, loading, refreshNews } = useNews();
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

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
    { id: 'breaking', name: 'Breaking News' },
    { id: 'politics', name: 'Politics' },
    { id: 'business', name: 'Business' },
    { id: 'conflicts', name: 'Conflicts' },
  ];

  useEffect(() => {
    // Simulate live updates
    const generateLiveUpdate = (): LiveUpdate => {
      const updates = [
        {
          title: 'Market Opens with Strong Gains',
          summary: 'Global markets show positive momentum in early trading.',
          source: 'Financial Times',
          region: 'us',
          category: 'business'
        },
        {
          title: 'Diplomatic Talks Resume in Geneva',
          summary: 'International mediators work toward conflict resolution.',
          source: 'Reuters',
          region: 'eu',
          category: 'politics'
        },
        {
          title: 'Emergency Response Teams Deployed',
          summary: 'Natural disaster response efforts underway in affected regions.',
          source: 'AP News',
          region: 'asia',
          category: 'breaking'
        }
      ];

      const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
      return {
        id: Date.now().toString(),
        ...randomUpdate,
        timestamp: new Date().toISOString(),
        isBreaking: Math.random() > 0.7
      };
    };

    const interval = setInterval(() => {
      if (autoRefresh) {
        setLiveUpdates(prev => [generateLiveUpdate(), ...prev.slice(0, 9)]);
      }
    }, 10000); // Update every 10 seconds

    // Initial updates
    setLiveUpdates([
      generateLiveUpdate(),
      generateLiveUpdate(),
      generateLiveUpdate()
    ]);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredUpdates = liveUpdates.filter(update => {
    const regionMatch = selectedRegion === 'all' || update.region === selectedRegion;
    const categoryMatch = selectedCategory === 'all' || update.category === selectedCategory;
    return regionMatch && categoryMatch;
  });

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
              {autoRefresh && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real-Time News</h1>
              <p className="text-gray-600">Live updates from global news sources</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-red-100 text-red-800 border border-red-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-red-500' : 'bg-gray-400'}`}></div>
              <span>{autoRefresh ? 'Live' : 'Paused'}</span>
            </button>
            
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
            <span className="text-sm font-normal text-gray-500">({filteredUpdates.length})</span>
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredUpdates.length > 0 ? (
            filteredUpdates.map((update) => (
              <div key={update.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {update.isBreaking && (
                        <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          <Zap className="h-3 w-3" />
                          <span>BREAKING</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-500 font-medium">{update.source}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {update.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-3">
                      {update.summary}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(update.timestamp)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{regions.find(r => r.id === update.region)?.name || update.region}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Radio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No live updates</h3>
              <p className="text-gray-600">
                No updates match your current filters. Try adjusting your region or category selection.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Regular News Feed */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Verified News</h2>
        
        {articles.slice(0, 5).map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default RealTimeNews;