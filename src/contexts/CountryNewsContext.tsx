import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchCountryNews, 
  getUserPreferredCountry, 
  setUserPreferredCountry, 
  getCountryByCode,
  Country,
  CountryNewsResponse 
} from '../lib/countryNews';
import { translationService } from '../lib/translationService';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';

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
      const newsResponse = await fetchCountryNews(selectedCountry.code, 'general', 20);
      
      const processedArticles: CountryNewsArticle[] = newsResponse.articles.map((article, index) => ({
        id: `${selectedCountry.code}-${Date.now()}-${index}`,
        title: article.title,
        summary: article.description || article.title,
        content: article.content || article.description || '',
        source: article.source.name,
        source_url: article.url,
        category: 'general',
        language: 'en',
        location: selectedCountry.name,
        image_url: article.image,
        created_at: article.publishedAt,
        country_code: selectedCountry.code,
        votes: {
          valid: Math.floor(Math.random() * 50) + 10,
          fake: Math.floor(Math.random() * 20) + 2,
          not_sure: Math.floor(Math.random() * 15) + 3,
        }
      }));

      // Translate if needed
      if (needsTranslation && currentLanguage.code !== 'en') {
        setTranslating(true);
        const translatedArticles = await Promise.all(
          processedArticles.map(async (article) => {
            try {
              const titleResult = await translationService.translateText(
                article.title, 'en', currentLanguage.code
              );
              const summaryResult = await translationService.translateText(
                article.summary, 'en', currentLanguage.code
              );

              return {
                ...article,
                title: titleResult.translatedText,
                summary: summaryResult.translatedText,
                originalTitle: article.title,
                originalSummary: article.summary,
                isTranslated: true,
                translationService: titleResult.service,
              };
            } catch (translationError) {
              console.error('Translation failed for article:', translationError);
              return article;
            }
          })
        );
        setArticles(translatedArticles);
        setTranslating(false);
      } else {
        setArticles(processedArticles);
      }
    } catch (err) {
      console.error('Failed to fetch country news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  // Refresh when country or language changes
  useEffect(() => {
    refreshNews();
  }, [selectedCountry.code]);

  // Re-translate when language changes
  useEffect(() => {
    if (articles.length > 0 && needsTranslation && currentLanguage.code !== 'en') {
      const translateArticles = async () => {
        setTranslating(true);
        try {
          const translatedArticles = await Promise.all(
            articles.map(async (article) => {
              const sourceTitle = article.originalTitle || article.title;
              const sourceSummary = article.originalSummary || article.summary;
              
              const titleResult = await translationService.translateText(
                sourceTitle, 'en', currentLanguage.code
              );
              const summaryResult = await translationService.translateText(
                sourceSummary, 'en', currentLanguage.code
              );

              return {
                ...article,
                title: titleResult.translatedText,
                summary: summaryResult.translatedText,
                originalTitle: sourceTitle,
                originalSummary: sourceSummary,
                isTranslated: true,
                translationService: titleResult.service,
              };
            })
          );
          setArticles(translatedArticles);
        } catch (error) {
          console.error('Failed to translate articles:', error);
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
  }, [currentLanguage.code]);

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