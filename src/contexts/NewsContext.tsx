import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { hybridTranslationService } from '../lib/hybridTranslation';

export type NewsCategory = 'all' | 'politics' | 'business' | 'sports' | 'entertainment' | 'conflicts';

export interface NewsArticle {
  // your existing fields...
}

interface NewsContextType {
  // your existing context type...
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);
export const useNews = () => {
  const ctx = useContext(NewsContext);
  if (!ctx) throw new Error('useNews must be used within a NewsProvider');
  return ctx;
};

const sampleArticles: NewsArticle[] = [
  // your sample articles
];

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, connectionError } = useAuth();
  const { currentLanguage, isGNewsSupported } = useLanguage();
  const [articles, setArticles] = useState<NewsArticle[]>(sampleArticles);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage.code);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [databaseReady, setDatabaseReady] = useState(false);

  useEffect(() => setSelectedLanguage(currentLanguage.code), [currentLanguage.code]);

  const translateTitleAndSummary = async (article: NewsArticle): Promise<NewsArticle> => {
    const titleResult = await hybridTranslationService.translate(article.title, 'en', currentLanguage.code, 'news');
    const summaryResult = await hybridTranslationService.translate(article.summary, 'en', currentLanguage.code, 'news');
    return {
      ...article,
      title: titleResult.translatedText,
      summary: summaryResult.translatedText,
      originalTitle: article.title,
      originalSummary: article.summary,
      isTranslated: true,
      translatedLanguage: currentLanguage.code,
      translationService: titleResult.service,
    };
  };

  const restoreOriginal = () => setArticles(prev => prev.map(a => a.isTranslated && a.originalTitle
    ? { ...a, title: a.originalTitle!, summary: a.originalSummary!, isTranslated: false, translatedLanguage: undefined, translationService: undefined }
    : a));

  const handleSampleTranslation = async () => {
    let filtered = selectedCategory === 'all' ? sampleArticles : sampleArticles.filter(a => a.category === selectedCategory);
    if (currentLanguage.code !== 'en') {
      setTranslating(true);
      try {
        filtered = await Promise.all(filtered.map(translateTitleAndSummary));
      } catch (e) {
        console.error('Translation error:', e);
      } finally {
        setTranslating(false);
      }
    }
    setArticles(filtered);
  };

  const translateCurrentArticles = async () => {
    if (currentLanguage.code === 'en' || (articles[0]?.translatedLanguage === currentLanguage.code)) return;
    setTranslating(true);
    try {
      const translated = await Promise.all(articles.map(a => {
        const source = a.isTranslated
          ? { ...a, title: a.originalTitle || a.title, summary: a.originalSummary || a.summary, isTranslated: false }
          : a;
        return translateTitleAndSummary(source);
      }));
      setArticles(translated);
    } catch (e) {
      console.error('Translation error:', e);
    } finally {
      setTimeout(() => setTranslating(false), 400);
    }
  };

  const checkDBRefresh = async () => {
    try {
      await Promise.race([
        supabase.from('news').select('id').limit(1),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2000))
      ]);
      setDatabaseReady(true);
      refreshNews();
    } catch {
      setDatabaseReady(false);
      handleSampleTranslation();
    }
  };

  const fetchArticles = async (): Promise<NewsArticle[]> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      let q = supabase
        .from('news').select('*')
        .eq('language', isGNewsSupported ? currentLanguage.code : 'en')
        .order('created_at', { ascending: false })
        .limit(20)
        .abortSignal(controller.signal);
      if (selectedCategory !== 'all') q = q.eq('category', selectedCategory);
      const { data } = await q;
      clearTimeout(timeout);
      return data || [];
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  };

  const refreshNews = async () => {
    setLoading(true);
    try {
      if (!databaseReady) return handleSampleTranslation();
      const fresh = await fetchArticles();
      const final = currentLanguage.code !== 'en' ? await Promise.all(fresh.map(translateTitleAndSummary)) : fresh;
      setArticles(final);
    } catch {
      handleSampleTranslation();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || connectionError) return;
    checkDBRefresh();
  }, [selectedCategory, selectedLanguage, user, authLoading, connectionError]);

  useEffect(() => {
    if (currentLanguage.code !== 'en') translateCurrentArticles();
    else restoreOriginal();
  }, [currentLanguage.code]);

  // stub implementations
  const voteOnArticle = async () => {};
  const submitNews = async () => {};
  const fetchArticleComments = async () => [];
  const submitComment = async () => {};

  return (
    <NewsContext.Provider value={{
      articles, selectedCategory, setSelectedCategory,
      selectedLanguage, setSelectedLanguage,
      loading, refreshNews,
      voteOnArticle, submitNews, fetchArticleComments, submitComment,
      databaseReady, translating
    }}>
      {children}
    </NewsContext.Provider>
  );
};
