import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getUserPreferredCountry, 
  setUserPreferredCountry, 
  getCountryByCode,
  Country,
} from '../lib/countryNews';
import { translationService } from '../lib/translationService';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface CountryNewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  source_url: string;
  category: string;
  language: string;
  location?: string;
  image_url?: string;
  created_at: string;
  country_code: string;
  votes: {
    valid: number;
    fake: number;
    not_sure: number;
  };
  user_vote?: 'valid' | 'fake' | 'not_sure';
  isTranslated?: boolean;
  originalTitle?: string;
  originalSummary?: string;
  translationService?: string;
}

interface CountryNewsContextType {
  selectedCountry: Country;
  setSelectedCountry: (country: Country) => void;
  articles: CountryNewsArticle[];
  loading: boolean;
  error: string | null;
  refreshNews: () => Promise<void>;
  translating: boolean;
}

const CountryNewsContext = createContext<CountryNewsContextType | undefined>(undefined);

const translationMemoryCache = new Map<string, { title: string; summary: string }>();

export const useCountryNews = () => {
  const context = useContext(CountryNewsContext);
  if (context === undefined) {
    throw new Error('useCountryNews must be used within a CountryNewsProvider');
  }
  return context;
};

export const CountryNewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentLanguage, needsTranslation } = useLanguage();
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountryState] = useState<Country>(() => {
    const code = getUserPreferredCountry();
    return getCountryByCode(code) || { code: 'us', name: 'United States', flag: '🇺🇸' };
  });
  const [articles, setArticles] = useState<CountryNewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  const setSelectedCountry = (country: Country) => {
    setSelectedCountryState(country);
    setUserPreferredCountry(country.code);
  };

  const refreshNews = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch from your own DB, not the edge function
      const { data, error } = await supabase
        .from('country_news')
        .select('*')
        .eq('country_code', selectedCountry.code)
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setArticles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  // 1. Fetch articles when country changes
  useEffect(() => {
    refreshNews();
  }, [selectedCountry.code]);

  // 2. Translate articles when language changes or after fetching new articles
  useEffect(() => {
    if (
      articles.length > 0 &&
      needsTranslation &&
      currentLanguage.code !== 'en' &&
      articles.some(a => !a.isTranslated || (a.translationService !== undefined && a.translationService !== currentLanguage.code))
    ) {
      // Only translate if not already translated to this language
      console.log('Translating articles to', currentLanguage.code);
      const translateArticles = async () => {
        setTranslating(true);
        try {
          const translatedArticles = await Promise.all(
            articles.map(async (article) => {
              const cacheKey = `${article.id}-${currentLanguage.code}`;
              
              // 1. Check in-memory cache
              if (translationMemoryCache.has(cacheKey)) {
                const cached = translationMemoryCache.get(cacheKey)!;
                return {
                  ...article,
                  title: cached.title,
                  summary: cached.summary,
                  originalTitle: article.title,
                  originalSummary: article.summary,
                  isTranslated: true,
                  translatedLanguage: currentLanguage.code,
                  translationService: 'memory-cache'
                };
              }

              // 2. Check database cache
              const { data: dbCache } = await supabase
                .from('translation_cache')
                .select('translated_text')
                .eq('source_text', article.title.substring(0, 1000))
                .eq('source_language', 'en')
                .eq('target_language', currentLanguage.code)
                .eq('translation_type', 'lingvanex')
                .maybeSingle();

              if (dbCache?.translated_text) {
                // Found in database cache - get summary translation too
                const { data: summaryCache } = await supabase
                  .from('translation_cache')
                  .select('translated_text')
                  .eq('source_text', article.summary.substring(0, 1000))
                  .eq('source_language', 'en')
                  .eq('target_language', currentLanguage.code)
                  .eq('translation_type', 'lingvanex')
                  .maybeSingle();

                const translatedTitle = dbCache.translated_text;
                const translatedSummary = summaryCache?.translated_text || article.summary;

                // Store in memory cache
                translationMemoryCache.set(cacheKey, { title: translatedTitle, summary: translatedSummary });

                return {
                  ...article,
                  title: translatedTitle,
                  summary: translatedSummary,
                  originalTitle: article.title,
                  originalSummary: article.summary,
                  isTranslated: true,
                  translatedLanguage: currentLanguage.code,
                  translationService: 'database-cache'
                };
              }

              // 3. Call lingvanex translation edge function
              const titleResponse = await fetch('https://jgaiopkkcplaewibqwaf.supabase.co/functions/v1/lingvanex-translate', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  text: article.title,
                  fromLanguage: 'en',
                  toLanguage: currentLanguage.code
                })
              });

              const summaryResponse = await fetch('https://jgaiopkkcplaewibqwaf.supabase.co/functions/v1/lingvanex-translate', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  text: article.summary,
                  fromLanguage: 'en',
                  toLanguage: currentLanguage.code
                })
              });

              const titleResult = await titleResponse.json();
              const summaryResult = await summaryResponse.json();

              if (titleResult.error || summaryResult.error) {
                console.error('Translation failed:', titleResult.error || summaryResult.error);
                return article;
              }

              // Store in both caches
              translationMemoryCache.set(cacheKey, { title: titleResult.translatedText, summary: summaryResult.translatedText });
              try {
                // Store title translation
                await supabase.from('translation_cache').insert({
                  source_text: article.title.substring(0, 1000),
                  source_language: 'en',
                  target_language: currentLanguage.code,
                  translated_text: titleResult.translatedText.substring(0, 2000),
                  translation_type: 'lingvanex'
                });
                
                // Store summary translation
                await supabase.from('translation_cache').insert({
                  source_text: article.summary.substring(0, 1000),
                  source_language: 'en',
                  target_language: currentLanguage.code,
                  translated_text: summaryResult.translatedText.substring(0, 2000),
                  translation_type: 'lingvanex'
                });
              } catch (e) {
                // Ignore duplicate errors
              }

              return {
                ...article,
                title: titleResult.translatedText,
                summary: summaryResult.translatedText,
                originalTitle: article.title,
                originalSummary: article.summary,
                isTranslated: true,
                translatedLanguage: currentLanguage.code,
                translationService: titleResult.service
              };
            })
          );

          setArticles(translatedArticles);
        } catch (error) {
          console.error('Translation error:', error);
        } finally {
          setTranslating(false);
        }
      };
      
      translateArticles();
    } else if (currentLanguage.code === 'en' && articles.length > 0) {
      // Switch back to original English content
      const originalArticles = articles.map(article => ({
        ...article,
        title: article.originalTitle || article.title,
        summary: article.originalSummary || article.summary,
        isTranslated: false,
        translationService: undefined,
      }));
      setArticles(originalArticles);
    }
  }, [currentLanguage.code, needsTranslation]);


  return (
    <CountryNewsContext.Provider value={{
      selectedCountry,
      setSelectedCountry,
      articles,
      loading,
      error,
      refreshNews,
      translating,
    }}>
      {children}
    </CountryNewsContext.Provider>
  );
};