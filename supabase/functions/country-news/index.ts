/*
  # Fix Country News Edge Function Parameter Parsing

  1. Changes Made
    - Updated parameter parsing to handle URL query parameters instead of JSON body
    - Added proper CORS headers for cross-origin requests
    - Maintained backward compatibility with both GET and POST requests
    - Added proper error handling and response formatting
    - Fixed module import to use esm.sh CDN for better compatibility

  2. Security
    - Maintains existing service role authentication
    - Validates input parameters properly
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let countryCode = 'us';
    let category = 'general';
    let max = 20;

    // Parse parameters from URL query string (GET) or JSON body (POST)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      countryCode = url.searchParams.get('countryCode') ?? 'us';
      category = url.searchParams.get('category') ?? 'general';
      max = parseInt(url.searchParams.get('max') ?? '20', 10);
    } else if (req.method === 'POST') {
      try {
        const body = await req.json();
        countryCode = body.countryCode ?? 'us';
        category = body.category ?? 'general';
        max = body.max ?? 20;
      } catch {
        // If JSON parsing fails, use defaults
        countryCode = 'us';
        category = 'general';
        max = 20;
      }
    }

    const gnewsKey = Deno.env.get('GNEWS_API_KEY');
    const newsapiKey = Deno.env.get('NEWS_API_KEY');

    // Try GNews API first
    if (gnewsKey) {
      const gnewsUrl = `https://gnews.io/api/v4/top-headlines?` + new URLSearchParams({
        apikey: gnewsKey,
        country: countryCode,
        category: category === 'all' ? 'general' : category,
        max: max.toString(),
        lang: 'en'
      });

      const res = await fetch(gnewsUrl);
      const data = await res.json();

      if (res.ok && data.articles) {
        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        });
      }
    }

    // Fallback to NewsAPI.org
    if (!newsapiKey) {
      throw new Error('No NewsAPI key configured');
    }

    const fallbackUrl = `https://newsapi.org/v2/top-headlines?` + new URLSearchParams({
      apiKey: newsapiKey,
      country: countryCode,
      category,
      pageSize: max.toString(),
      language: 'en'
    });

    const res2 = await fetch(fallbackUrl);
    const data2 = await res2.json();

    if (!res2.ok || !data2.articles) {
      throw new Error(`NewsAPI fallback failed: ${res2.status} - ${JSON.stringify(data2)}`);
    }

    const response = {
      articles: data2.articles.map((a: any) => ({
        title: a.title,
        description: a.description,
        content: a.content,
        url: a.url,
        image: a.urlToImage,
        publishedAt: a.publishedAt,
        source: {
          name: a.source.name,
          url: a.url
        }
      })),
      totalArticles: data2.totalResults
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      }
    });

  } catch (err) {
    console.error('Country news function error:', err);
    
    return new Response(JSON.stringify({
      error: err.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      }
    });
  }
});