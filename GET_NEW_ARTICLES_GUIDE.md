# 🚀 How to Get New Articles - Complete Guide

## 🎯 **Your Functions Are Working! Now Let's Get News**

Since your Edge Functions are now operational, here's how to start getting fresh articles:

---

## 🔧 **Method 1: Manual Fetch (Immediate)**

### **Step 1: Use Admin Dashboard**
1. **Sign in with "Admin Demo" button**
2. **Go to Admin Dashboard** → **News API tab**
3. **Click "Fetch Now" button**
4. **Wait 10-30 seconds for completion**

### **Expected Result:**
- ✅ "Articles processed: X, Articles inserted: Y"
- ✅ New entries in "Recent Fetch Logs"
- ✅ Statistics update with new numbers

---

## 🕒 **Method 2: Set Up Automatic Fetching (Recommended)**

### **Option A: Supabase Cron (Built-in)**

1. **Go to Supabase Dashboard** → **Database** → **Extensions**
2. **Enable `pg_cron` extension**
3. **Go to SQL Editor and run:**

```sql
-- Schedule news fetch every 30 minutes
SELECT cron.schedule(
  'fetch-news-every-30-minutes',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/schedule-news-fetch',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

**Replace:**
- `YOUR_PROJECT_ID` with your actual project ID
- `YOUR_SERVICE_ROLE_KEY` with your service role key

### **Option B: GitHub Actions (Free)**

Create `.github/workflows/fetch-news.yml`:

```yaml
name: Fetch News Every 30 Minutes

on:
  schedule:
    - cron: '*/30 * * * *'
  workflow_dispatch:

jobs:
  fetch-news:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger News Fetch
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            https://YOUR_PROJECT_ID.supabase.co/functions/v1/schedule-news-fetch
```

---

## 📊 **What You'll Get**

### **News Sources:**
- **NewsAPI:** Top headlines from major news outlets
- **GNews:** Additional international coverage
- **Categories:** Politics, Business, Sports, Entertainment, Conflicts
- **Languages:** English, Spanish, French, German

### **Article Processing:**
- ✅ **Automatic categorization** based on content
- ✅ **Breaking news detection** for urgent stories
- ✅ **Location extraction** when possible
- ✅ **Duplicate prevention** to avoid repeats
- ✅ **Content summarization** for better readability

---

## 🎯 **Quick Start (Do This Now!)**

### **1. Manual Test Fetch:**
```bash
# Replace with your actual values
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/fetch-news
```

### **2. Check Results:**
- **Admin Dashboard** → **News API** → Check statistics
- **Table Editor** → **news** table → See new articles
- **Main app** → Refresh to see new articles in feed

### **3. Verify API Keys:**
Your API keys are already configured:
- ✅ **NewsAPI:** `83c03ab43ed54ebc885790a38fb13344`
- ✅ **GNews:** `e4d9b594da1a66e49ed22ac172c44faa`

---

## 📈 **Expected Results**

### **First Fetch (Manual):**
- **~50-100 articles processed**
- **~10-30 articles inserted** (after duplicate filtering)
- **Multiple categories populated**
- **Breaking news flagged appropriately**

### **Ongoing Fetches (Automatic):**
- **Every 30 minutes:** Fresh articles added
- **Daily volume:** 200-500 new articles
- **Global coverage:** Multiple languages and regions
- **Real-time updates:** Breaking news within minutes

---

## 🔍 **Monitor Your News Feed**

### **Admin Dashboard Monitoring:**
- **Total Articles:** Should increase with each fetch
- **Recent Logs:** Shows fetch success/failure
- **Category Breakdown:** Balanced distribution
- **Error Tracking:** Any API issues

### **Main App Experience:**
- **Home Page:** New articles appear at top
- **Categories:** Each category gets fresh content
- **Breaking News:** Red "BREAKING" badges
- **Real-time Feed:** Live updates every 30 minutes

---

## 🚨 **Troubleshooting**

### **If Manual Fetch Fails:**
1. **Check API keys** in Edge Functions → Settings
2. **Verify function deployment** in Edge Functions list
3. **Check function logs** for specific errors
4. **Test with Debug tab** in Admin Dashboard

### **If No Articles Appear:**
1. **Check database permissions** (RLS policies)
2. **Verify news table structure** in Table Editor
3. **Check for duplicate URLs** (might be filtered out)
4. **Look at fetch logs** for insertion errors

### **If Cron Job Doesn't Work:**
1. **Verify pg_cron extension** is enabled
2. **Check cron job creation:** `SELECT * FROM cron.job;`
3. **Monitor cron logs** for execution status
4. **Use alternative scheduling** (GitHub Actions)

---

## 🎉 **Success Checklist**

- [ ] **Manual fetch works** (Admin Dashboard → Fetch Now)
- [ ] **Articles appear** in Table Editor → news
- [ ] **Statistics update** in Admin Dashboard
- [ ] **Main feed shows** new articles
- [ ] **Categories populated** with relevant content
- [ ] **Breaking news** properly flagged
- [ ] **Automatic scheduling** set up (cron or GitHub Actions)
- [ ] **Monitoring working** (logs and statistics)

---

## 🚀 **Next Steps**

1. **Try manual fetch first** to verify everything works
2. **Set up automatic scheduling** for continuous updates
3. **Monitor the system** for 24 hours to ensure stability
4. **Customize categories** or languages if needed
5. **Set up alerts** for fetch failures (optional)

---

**Ready to get started? Click "Fetch Now" in your Admin Dashboard! 🎯**