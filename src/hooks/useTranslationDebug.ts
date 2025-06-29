import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { brandVoiceTranslation } from '../lib/brandVoiceTranslation';

// Debug configuration
const DEBUG_MODE = process.env.NODE_ENV === 'development';
const RENDER_WARNING_THRESHOLD = 5;
const RENDER_CRITICAL_THRESHOLD = 15;

/**
 * Debug monitor hook to track render counts and performance
 */
function useDebugMonitor(hookName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());
  const renderTimes = useRef<number[]>([]);

  if (DEBUG_MODE) {
    renderCount.current++;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    renderTimes.current.push(timeSinceLastRender);
    lastRenderTime.current = now;
    
    // Only keep the last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }
    
    useEffect(() => {
      const elapsed = performance.now() - startTime.current;
      const avgRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;
      
      console.group(`🔍 ${hookName} Debug Info (Render #${renderCount.current})`);
      console.log(`Total time elapsed: ${elapsed.toFixed(2)}ms`);
      console.log(`Average render time: ${avgRenderTime.toFixed(2)}ms`);
      
      if (renderCount.current > RENDER_CRITICAL_THRESHOLD) {
        console.error(`🚨 CRITICAL: ${renderCount.current} renders detected! Infinite loop likely!`);
        console.trace('Render stack trace:');
      } else if (renderCount.current > RENDER_WARNING_THRESHOLD) {
        console.warn(`⚠️ WARNING: ${renderCount.current} renders detected! Possible performance issue.`);
      }
      
      console.groupEnd();
      
      return () => {
        // This cleanup function runs before the next effect execution
        // We don't reset startTime here to track total elapsed time
      };
    });
  }

  return {
    renderCount: renderCount.current,
    resetRenderCount: () => {
      renderCount.current = 0;
      startTime.current = performance.now();
      lastRenderTime.current = performance.now();
      renderTimes.current = [];
    }
  };
}

/**
 * Track dependency changes to identify what's causing re-renders
 */
function trackDependencyChanges(deps: any[], depsNames: string[]) {
  const prevDeps = useRef<any[]>([]);
  
  useEffect(() => {
    if (DEBUG_MODE) {
      const changedDeps: {name: string, from: any, to: any}[] = [];
      
      deps.forEach((dep, index) => {
        if (prevDeps.current.length > 0 && !Object.is(dep, prevDeps.current[index])) {
          changedDeps.push({
            name: depsNames[index],
            from: prevDeps.current[index],
            to: dep
          });
        }
      });
      
      if (changedDeps.length > 0) {
        console.group('📊 Dependency Changes Detected');
        changedDeps.forEach(change => {
          console.log(`"${change.name}" changed:`, {
            from: change.from,
            to: change.to,
            isObject: typeof change.to === 'object' && change.to !== null,
            isFunction: typeof change.to === 'function'
          });
        });
        console.groupEnd();
      }
      
      prevDeps.current = [...deps];
    }
  });
}

/**
 * Memoization helper to prevent unnecessary re-renders
 */
function useMemoizedCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
}

interface UseTranslationOptions {
  context?: string;
  fallbackToKey?: boolean;
}

/**
 * Enhanced useTranslation hook with debugging capabilities
 */
