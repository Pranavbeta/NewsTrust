# 🚀 Quick Start: Get News Articles Now!

## ⚡ **Immediate Action (Do This First!)**

### **1. Manual Fetch Test**
1. **Click "Admin Demo" button** to sign in as admin
2. **Go to Admin Dashboard** → **News API tab**
3. **Click "Fetch Now" button**
4. **Wait 10-30 seconds**
5. **Check for success message**

### **2. Verify Results**
- **Admin Dashboard:** Statistics should show new numbers
- **Home Page:** Refresh to see new articles
- **Table Editor:** Go to Supabase → Table Editor → `news` table

---

## 📊 **What You Should See**

### **✅ Success Indicators:**
- **"Articles processed: 50, Articles inserted: 15"** (or similar)
- **Statistics update** in Admin Dashboard
- **New articles appear** in main feed
- **Recent Fetch Logs** show successful entries

### **❌ If It Fails:**
- **Check API keys** in Supabase Edge Functions → Settings
- **Verify functions exist** in Edge Functions list
- **Look at error message** for specific issue

---

## 🔧 **API Keys Setup (If Needed)**

If the fetch fails due to missing API keys:

1. **Go to Supabase Dashboard** → **Edge Functions** → **Settings**
2. **Add these secrets:**
   ```
   NEWS_API_KEY
   Value: 83c03ab43ed54ebc885790a38fb13344
   
   GNEWS_API_KEY
   Value: e4d9b594da1a66e49ed22ac172c44faa
   ```
3. **Save and try "Fetch Now" again**

---

## 🕒 **Set Up Automatic Fetching**

### **Option 1: Supabase Cron (Recommended)**
1. **Enable pg_cron extension** in Database → Extensions
2. **Run this SQL** in SQL Editor:

```sql
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

**Replace YOUR_PROJECT_ID and YOUR_SERVICE_ROLE_KEY with actual values**

### **Option 2: GitHub Actions**
Create `.github/workflows/fetch-news.yml` with the provided code in the main guide.

---

## 🎯 **Expected Results**

### **First Manual Fetch:**
- **50-100 articles processed**
- **10-30 articles inserted** (duplicates filtered)
- **Multiple categories** (politics, business, sports, etc.)
- **Some breaking news** flagged

### **Ongoing Automatic Fetches:**
- **Every 30 minutes:** New articles added
- **200-500 articles/day:** Fresh content
- **Global coverage:** Multiple languages
- **Real-time breaking news**

---

## 🔍 **Monitor Your System**

### **Admin Dashboard:**
- **News API tab:** Shows fetch statistics
- **Recent Logs:** Success/failure tracking
- **Article counts:** By category and status

### **Main App:**
- **Home page:** New articles at top
- **Breaking news banner:** For urgent stories
- **Category tabs:** Fresh content in each
- **News feed status:** Shows last update time

---

## 🚨 **Troubleshooting**

### **"No API keys configured"**
- Add API keys to Edge Functions → Settings

### **"Function not found"**
- Create functions manually in Supabase Dashboard

### **"Failed to fetch news"**
- Check function logs for specific errors
- Verify API key validity

### **No articles appear**
- Check database permissions
- Look at fetch logs for insertion errors
- Verify news table structure

---

## ✅ **Success Checklist**

- [ ] Manual fetch works (returns success message)
- [ ] Articles appear in database (Table Editor)
- [ ] Statistics update in Admin Dashboard
- [ ] Main feed shows new articles
- [ ] Breaking news properly flagged
- [ ] Automatic scheduling set up
- [ ] System monitoring working

---

**🎯 Ready? Click "Admin Demo" → Admin Dashboard → News API → "Fetch Now"!**

Your news verification platform will be live with fresh articles in under 60 seconds! 🚀