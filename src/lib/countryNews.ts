export interface Country {
  code: string;
  name: string;
  flag: string;
}
export const setUserPreferredCountry = (countryCode: string): void => {
  localStorage.setItem('newsverify_country', countryCode);
};
export const SUPPORTED_COUNTRIES: Country[] = [   
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'ru', name: 'Russia', flag: '🇷🇺' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' }, ];

export const getCountryByCode = (code: string) =>
  SUPPORTED_COUNTRIES.find(c => c.code === code);
/* localStorage helpers same as before */


export const getUserPreferredCountry = (): string => {
  const stored = localStorage.getItem('newsverify_country');
  if (stored && SUPPORTED_COUNTRIES.find(c => c.code === stored)) {
    return stored;
  }
  
  // Try to detect from browser locale
  const browserLocale = navigator.language.toLowerCase();
  if (browserLocale.includes('in')) return 'in';
  if (browserLocale.includes('gb') || browserLocale.includes('uk')) return 'gb';
  if (browserLocale.includes('de')) return 'de';
  if (browserLocale.includes('fr')) return 'fr';
  if (browserLocale.includes('ca')) return 'ca';
  if (browserLocale.includes('au')) return 'au';
  if (browserLocale.includes('jp')) return 'jp';
  if (browserLocale.includes('br')) return 'br';
  if (browserLocale.includes('mx')) return 'mx';
  if (browserLocale.includes('it')) return 'it';
  if (browserLocale.includes('es')) return 'es';
  if (browserLocale.includes('ru')) return 'ru';
  if (browserLocale.includes('cn')) return 'cn';
  if (browserLocale.includes('kr')) return 'kr';
  
  return 'us'; // Default to US
};

export interface CountryNewsResponse {
  articles: Array<{
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: { name: string; url: string };
  }>;
  totalArticles: number;
}

/**
 * Fetch country news via Supabase Edge Function
 */
// lib/countryNews.ts

export const fetchCountryNews = async (
  countryCode: string,
  category: string = 'general',
  max: number = 20
): Promise<CountryNewsResponse> => {
  const fnUrl = `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/country-news`;
  const params = new URLSearchParams({ countryCode, category, max: max.toString() });

  // Try edge function
  let resp = await fetch(`${fnUrl}?${params}`);
  if (!resp.ok) {
    console.warn(`Edge function failed (${resp.status}), falling back.`);
    // fallback path
    const fallbackUrl = `https://gnews.io/api/v4/top-headlines?apikey=${import.meta.env.VITE_GNEWS_API_KEY}&country=${countryCode}&category=${category}&max=${max}&lang=en`;
    resp = await fetch(fallbackUrl);
    if (!resp.ok) throw new Error(`Failed: ${resp.status} - ${await resp.text()}`);
  }
  const data = await resp.json();
  if (!data.articles) throw new Error('Invalid response');
  return data;
};
