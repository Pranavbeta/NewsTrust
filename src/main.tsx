import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PerformanceOptimizer, preloadCriticalResources } from './utils/performanceOptimizer';

// Initialize performance monitoring
const performanceOptimizer = PerformanceOptimizer.getInstance();
performanceOptimizer.init();

// Preload critical resources
preloadCriticalResources();

// Optimize initial render
const rootElement = document.getElementById('root')!;

// Remove loading skeleton
const loadingSkeleton = rootElement.querySelector('.loading-skeleton')?.parentElement;
if (loadingSkeleton) {
  loadingSkeleton.remove();
}

// Create root with concurrent features
const root = createRoot(rootElement, {
  // Enable concurrent features for better performance
  identifierPrefix: 'newsverify-',
});

// Render app with performance optimizations
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Report initial performance metrics
setTimeout(() => {
  const metrics = performanceOptimizer.getMetrics();
  console.log('Initial Performance Metrics:', metrics);
  
  // Report to analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    Object.entries(metrics).forEach(([key, value]) => {
      (window as any).gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: key,
        value: Math.round(value),
      });
    });
  }
}, 1000);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  performanceOptimizer.cleanup();
});