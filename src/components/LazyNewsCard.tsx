import React, { lazy, Suspense } from 'react';
import { NewsArticle } from '../contexts/NewsContext';

// Lazy load the heavy NewsCard component
const NewsCard = lazy(() => import('./NewsCard'));

interface LazyNewsCardProps {
  article: NewsArticle;
}

const NewsCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
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
);

const LazyNewsCard: React.FC<LazyNewsCardProps> = ({ article }) => {
  return (
    <Suspense fallback={<NewsCardSkeleton />}>
      <NewsCard article={article} />
    </Suspense>
  );
};

export default LazyNewsCard;