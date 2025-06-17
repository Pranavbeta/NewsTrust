# 📋 Complete Database Setup Guide

## 🚨 **IMPORTANT: Run These Scripts in Order!**

You need to run all 3 migration scripts in your Supabase SQL Editor to set up the complete database structure.

## 📝 **Step-by-Step Instructions:**

### 1. **First Migration: Basic Tables**
```sql
-- Copy content from: supabase/migrations/20250615042734_turquoise_rice.sql
-- This creates: profiles, news, votes, comments, submissions tables
```

### 2. **Second Migration: Functions & Logs**
```sql
-- Copy content from: supabase/migrations/20250615085224_billowing_spark.sql
-- This creates: cleanup functions, news_fetch_logs table, additional indexes
```

### 3. **Third Migration: Stats & Sample Data**
```sql
-- Copy content from: supabase/migrations/20250615094418_copper_lake.sql
-- This creates: get_news_stats function, verification_logs table, sample articles
```

## 🔧 **How to Run:**

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Create a new query**
3. **Copy the ENTIRE content** from the first migration file
4. **Click "Run"**
5. **Wait for success message**
6. **Repeat for the second migration**
7. **Repeat for the third migration**

## ✅ **What Each Migration Does:**

### Migration 1 (turquoise_rice):
- ✅ Creates user profiles table
- ✅ Creates news articles table
- ✅ Creates voting system
- ✅ Creates comments system
- ✅ Creates news submissions
- ✅ Sets up Row Level Security (RLS)
- ✅ Creates user registration triggers

### Migration 2 (billowing_spark):
- ✅ Creates cleanup functions
- ✅ Creates news fetch logging
- ✅ Adds performance indexes
- ✅ Creates statistics functions

### Migration 3 (copper_lake):
- ✅ Creates get_news_stats function (fixes "Failed to fetch stats")
- ✅ Creates verification logs table
- ✅ Adds sample news articles for testing
- ✅ Creates admin-only policies

## 🎯 **After Running All 3 Scripts:**

1. **Refresh your Admin Dashboard**
2. **Go to Admin Dashboard → News API**
3. **You should see:**
   - ✅ Statistics working (no more "Failed to fetch stats")
   - ✅ Sample articles in the database
   - ✅ Working "Fetch Now" button
   - ✅ Proper fetch logs

4. **Check your articles:**
   - Go to **Table Editor** → **news** table
   - You'll see 5 sample articles immediately

## 🚨 **Important Notes:**

- **Run scripts in ORDER** (1 → 2 → 3)
- **Don't skip any migration**
- **Wait for each to complete before running the next**
- **If you get an error, check the error message and try again**

## 🔍 **Troubleshooting:**

If you get errors:
1. **Check if tables already exist** - some might be partially created
2. **Look at the specific error message**
3. **You can run individual CREATE statements if needed**

## 🎉 **Success Indicators:**

After all migrations:
- ✅ Admin Dashboard shows statistics
- ✅ News API tab works without errors
- ✅ You can see articles in Table Editor
- ✅ "Fetch Now" button works
- ✅ Sample articles appear in the main feed

---

**Ready to start? Begin with the first migration file! 🚀**