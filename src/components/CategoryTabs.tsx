import React from 'react';
import { Building, Users, Trophy, Film, Home, Zap, Atom, Cpu } from 'lucide-react';
import { NewsCategory, useNews } from '../contexts/NewsContext';

const categories = [
  { id: 'all' as NewsCategory, name: 'All', icon: Home },
  { id: 'politics' as NewsCategory, name: 'Politics', icon: Building },
  { id: 'business' as NewsCategory, name: 'Business', icon: Users },
  { id: 'sports' as NewsCategory, name: 'Sports', icon: Trophy },
  { id: 'entertainment' as NewsCategory, name: 'Entertainment', icon: Film },
  { id: 'science' as NewsCategory, name: 'Science', icon: Atom },
  { id: 'tech' as NewsCategory, name: 'Tech', icon: Cpu },
  { id: 'trending' as NewsCategory, name: 'Trending', icon: Zap },
];

const CategoryTabs: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useNews();

  return (
    <div className="bg-gray-100 dark:bg-gray-900 sticky top-16 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide py-2 w-full max-w-full min-w-0">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md font-bold dark:bg-blue-500 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-200 dark:hover:bg-gray-800'}
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate max-w-[60px]">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;