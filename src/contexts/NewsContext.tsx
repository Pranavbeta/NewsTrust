import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export type NewsCategory = 'all' | 'politics' | 'business' | 'sports' | 'entertainment' | 'conflicts';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  source_url: string;
  category: string;
  language: string;
  location?: string;
  image_url?: string;
  admin_status: 'valid' | 'fake' | 'pending';
  admin_note?: string;
  is_breaking: boolean;
  created_at: string;
  updated_at: string;
  // Translation-related fields
  originalTitle?: string;
  originalSummary?: string;
  isTranslated?: boolean;
  translatedLanguage?: string;
  translationService?: string;
  // Voting-related fields
  votes: {
    valid: number;
    fake: number;
    not_sure: number;
  };
  user_vote?: 'valid' | 'fake' | 'not_sure' | null;
}

export interface NewsContextType {
  articles: NewsArticle[];
  selectedCategory: NewsCategory;
  setSelectedCategory: (cat: NewsCategory) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  loading: boolean;
  refreshNews: () => void;
  voteOnArticle: (articleId: string, vote: 'valid' | 'fake' | 'not_sure' | null) => Promise<void>;
  submitNews: (title: string, content: string, sourceUrl: string) => Promise<void>;
  fetchArticleComments: () => Promise<any[]>;
  submitComment: () => Promise<void>;
  databaseReady: boolean;
  translating: boolean;
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

const translationMemoryCache = new Map<string, { title: string; summary: string }>();

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
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      let q = supabase
        .from('news').select('*')
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

  const fetchVotesForArticles = async (articles: NewsArticle[], userId: string | null) => {
    if (articles.length === 0) return articles;
    const articleIds = articles.map(a => a.id);
    // Fetch all votes for these articles
    const { data: votesData } = await supabase
      .from('votes')
      .select('news_id, vote, user_id')
      .in('news_id', articleIds);
    // Count votes per article
    const votesByArticle: Record<string, { valid: number; fake: number; not_sure: number; user_vote: 'valid' | 'fake' | 'not_sure' | null }> = {};
    for (const articleId of articleIds) {
      votesByArticle[articleId] = { valid: 0, fake: 0, not_sure: 0, user_vote: null };
    }
    for (const v of votesData || []) {
      if (v.vote === 'valid') votesByArticle[v.news_id].valid++;
      if (v.vote === 'fake') votesByArticle[v.news_id].fake++;
      if (v.vote === 'not_sure') votesByArticle[v.news_id].not_sure++;
      if (userId && v.user_id === userId) votesByArticle[v.news_id].user_vote = v.vote;
    }
    return articles.map(a => ({ ...a, votes: {
      valid: votesByArticle[a.id].valid,
      fake: votesByArticle[a.id].fake,
      not_sure: votesByArticle[a.id].not_sure
    }, user_vote: votesByArticle[a.id].user_vote }));
  };

  const refreshNews = async () => {
    setLoading(true);
    try {
      if (!databaseReady) return handleSampleTranslation();
      const fresh = await fetchArticles();
      let final = currentLanguage.code !== 'en' ? await Promise.all(fresh.map(translateTitleAndSummary)) : fresh;
      // Fetch votes and user_vote for each article
      final = await fetchVotesForArticles(final, user ? user.id : null);
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

  const voteOnArticle = async (articleId: string, vote: 'valid' | 'fake' | 'not_sure' | null) => {
    if (!user) return;
    // Optimistically update state
    setArticles(prevArticles =>
      prevArticles.map(article => {
        if (article.id !== articleId) return article;
        // Remove previous vote
        let { valid, fake, not_sure } = article.votes || { valid: 0, fake: 0, not_sure: 0 };
        if (article.user_vote) {
          if (article.user_vote === 'valid') valid--;
          if (article.user_vote === 'fake') fake--;
          if (article.user_vote === 'not_sure') not_sure--;
        }
        // Add new vote
        if (vote) {
          if (vote === 'valid') valid++;
          if (vote === 'fake') fake++;
          if (vote === 'not_sure') not_sure++;
        }
        return {
          ...article,
          votes: { valid, fake, not_sure },
          user_vote: vote,
        };
      })
    );
    // Async backend update (no UI blocking)
    if (vote) {
      await supabase.from('votes').upsert(
        { news_id: articleId, user_id: user.id, vote },
        { onConflict: 'news_id,user_id' }
      );
    } else {
      await supabase.from('votes').delete().match({ news_id: articleId, user_id: user.id });
    }
    // Optionally: if backend fails, you could revert the optimistic update or show an error
  };

  // stub implementations
  const submitNews = async (title: string, content: string, sourceUrl: string) => {};
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
