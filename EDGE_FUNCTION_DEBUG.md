# 🔧 Edge Function Import Issues - Complete Debug Guide

## 🚨 **Current Issue Analysis**

You're getting `Cannot find module 'npm:@supabase/supabase-js@2'` which suggests:
1. Edge Functions aren't deployed properly
2. Import syntax issues in Supabase environment
3. Environment configuration problems

---

## 🎯 **Step-by-Step Debugging**

### **Step 1: Verify Edge Functions Are Deployed**

1. **Go to Supabase Dashboard** → **Edge Functions**
2. **Check if you see these functions:**
   - ✅ `fetch-news`
   - ✅ `schedule-news-fetch` 
   - ✅ `verify-news`

**If missing:** Functions need to be created/deployed

### **Step 2: Test Function Deployment Status**

Try this direct test in your browser:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/fetch-news
```

**Expected:** Should return CORS headers or function response
**If 404:** Function not deployed

### **Step 3: Check Function Code in Dashboard**

1. **Click on `fetch-news` function**
2. **Verify the code matches our latest version**
3. **Look for import statements at the top**

---

## 🛠️ **Solution Options**

### **Option A: Manual Function Creation (Recommended)**

Since CLI deployment might have issues, let's create functions manually:

1. **Go to Supabase Dashboard** → **Edge Functions**
2. **Click "Create a new function"**
3. **Name:** `fetch-news`
4. **Copy the EXACT code from our updated files**

### **Option B: Simplified Test Function**

Let's create a minimal test function first to verify the environment:

**Function Name:** `test-fetch`
**Code:**
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
    // Test basic functionality
    const result = {
      success: true,
      message: 'Test function working',
      timestamp: new Date().toISOString(),
      environment: {
        hasNewsApiKey: !!Deno.env.get('NEWS_API_KEY'),
        hasGNewsApiKey: !!Deno.env.get('GNEWS_API_KEY'),
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }
    };

    return new Response(
      JSON.stringify(result),
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

---

## 🧪 **Testing Steps**

### **Test 1: Basic Function Test**
After creating the test function, call it:
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/test-fetch
```

### **Test 2: Check Environment Variables**
The test function will show if API keys are properly set.

### **Test 3: Admin Dashboard Test**
1. **Sign in with Admin Demo button**
2. **Go to Admin Dashboard** → **News API**
3. **Check if you see any statistics**

---

## 🔑 **Environment Variables Check**

Make sure these are set in **Edge Functions** → **Settings**:

```
NEWS_API_KEY = 83c03ab43ed54ebc885790a38fb13344
GNEWS_API_KEY = e4d9b594da1a66e49ed22ac172c44faa
```

**Note:** These should be in the Edge Function secrets, NOT in your .env file.

---

## 🎯 **Quick Win: Use Working Import Syntax**

If you're still having import issues, try this alternative import syntax:

```typescript
// Instead of npm: prefix, use direct esm.sh
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Or try the CDN version
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.39.0';
```

---

## 📊 **Expected Results After Fix**

### **✅ Working Admin Dashboard:**
- Statistics show numbers (not "Failed to fetch stats")
- "Fetch Now" button works without errors
- Recent Fetch Logs show entries

### **✅ Working Database:**
- Articles appear in Table Editor → news
- Fetch logs in news_fetch_logs table
- No error messages in logs

### **✅ Working Main App:**
- Articles show in main feed
- Categories work properly
- Voting and comments functional

---

## 🚨 **If Nothing Works: Alternative Approach**

We can implement a **client-side news fetching** as a fallback:

1. **Fetch news directly from browser**
2. **Use CORS-enabled news APIs**
3. **Store in Supabase from client**

This bypasses Edge Function issues entirely.

---

## 🎯 **Next Steps**

1. **Try the test function first** (Option B above)
2. **Check what the test function returns**
3. **Based on results, we'll know the exact issue**
4. **Then deploy the full fetch-news function**

**Let me know what happens when you try the test function!** 🚀