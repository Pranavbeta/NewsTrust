// Enhanced performance monitoring for news verification system
(function() {
  'use strict';

  // Performance metrics storage
  const metrics = {
    verificationTimes: [],
    resourceLoadTimes: {},
    errors: [],
    longTasks: [],
    webVitals: {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null
    }
  };

  // Web Vitals monitoring
  function initWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.webVitals.lcp = lastEntry.startTime;
      
      if (lastEntry.startTime > 2500) {
        reportPerformanceIssue({
          type: 'poor_lcp',
          value: lastEntry.startTime,
          element: lastEntry.element?.tagName || 'unknown',
          threshold: 2500
        });
      }
    }).observe({entryTypes: ['largest-contentful-paint']});

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        metrics.webVitals.fid = fid;
        
        if (fid > 100) {
          reportPerformanceIssue({
            type: 'poor_fid',
            value: fid,
            threshold: 100
          });
        }
      });
    }).observe({entryTypes: ['first-input']});

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      metrics.webVitals.cls = clsValue;
      
      if (clsValue > 0.1) {
        reportPerformanceIssue({
          type: 'poor_cls',
          value: clsValue,
          threshold: 0.1
        });
      }
    }).observe({entryTypes: ['layout-shift']});

    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.webVitals.fcp = entry.startTime;
        }
      });
    }).observe({entryTypes: ['paint']});

    // Time to First Byte
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          metrics.webVitals.ttfb = entry.responseStart - entry.requestStart;
        }
      });
    }).observe({entryTypes: ['navigation']});
  }

  // Resource monitoring
  function initResourceMonitoring() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        // Track slow resources
        if (entry.duration > 1000) {
          reportPerformanceIssue({
            type: 'slow_resource',
            resource: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            resourceType: entry.initiatorType
          });
        }

        // Track large resources
        if (entry.transferSize > 1024 * 1024) { // 1MB
          reportPerformanceIssue({
            type: 'large_resource',
            resource: entry.name,
            size: entry.transferSize,
            resourceType: entry.initiatorType
          });
        }

        // Store resource timing
        metrics.resourceLoadTimes[entry.name] = {
          duration: entry.duration,
          size: entry.transferSize,
          type: entry.initiatorType,
          timestamp: Date.now()
        };
      });
    }).observe({entryTypes: ['resource']});
  }

  // Long task monitoring
  function initLongTaskMonitoring() {
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            metrics.longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
              timestamp: Date.now()
            });
            
            reportPerformanceIssue({
              type: 'long_task',
              duration: entry.duration,
              startTime: entry.startTime
            });
          });
        }).observe({entryTypes: ['longtask']});
      } catch (e) {
        console.warn('Long task observer not supported', e);
      }
    }
  }

  // Memory monitoring
  function initMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          reportPerformanceIssue({
            type: 'high_memory_usage',
            used: memory.usedJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Record verification time
  window.recordVerificationTime = function(duration) {
    metrics.verificationTimes.push({
      timestamp: Date.now(),
      duration: duration
    });
    
    // Log if verification takes too long
    if (duration > 5000) {
      reportPerformanceIssue({
        type: 'slow_verification',
        duration: duration,
        threshold: 5000
      });
    }
  };

  // Report performance issues
  function reportPerformanceIssue(issue) {
    console.warn('Performance issue detected:', issue);
    metrics.errors.push({
      ...issue,
      timestamp: Date.now()
    });
    
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_issue', {
        event_category: 'Performance',
        event_label: issue.type,
        value: Math.round(issue.value || issue.duration || 0)
      });
    }
  }

  // Image optimization helper
  window.optimizeImageUrl = function(url, width, quality = 80) {
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
    
    return url;
  };

  // Preload critical resources
  function preloadCriticalResources() {
    const criticalResources = [
      { href: '/api/news/latest', as: 'fetch' },
      { href: 'https://js.puter.com/v2/', as: 'script' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.as === 'script') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Initialize all monitoring
  function init() {
    initWebVitals();
    initResourceMonitoring();
    initLongTaskMonitoring();
    initMemoryMonitoring();
    preloadCriticalResources();
  }

  // Error handling
  window.addEventListener('error', function(event) {
    metrics.errors.push({
      type: 'javascript_error',
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: Date.now()
    });
  });

  window.addEventListener('unhandledrejection', function(event) {
    metrics.errors.push({
      type: 'promise_rejection',
      message: event.reason?.message || String(event.reason),
      timestamp: Date.now()
    });
  });

  // Expose metrics for debugging
  window.getPerformanceMetrics = function() {
    return {
      ...metrics,
      webVitals: metrics.webVitals,
      averageVerificationTime: metrics.verificationTimes.length > 0 
        ? metrics.verificationTimes.reduce((sum, item) => sum + item.duration, 0) / metrics.verificationTimes.length 
        : 0,
      totalErrors: metrics.errors.length,
      totalLongTasks: metrics.longTasks.length,
      resourceCount: Object.keys(metrics.resourceLoadTimes).length
    };
  };

  // Report metrics to console for debugging
  window.reportPerformanceMetrics = function() {
    const report = window.getPerformanceMetrics();
    console.group('📊 Performance Report');
    console.log('Web Vitals:', report.webVitals);
    console.log('Average Verification Time:', report.averageVerificationTime + 'ms');
    console.log('Total Errors:', report.totalErrors);
    console.log('Long Tasks:', report.totalLongTasks);
    console.log('Resources Loaded:', report.resourceCount);
    console.groupEnd();
    return report;
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('🚀 Enhanced performance monitoring initialized');
})();