function useTranslationDebug(options: UseTranslationOptions = {}) {
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const translationsRef = useRef<Record<string, string>>({});
  const pendingTranslationsRef = useRef<Set<string>>(new Set());
  const batchTimeoutRef = useRef<number | null>(null);
  
  // Debug monitoring
  const { renderCount, resetRenderCount } = useDebugMonitor('useTranslationDebug');
  
  // Track dependencies that might cause re-renders
  trackDependencyChanges(
    [currentLanguage, loading, Object.keys(translations).length],
    ['currentLanguage', 'loading', 'translationsCount']
  );

  // Memoize the translation function to prevent it from causing re-renders
  const t = useMemoizedCallback((key: string, fallbackText?: string): string => {
    // Use ref for latest translations to avoid dependency on translations state
    if (translationsRef.current[key]) {
      return translationsRef.current[key];
    }

    // Queue this key for translation if not already pending and not in English
    if (currentLanguage.code !== 'en' && !pendingTranslationsRef.current.has(key)) {
      pendingTranslationsRef.current.add(key);
      
      // Schedule batch translation
      if (batchTimeoutRef.current === null) {
        batchTimeoutRef.current = window.setTimeout(() => {
          processPendingTranslations();
          batchTimeoutRef.current = null;
        }, 100); // Batch translations with a small delay
      }
    }

    // Return fallback text or key
    return fallbackText || (options.fallbackToKey ? key : key.split('.').pop() || key);
  }, [currentLanguage.code, options.fallbackToKey]);

  // Process pending translations in batches
  const processPendingTranslations = async () => {
    if (pendingTranslationsRef.current.size === 0 || currentLanguage.code === 'en') {
      return;
    }

    const pendingKeys = Array.from(pendingTranslationsRef.current);
    pendingTranslationsRef.current.clear();
    
    if (DEBUG_MODE) {
      console.log(`🔄 Processing batch of ${pendingKeys.length} translations`);
    }

    setLoading(true);
    
    try {
      const items = pendingKeys.map(key => ({
        key,
        text: key.split('.').pop() || key,
        context: options.context
      }));
      
      const batchResults = await brandVoiceTranslation.translateUIBatch(
        items,
        currentLanguage.code
      );
      
      // Update both state and ref
      setTranslations(prev => {
        const newTranslations = { ...prev, ...batchResults };
        translationsRef.current = newTranslations;
        return newTranslations;
      });
    } catch (error) {
      console.warn('Batch translation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Translate a single key immediately (for critical translations)
  const translateAsync = async (key: string, fallbackText: string): Promise<string> => {
    if (currentLanguage.code === 'en') {
      return fallbackText;
    }

    // Return cached translation if available
    if (translationsRef.current[key]) {
      return translationsRef.current[key];
    }

    try {
      const translation = await brandVoiceTranslation.translateUI(
        key,
        fallbackText,
        currentLanguage.code,
        options.context
      );

      // Update both state and ref
      setTranslations(prev => {
        const newTranslations = { ...prev, [key]: translation };
        translationsRef.current = newTranslations;
        return newTranslations;
      });

      return translation;
    } catch (error) {
      console.warn(`Translation failed for ${key}:`, error);
      return fallbackText;
    }
  };

  // Batch translate multiple items at once
  const translateBatch = async (
    items: Array<{ key: string; text: string; context?: string }>
  ): Promise<void> => {
    if (currentLanguage.code === 'en') {
      const englishTranslations = items.reduce((acc, item) => {
        acc[item.key] = item.text;
        return acc;
      }, {} as Record<string, string>);
      
      // Update both state and ref
      setTranslations(prev => {
        const newTranslations = { ...prev, ...englishTranslations };
        translationsRef.current = newTranslations;
        return newTranslations;
      });
      return;
    }

    setLoading(true);
    
    try {
      const batchResults = await brandVoiceTranslation.translateUIBatch(
        items,
        currentLanguage.code
      );

      // Update both state and ref
      setTranslations(prev => {
        const newTranslations = { ...prev, ...batchResults };
        translationsRef.current = newTranslations;
        return newTranslations;
      });
    } catch (error) {
      console.warn('Batch translation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear translations when language changes
  useEffect(() => {
    setTranslations({});
    translationsRef.current = {};
    pendingTranslationsRef.current.clear();
    
    if (batchTimeoutRef.current !== null) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
    
    // Reset render count when language changes to get fresh metrics
    resetRenderCount();
  }, [currentLanguage.code, resetRenderCount]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current !== null) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  // Add React DevTools performance profiling
  useEffect(() => {
    if (DEBUG_MODE && typeof window !== 'undefined') {
      // @ts-ignore
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('🔧 React DevTools detected. Enable Performance Profile for detailed analysis');
      }
    }
  }, []);

  return {
    t,
    translateAsync,
    translateBatch,
    loading,
    currentLanguage: currentLanguage.code,
    // Debug info
    _debug: DEBUG_MODE ? {
      renderCount,
      translationsCount: Object.keys(translations).length,
      pendingCount: pendingTranslationsRef.current.size
    } : undefined
  };
}

// Specialized hooks for different UI contexts
export function useNavigationTranslation() {
  return useTranslationDebug({ context: 'navigation' });
}

export function useAuthTranslation() {
  return useTranslationDebug({ context: 'authentication' });
}

export function useVerificationTranslation() {
  return useTranslationDebug({ context: 'verification' });
}

export function useActionTranslation() {
  return useTranslationDebug({ context: 'actions' });
}

export default useTranslationDebug;