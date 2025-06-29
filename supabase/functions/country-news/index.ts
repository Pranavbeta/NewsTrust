// Deno.serve(async (req) => {
//   // --- CORS HEADERS ---
//   const corsHeaders = {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
//   };
//   // --- Handle preflight OPTIONS request ---
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', {
//       headers: corsHeaders
//     });
//   }
//   const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
//   const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
//   const gnewsKey = Deno.env.get('GNEWS_API_KEY');
//   const newsapiKey = Deno.env.get('NEWS_API_KEY');
//   const thenewsapiKey = Deno.env.get('THENEWSAPI_KEY');
//   const newsdataioKey = Deno.env.get('NEWSDATAIO_KEY');
//   const webzioKey = Deno.env.get('WEBZIO_KEY');
//   const SUPPORTED_COUNTRIES = [
//     'us', 'in', 'gb', 'de', 'fr', 'ca', 'au', 'jp', 'br', 'mx', 'it', 'es', 'ru', 'cn', 'kr'
//   ];

//   async function fetchFromGNews(countryCode) {
//     if (!gnewsKey) return [];
//     const url = `https://gnews.io/api/v4/top-headlines?` + new URLSearchParams({
//       apikey: gnewsKey,
//       country: countryCode,
//       max: '10',
//       lang: 'en'
//     });
//     const res = await fetch(url);
//     if (!res.ok) return [];
//     const data = await res.json();
//     return (data.articles || []).map((a) => ({
//       country_code: countryCode,
//       title: a.title,
//       summary: a.description,
//       content: a.content,
//       source: a.source?.name || 'GNews',
//       source_url: a.url,
//       image_url: a.image,
//       published_at: a.publishedAt ? new Date(a.publishedAt) : new Date(),
//       category: 'general'
//     }));
//   }
//   async function fetchFromNewsAPI(countryCode) {
//     if (!newsapiKey) return [];
//     const url = `https://newsapi.org/v2/top-headlines?` + new URLSearchParams({
//       apiKey: newsapiKey,
//       country: countryCode,
//       pageSize: '10',
//       language: 'en'
//     });
//     const res = await fetch(url);
//     if (!res.ok) return [];
//     const data = await res.json();
//     return (data.articles || []).map((a) => ({
//       country_code: countryCode,
//       title: a.title,
//       summary: a.description,
//       content: a.content,
//       source: a.source?.name || 'NewsAPI',
//       source_url: a.url,
//       image_url: a.urlToImage,
//       published_at: a.publishedAt ? new Date(a.publishedAt) : new Date(),
//       category: 'general'
//     }));
//   }
//   async function fetchFromTheNewsAPI(countryCode) {
//     if (!thenewsapiKey) return [];
//     const url = `https://api.thenewsapi.com/v1/news/top?` + new URLSearchParams({
//       api_token: thenewsapiKey,
//       locale: `en-${countryCode}`,
//       limit: '10'
//     });
//     const res = await fetch(url);
//     if (!res.ok) return [];
//     const data = await res.json();
//     return (data.data || []).map((a) => ({
//       country_code: countryCode,
//       title: a.title,
//       summary: a.description,
//       content: a.content,
//       source: a.source || 'TheNewsAPI',
//       source_url: a.url,
//       image_url: a.image_url,
//       published_at: a.published ? new Date(a.published) : new Date(),
//       category: 'general'
//     }));
//   }
//   async function fetchFromNewsDataIO(countryCode) {
//     if (!newsdataioKey) return [];
//     const url = `https://newsdata.io/api/1/news?` + new URLSearchParams({
//       apikey: newsdataioKey,
//       country: countryCode,
//       language: 'en',
//       category: 'top'
//     });
//     const res = await fetch(url);
//     if (!res.ok) return [];
//     const data = await res.json();
//     return (data.results || []).map((a) => ({
//       country_code: countryCode,
//       title: a.title,
//       summary: a.description,
//       content: a.content,
//       source: a.source_id || 'NewsData.io',
//       source_url: a.link,
//       image_url: a.image_url,
//       published_at: a.pubDate ? new Date(a.pubDate) : new Date(),
//       category: 'general'
//     }));
//   }
//   async function fetchFromWebzIO(countryCode) {
//     if (!webzioKey) return [];
//     const url = `https://webz.io/apiLite?` + new URLSearchParams({
//       token: webzioKey,
//       q: `language:english AND location:${countryCode}`,
//       size: '10'
//     });
//     const res = await fetch(url);
//     if (!res.ok) return [];
//     const data = await res.json();
//     return (data.posts || []).map((a) => ({
//       country_code: countryCode,
//       title: a.title,
//       summary: a.text,
//       content: a.text,
//       source: a.thread?.site || 'Webz.io',
//       source_url: a.url,
//       image_url: a.main_image,
//       published_at: a.published ? new Date(a.published) : new Date(),
//       category: 'general'
//     }));
//   }
//   async function fetchAndStoreForCountry(countryCode) {
//     let articles = [];
//     let usedSources = [];
//     // 1. Try GNews
//     const gnewsArticles = await fetchFromGNews(countryCode);
//     if (gnewsArticles.length > 0) {
//       articles.push(...gnewsArticles);
//       usedSources.push('GNews');
//     }
//     // 2. If less than 2, try NewsAPI
//     if (articles.length < 2) {
//       const newsapiArticles = await fetchFromNewsAPI(countryCode);
//       for (const a of newsapiArticles) {
//         if (!articles.some((b) => b.title === a.title && b.published_at.getTime() === a.published_at.getTime())) {
//           articles.push(a);
//         }
//       }
//       if (newsapiArticles.length > 0) usedSources.push('NewsAPI');
//     }
//     // 3. If still less than 2, try TheNewsAPI
//     if (articles.length < 2) {
//       const thenewsapiArticles = await fetchFromTheNewsAPI(countryCode);
//       for (const a of thenewsapiArticles) {
//         if (!articles.some((b) => b.title === a.title && b.published_at.getTime() === a.published_at.getTime())) {
//           articles.push(a);
//         }
//       }
//       if (thenewsapiArticles.length > 0) usedSources.push('TheNewsAPI');
//     }
//     // 4. If still less than 2, try NewsData.io
//     if (articles.length < 2) {
//       const newsdataioArticles = await fetchFromNewsDataIO(countryCode);
//       for (const a of newsdataioArticles) {
//         if (!articles.some((b) => b.title === a.title && b.published_at.getTime() === a.published_at.getTime())) {
//           articles.push(a);
//         }
//       }
//       if (newsdataioArticles.length > 0) usedSources.push('NewsData.io');
//     }
//     // 5. If still less than 2, try Webz.io
//     if (articles.length < 2) {
//       const webzioArticles = await fetchFromWebzIO(countryCode);
//       for (const a of webzioArticles) {
//         if (!articles.some((b) => b.title === a.title && b.published_at.getTime() === a.published_at.getTime())) {
//           articles.push(a);
//         }
//       }
//       if (webzioArticles.length > 0) usedSources.push('Webz.io');
//     }
//     // Only keep up to 2 articles
//     articles = articles.slice(0, 2);
//     // Insert articles, avoiding duplicates
//     for (const article of articles) {
//       const { error } = await supabase.from('country_news').upsert(article, {
//         onConflict: 'country_code,title,published_at'
//       });
//       if (error) {
//         console.error('Upsert error:', error, 'Article:', article.title);
//       }
//     }
//     console.log(`Fetched ${articles.length} articles for ${countryCode} from ${usedSources.join(', ') || 'none'}`);
//   }
//   for (const country of SUPPORTED_COUNTRIES) {
//     await fetchAndStoreForCountry(country);
//   }

//   // --- Fetch and return latest articles from country_news table ---
//   const { data: articles, error } = await supabase
//     .from('country_news')
//     .select('*')
//     .order('published_at', { ascending: false })
//     .limit(50);

//   if (error) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//     });
//   }

//   return new Response(JSON.stringify(articles), {
//     headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//   });
// });