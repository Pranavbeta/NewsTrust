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
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
];

export const getCountryByCode = (code: string) =>
  SUPPORTED_COUNTRIES.find(c => c.code === code);

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
 * Generate mock news data as fallback
 */
const generateMockNews = (countryCode: string, countryName: string): CountryNewsResponse => {
  const mockArticles = [
    {
      title: `Breaking: Major Economic Development in ${countryName}`,
      description: `Latest economic indicators show significant growth in ${countryName}'s key sectors.`,
      content: `Economic analysts report positive trends across multiple industries in ${countryName}...`,
      url: `https://example.com/news/${countryCode}/economy`,
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      publishedAt: new Date().toISOString(),
      source: { name: `${countryName} News Network`, url: `https://example.com/${countryCode}` }
    },
    {
      title: `Technology Innovation Advances in ${countryName}`,
      description: `New technological breakthroughs are transforming industries across ${countryName}.`,
      content: `Technology sector leaders in ${countryName} announce major innovations...`,
      url: `https://example.com/news/${countryCode}/tech`,
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: { name: `${countryName} Tech Today`, url: `https://example.com/${countryCode}` }
    },
    {
      title: `Environmental Initiative Launched in ${countryName}`,
      description: `Government announces new environmental protection measures for ${countryName}.`,
      content: `Environmental protection efforts in ${countryName} receive major funding boost...`,
      url: `https://example.com/news/${countryCode}/environment`,
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: { name: `${countryName} Environmental Report`, url: `https://example.com/${countryCode}` }
    }
  ];

  return {
    articles: mockArticles,
    totalArticles: mockArticles.length
  };
};

/**
 * Fetch country news via Supabase Edge Function with improved error handling
 */
export const fetchCountryNews = async (
  countryCode: string,
  category: string = 'general',
  max: number = 20
): Promise<CountryNewsResponse> => {
  const country = getCountryByCode(countryCode);
  const countryName = country?.name || 'Unknown Country';

  // Check if we have the required environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseFunctionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  
  if (!supabaseUrl || !supabaseFunctionsUrl) {
    console.warn('Supabase configuration missing, using mock data');
    return generateMockNews(countryCode, countryName);
  }

  const fnUrl = `${supabaseFunctionsUrl}/country-news`;
  const params = new URLSearchParams({ 
    countryCode, 
    category, 
    max: max.toString() 
  });

  try {
    // Try edge function first
    console.log(`Attempting to fetch from edge function: ${fnUrl}`);
    const resp = await fetch(`${fnUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if response is HTML (indicates edge function not deployed or error)
    const contentType = resp.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Edge function returned non-JSON response (likely not deployed)');
    }

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Edge function failed: ${resp.status} - ${errorText}`);
    }

    const data = await resp.json();
    
    if (!data.articles || !Array.isArray(data.articles)) {
      throw new Error('Invalid response format from edge function');
    }

    console.log(`Successfully fetched ${data.articles.length} articles from edge function`);
    return data;

  } catch (edgeFunctionError) {
    console.warn('Edge function failed:', edgeFunctionError.message);
    
    // Try direct API fallback if we have API keys
    const gnewsKey = import.meta.env.VITE_GNEWS_API_KEY;
    const newsapiKey = import.meta.env.VITE_NEWS_API_KEY;

    if (gnewsKey) {
      try {
        console.log('Attempting GNews API fallback...');
        const gnewsUrl = `https://gnews.io/api/v4/top-headlines?apikey=${gnewsKey}&country=${countryCode}&category=${category}&max=${max}&lang=en`;
        
        const gnewsResp = await fetch(gnewsUrl);
        if (!gnewsResp.ok) {
          throw new Error(`GNews API failed: ${gnewsResp.status}`);
        }
        
        const gnewsData = await gnewsResp.json();
        if (gnewsData.articles && Array.isArray(gnewsData.articles)) {
          console.log(`Successfully fetched ${gnewsData.articles.length} articles from GNews API`);
          return gnewsData;
        }
      } catch (gnewsError) {
        console.warn('GNews API fallback failed:', gnewsError.message);
      }
    }

    if (newsapiKey) {
      try {
        console.log('Attempting NewsAPI fallback...');
        const newsapiUrl = `https://newsapi.org/v2/top-headlines?apiKey=${newsapiKey}&country=${countryCode}&category=${category}&pageSize=${max}&language=en`;
        
        const newsapiResp = await fetch(newsapiUrl);
        if (!newsapiResp.ok) {
          throw new Error(`NewsAPI failed: ${newsapiResp.status}`);
        }
        
        const newsapiData = await newsapiResp.json();
        if (newsapiData.articles && Array.isArray(newsapiData.articles)) {
          // Transform NewsAPI format to match expected format
          const transformedData = {
            articles: newsapiData.articles.map((article: any) => ({
              title: article.title,
              description: article.description,
              content: article.content,
              url: article.url,
              image: article.urlToImage,
              publishedAt: article.publishedAt,
              source: {
                name: article.source.name,
                url: article.url
              }
            })),
            totalArticles: newsapiData.totalResults
          };
          
          console.log(`Successfully fetched ${transformedData.articles.length} articles from NewsAPI`);
          return transformedData;
        }
      } catch (newsapiError) {
        console.warn('NewsAPI fallback failed:', newsapiError.message);
      }
    }

    // If all APIs fail, return mock data
    console.warn('All news APIs failed, using mock data');
    return generateMockNews(countryCode, countryName);
  }
};