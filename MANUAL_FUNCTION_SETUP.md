# 📝 Manual Edge Function Setup Guide

## 🎯 **Goal:** Create working Edge Functions without CLI issues

---

## 🔧 **Step 1: Create Test Function**

1. **Go to Supabase Dashboard** → **Edge Functions**
2. **Click "Create a new function"**
3. **Function name:** `test-fetch`
4. **Paste this code:**

```typescript
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const result = {
      success: true,
      message: 'Edge Function is working!',
      timestamp: new Date().toISOString(),
      environment: {
        hasNewsApiKey: !!Deno.env.get('NEWS_API_KEY'),
        hasGNewsApiKey: !!Deno.env.get('GNEWS_API_KEY'),
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }
    };

    return new Response(
      JSON.stringify(result, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

5. **Click "Deploy"**

---

## 🧪 **Step 2: Test the Function**

### **Method A: Browser Test**
Open this URL in your browser:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/test-fetch
```

### **Method B: Admin Dashboard Test**
1. **Use "Admin Demo" button to sign in**
2. **Go to Admin Dashboard** → **News API**
3. **Click "Fetch Now"** (will fail, but we'll see the error)

### **Method C: Direct API Test**
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/test-fetch
```

---

## 📊 **Expected Test Results**

### **✅ Success Response:**
```json
{
  "success": true,
  "message": "Edge Function is working!",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": {
    "hasNewsApiKey": true,
    "hasGNewsApiKey": true,
    "hasSupabaseUrl": true,
    "hasServiceKey": true
  }
}
```

### **❌ If Environment Variables Missing:**
```json
{
  "environment": {
    "hasNewsApiKey": false,
    "hasGNewsApiKey": false,
    "hasSupabaseUrl": true,
    "hasServiceKey": true
  }
}
```

---

## 🔑 **Step 3: Set Environment Variables**

If the test shows missing API keys:

1. **Go to Edge Functions** → **Settings**
2. **Add these secrets:**
   ```
   NEWS_API_KEY
   Value: 83c03ab43ed54ebc885790a38fb13344
   
   GNEWS_API_KEY  
   Value: e4d9b594da1a66e49ed22ac172c44faa
   ```
3. **Save and test again**

---

## 🚀 **Step 4: Create Full Fetch Function**

Once the test function works, create the real one:

1. **Create new function:** `fetch-news`
2. **Use this simplified version:**

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting news fetch...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const newsApiKey = Deno.env.get('NEWS_API_KEY');
    
    if (!newsApiKey) {
      throw new Error('NEWS_API_KEY not configured');
    }

    // Simple test fetch from NewsAPI
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${newsApiKey}`
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    let insertedCount = 0;
    
    // Insert articles into database
    for (const article of data.articles || []) {
      if (!article.title || !article.url) continue;
      
      try {
        const { error } = await supabaseClient
          .from('news')
          .insert({
            title: article.title.substring(0, 200),
            summary: article.description?.substring(0, 500) || article.title,
            source: article.source?.name || 'NewsAPI',
            source_url: article.url,
            category: 'all',
            language: 'en',
            admin_status: 'pending',
            is_breaking: false,
            image_url: article.urlToImage
          });

        if (!error) {
          insertedCount++;
        }
      } catch (insertError) {
        console.error('Insert error:', insertError);
      }
    }

    // Log the fetch
    await supabaseClient
      .from('news_fetch_logs')
      .insert({
        source_api: 'newsapi',
        articles_processed: data.articles?.length || 0,
        articles_inserted: insertedCount,
        success: true
      });

    return new Response(
      JSON.stringify({
        success: true,
        articlesProcessed: data.articles?.length || 0,
        articlesInserted: insertedCount,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fetch error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

---

## ✅ **Step 5: Test Full Function**

1. **Deploy the fetch-news function**
2. **Test via Admin Dashboard "Fetch Now" button**
3. **Check for new articles in Table Editor**

---

## 🎯 **Success Indicators**

### **✅ Function Working:**
- Test function returns success
- Environment variables all show `true`
- No import errors in logs

### **✅ News Fetch Working:**
- "Fetch Now" button returns success
- New articles appear in database
- Fetch logs show successful entries

### **✅ Admin Dashboard Working:**
- Statistics show real numbers
- Recent logs show fetch attempts
- No error messages

---

**Start with the test function and let me know what response you get!** 🚀