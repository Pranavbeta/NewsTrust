import React from 'react';
import { Building, Users, Trophy, Film, AlertTriangle, Home } from 'lucide-react';
import { NewsCategory, useNews } from '../contexts/NewsContext';

const categories = [
  { id: 'all' as NewsCategory, name: 'All', icon: Home },
  { id: 'politics' as NewsCategory, name: 'Politics', icon: Building },
  { id: 'business' as NewsCategory, name: 'Business', icon: Users },
  { id: 'sports' as NewsCategory, name: 'Sports', icon: Trophy },
  { id: 'entertainment' as NewsCategory, name: 'Entertainment', icon: Film },
  { id: 'conflicts' as NewsCategory, name: 'Conflicts', icon: AlertTriangle },
];

const CategoryTabs: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useNews();

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide py-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;