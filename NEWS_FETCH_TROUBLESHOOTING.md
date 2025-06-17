# 🔍 News Fetch Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Issue 1: API Keys Not Set in Supabase**
**Problem:** Edge Functions can't access NewsAPI/GNews without proper API keys

**Solution:**
1. Go to **Supabase Dashboard** → **Edge Functions** → **Settings**
2. Add these secrets:
   ```
   NEWS_API_KEY = 83c03ab43ed54ebc885790a38fb13344
   GNEWS_API_KEY = e4d9b594da1a66e49ed22ac172c44faa
   ```

### **Issue 2: Edge Functions Not Deployed**
**Problem:** The fetch-news and schedule-news-fetch functions aren't deployed

**Check:** Go to **Supabase Dashboard** → **Edge Functions**
- Should see: `fetch-news` and `schedule-news-fetch`
- If missing, they need to be deployed

### **Issue 3: Database Tables Missing**
**Problem:** Migration scripts not run properly

**Check:** Go to **Table Editor** and verify these tables exist:
- ✅ `news`
- ✅ `news_fetch_logs` 
- ✅ `verification_logs`

### **Issue 4: RLS Policies Blocking Inserts**
**Problem:** Row Level Security preventing Edge Functions from inserting data

**Solution:** Edge Functions should use SERVICE_ROLE_KEY (bypasses RLS)

### **Issue 5: API Rate Limits Exceeded**
**Problem:** NewsAPI/GNews daily limits reached

**Check:**
- NewsAPI: 1,000 requests/day (free)
- GNews: 100 requests/day (free)

### **Issue 6: Network/CORS Issues**
**Problem:** Edge Functions can't reach external APIs

**Check:** Function logs for network errors

---

## 🔧 **Diagnostic Steps**

### **Step 1: Test Manual Fetch**
1. Go to **Admin Dashboard** → **News API**
2. Click **"Fetch Now"** button
3. Watch for errors in the response

### **Step 2: Check Function Logs**
1. **Supabase Dashboard** → **Edge Functions** → **fetch-news**
2. Click **"Logs"** tab
3. Look for error messages

### **Step 3: Verify API Keys Work**
Test your API keys directly:

```bash
# Test NewsAPI
curl "https://newsapi.org/v2/top-headlines?country=us&apiKey=83c03ab43ed54ebc885790a38fb13344"

# Test GNews
curl "https://gnews.io/api/v4/top-headlines?lang=en&country=us&max=10&apikey=e4d9b594da1a66e49ed22ac172c44faa"
```

### **Step 4: Check Database Permissions**
```sql
-- Test if you can insert into news table
INSERT INTO news (title, summary, source, source_url, category, language) 
VALUES ('Test Article', 'Test Summary', 'Test Source', 'https://test.com/unique-url-' || extract(epoch from now()), 'all', 'en');
```

### **Step 5: Check Fetch Logs**
```sql
-- Check recent fetch attempts
SELECT * FROM news_fetch_logs 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🎯 **Quick Fixes**

### **Fix 1: Redeploy Edge Functions**
If functions are missing or outdated:

1. **Supabase CLI method:**
   ```bash
   supabase functions deploy fetch-news
   supabase functions deploy schedule-news-fetch
   supabase functions deploy verify-news
   ```

2. **Manual method:** Copy function code to Supabase Dashboard

### **Fix 2: Reset API Keys**
1. Go to **Edge Functions** → **Settings**
2. Delete old secrets
3. Add new ones:
   ```
   NEWS_API_KEY = 83c03ab43ed54ebc885790a38fb13344
   GNEWS_API_KEY = e4d9b594da1a66e49ed22ac172c44faa
   ```

### **Fix 3: Force Manual Fetch**
Try this direct API call:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/fetch-news
```

---

## 📊 **Expected Results**

After successful fetch, you should see:

### **In Admin Dashboard:**
- ✅ Total Articles count increases
- ✅ New entries in "Recent Fetch Logs"
- ✅ Articles by Category/Language stats
- ✅ No error messages

### **In Database:**
- ✅ New rows in `news` table
- ✅ New rows in `news_fetch_logs` table
- ✅ `success = true` in fetch logs

### **In Main Feed:**
- ✅ New articles appear
- ✅ Different categories populated
- ✅ Breaking news badges on relevant articles

---

## 🚨 **Emergency Fallback**

If nothing works, you can manually add test articles:

```sql
-- Add some test articles to verify the system works
INSERT INTO news (title, summary, source, source_url, category, language, admin_status, is_breaking) VALUES
('Breaking: Major Tech Announcement', 'A major technology company announces groundbreaking innovation.', 'TechNews', 'https://technews.com/breaking-' || extract(epoch from now()), 'business', 'en', 'valid', true),
('Sports Update: Championship Results', 'Latest results from the championship tournament.', 'SportsCenter', 'https://sports.com/update-' || extract(epoch from now()), 'sports', 'en', 'valid', false),
('Political Development: New Policy Announced', 'Government announces new policy affecting millions.', 'NewsWire', 'https://newswire.com/policy-' || extract(epoch from now()), 'politics', 'en', 'pending', false);
```

---

## 🔍 **Next Steps**

1. **Try the "Fetch Now" button** in Admin Dashboard
2. **Check the error message** if it fails
3. **Look at function logs** in Supabase Dashboard
4. **Verify API keys** are set correctly
5. **Test API keys** with direct curl commands

**Let me know what error messages you see, and I'll help you fix the specific issue!** 🚀