import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { brandVoiceTranslation } from '../lib/brandVoiceTranslation';

const DEBUG_MODE = process.env.NODE_ENV === 'development';
const RENDER_WARNING_THRESHOLD = 5;

interface UseTranslationOptions {
  context?: string;
  fallbackToKey?: boolean;
}

function useTranslation(options: UseTranslationOptions = {}) {
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const translationsRef = useRef<Record<string, string>>({});
  const pendingTranslationsRef = useRef<Set<string>>(new Set());
  const batchTimeoutRef = useRef<number | null>(null);

  const renderCountRef = useRef(0);
  const startTimeRef = useRef(performance.now());

  const stableContext = useMemo(() => options.context, [options.context]);

  if (DEBUG_MODE) {
    renderCountRef.current++;
    useEffect(() => {
      const elapsed = performance.now() - startTimeRef.current;
      console.group(`🔍 useTranslation Debug Info (Render #${renderCountRef.current})`);
      console.log(`Time elapsed: ${elapsed.toFixed(2)}ms`);
      if (renderCountRef.current > RENDER_WARNING_THRESHOLD) {
        console.warn(`⚠️ High render count detected! Check for infinite loops.`);
        console.trace('Render stack trace:');
      }
      console.groupEnd();
    }, []);
  }

  const processPendingTranslations = useCallback(async () => {
    if (
      pendingTranslationsRef.current.size === 0 ||
      currentLanguage.code === 'en'
    ) {
      return;
    }

    const pendingKeys = Array.from(pendingTranslationsRef.current);
    pendingTranslationsRef.current.clear();

    setLoading(true);

    try {
      const items = pendingKeys.map(key => ({
        key,
        text: key.split('.').pop() || key,
        context: stableContext,
      }));

      const batchResults = await brandVoiceTranslation.translateUIBatch(
        items,
        currentLanguage.code
      );

      translationsRef.current = {
        ...translationsRef.current,
        ...batchResults,
      };

      setTranslations(prev => {
        const updated = { ...prev };
        let changed = false;
        for (const key in batchResults) {
          if (!prev[key]) {
            updated[key] = batchResults[key];
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    } catch (error) {
      console.warn('Batch translation failed:', error);
    } finally {
      setLoading(false);
    }
  }, [currentLanguage.code, stableContext]);

  const t = useCallback(
    (key: string, fallbackText?: string): string => {
      if (translationsRef.current[key]) {
        return translationsRef.current[key];
      }

      if (
        currentLanguage.code !== 'en' &&
        !pendingTranslationsRef.current.has(key)
      ) {
        pendingTranslationsRef.current.add(key);

        if (batchTimeoutRef.current === null) {
          batchTimeoutRef.current = window.setTimeout(() => {
            processPendingTranslations();
            batchTimeoutRef.current = null;
          }, 100);
        }
      }

      return fallbackText || (options.fallbackToKey ? key : key.split('.').pop() || key);
    },
    [currentLanguage.code, options.fallbackToKey, processPendingTranslations]
  );

  const translateAsync = useCallback(
    async (key: string, fallbackText: string): Promise<string> => {
      if (currentLanguage.code === 'en') return fallbackText;
      if (translationsRef.current[key]) return translationsRef.current[key];

      try {
        const translation = await brandVoiceTranslation.translateUI(
          key,
          fallbackText,
          currentLanguage.code,
          stableContext
        );
        translationsRef.current[key] = translation;
        setTranslations(prev => ({ ...prev, [key]: translation }));
        return translation;
      } catch (error) {
        console.warn(`Translation failed for ${key}:`, error);
        return fallbackText;
      }
    },
    [currentLanguage.code, stableContext]
  );

  const translateBatch = useCallback(
    async (
      items: Array<{ key: string; text: string; context?: string }>
    ): Promise<void> => {
      if (currentLanguage.code === 'en') {
        const englishTranslations = items.reduce((acc, item) => {
          acc[item.key] = item.text;
          return acc;
        }, {} as Record<string, string>);
        translationsRef.current = { ...translationsRef.current, ...englishTranslations };
        setTranslations(prev => ({ ...prev, ...englishTranslations }));
        return;
      }

      setLoading(true);
      try {
        const batchResults = await brandVoiceTranslation.translateUIBatch(
          items,
          currentLanguage.code
        );
        translationsRef.current = { ...translationsRef.current, ...batchResults };
        setTranslations(prev => ({ ...prev, ...batchResults }));
      } catch (error) {
        console.warn('Batch translation failed:', error);
      } finally {
        setLoading(false);
      }
    },
    [currentLanguage.code]
  );

  useEffect(() => {
    setTranslations({});
    translationsRef.current = {};
    pendingTranslationsRef.current.clear();
    if (batchTimeoutRef.current !== null) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
    if (DEBUG_MODE) {
      renderCountRef.current = 0;
      startTimeRef.current = performance.now();
    }
  }, [currentLanguage.code]);

  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current !== null) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  return {
    t,
    translateAsync,
    translateBatch,
    loading,
    currentLanguage: currentLanguage.code,
  };
}

export function useNavigationTranslation() {
  return useTranslation({ context: 'navigation' });
}

export function useAuthTranslation() {
  return useTranslation({ context: 'authentication' });
}

export function useVerificationTranslation() {
  return useTranslation({ context: 'verification' });
}

export function useActionTranslation() {
  return useTranslation({ context: 'actions' });
}

export default useTranslation;
