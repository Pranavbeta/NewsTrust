// Performance optimization utilities

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private observers: Map<string, PerformanceObserver> = new Map();
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Initialize performance monitoring
  init() {
    this.setupLCPMonitoring();
    this.setupFIDMonitoring();
    this.setupCLSMonitoring();
    this.setupResourceMonitoring();
    this.setupLongTaskMonitoring();
  }

  private setupLCPMonitoring() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      this.metrics.set('lcp', lastEntry.startTime);
      
      // Log LCP element for debugging
      if (lastEntry.element) {
        console.log('LCP Element:', lastEntry.element);
        console.log('LCP Time:', lastEntry.startTime);
        
        // Report if LCP is poor
        if (lastEntry.startTime > 2500) {
          this.reportPerformanceIssue('lcp', {
            value: lastEntry.startTime,
            element: lastEntry.element.tagName,
            threshold: 2500,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.set('lcp', observer);
  }

  private setupFIDMonitoring() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        this.metrics.set('fid', entry.processingStart - entry.startTime);
        
        if (entry.processingStart - entry.startTime > 100) {
          this.reportPerformanceIssue('fid', {
            value: entry.processingStart - entry.startTime,
            threshold: 100,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.set('fid', observer);
  }

  private setupCLSMonitoring() {
    let clsValue = 0;
    let clsEntries: any[] = [];

    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      });

      this.metrics.set('cls', clsValue);
      
      if (clsValue > 0.1) {
        this.reportPerformanceIssue('cls', {
          value: clsValue,
          threshold: 0.1,
          entries: clsEntries,
        });
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.set('cls', observer);
  }

  private setupResourceMonitoring() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        // Monitor slow resources
        if (entry.duration > 1000) {
          this.reportPerformanceIssue('slow-resource', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            type: entry.initiatorType,
          });
        }

        // Monitor large resources
        if (entry.transferSize > 1024 * 1024) { // 1MB
          this.reportPerformanceIssue('large-resource', {
            name: entry.name,
            size: entry.transferSize,
            type: entry.initiatorType,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  private setupLongTaskMonitoring() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        this.reportPerformanceIssue('long-task', {
          duration: entry.duration,
          startTime: entry.startTime,
        });
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
    this.observers.set('longtask', observer);
  }

  private reportPerformanceIssue(type: string, data: any) {
    console.warn(`Performance Issue - ${type}:`, data);
    
    // In production, send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_issue', {
        event_category: 'Performance',
        event_label: type,
        value: Math.round(data.value || data.duration || 0),
      });
    }
  }

  // Get current metrics
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Image optimization utilities
export const optimizeImageUrl = (url: string, width?: number, quality = 80): string => {
  if (!url) return '';

  // Optimize Pexels images
  if (url.includes('pexels.com')) {
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();
    params.set('auto', 'compress');
    params.set('cs', 'tinysrgb');
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());
    return `${baseUrl}?${params.toString()}`;
  }

  // Optimize other image services
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());
    params.set('fm', 'webp');
    return `${url}?${params.toString()}`;
  }

  return url;
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' },
    { href: '/api/news/latest', as: 'fetch' },
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.as === 'font') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Lazy load non-critical resources
export const lazyLoadResource = (src: string, type: 'script' | 'style'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const element = type === 'script' 
      ? document.createElement('script')
      : document.createElement('link');

    element.onload = () => resolve();
    element.onerror = reject;

    if (type === 'script') {
      (element as HTMLScriptElement).src = src;
      (element as HTMLScriptElement).async = true;
    } else {
      (element as HTMLLinkElement).rel = 'stylesheet';
      (element as HTMLLinkElement).href = src;
    }

    document.head.appendChild(element);
  });
};