# 🔧 Fix Migration Conflict Error

## 🚨 **Error Explanation:**
The error `42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification` means the `source_url` column doesn't have a unique constraint, but the INSERT statement is trying to use `ON CONFLICT (source_url)`.

## 🛠️ **Quick Fix Options:**

### **Option 1: Add Missing Unique Constraint (Recommended)**
Run this SQL command first, then run the third migration:

```sql
-- Add unique constraint to source_url if it doesn't exist
ALTER TABLE news ADD CONSTRAINT unique_source_url UNIQUE (source_url);
```

### **Option 2: Modified Insert Statement**
If Option 1 doesn't work, use this modified version of the third migration:

```sql
-- Create function to get news statistics
CREATE OR REPLACE FUNCTION get_news_stats()
RETURNS TABLE(
  total_articles BIGINT,
  articles_by_category JSONB,
  articles_by_language JSONB,
  articles_by_status JSONB,
  breaking_news_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM news) as total_articles,
    (SELECT COALESCE(jsonb_object_agg(category, count), '{}'::jsonb)
     FROM (SELECT category, COUNT(*) as count FROM news GROUP BY category) t
    ) as articles_by_category,
    (SELECT COALESCE(jsonb_object_agg(language, count), '{}'::jsonb)
     FROM (SELECT language, COUNT(*) as count FROM news GROUP BY language) t
    ) as articles_by_language,
    (SELECT COALESCE(jsonb_object_agg(admin_status, count), '{}'::jsonb)
     FROM (SELECT admin_status::text, COUNT(*) as count FROM news GROUP BY admin_status) t
    ) as articles_by_status,
    (SELECT COUNT(*) FROM news WHERE is_breaking = true) as breaking_news_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cleanup old news articles
CREATE OR REPLACE FUNCTION cleanup_old_news(keep_count INTEGER DEFAULT 1000)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH articles_to_keep AS (
    SELECT id
    FROM news
    ORDER BY created_at DESC
    LIMIT keep_count
  )
  DELETE FROM news
  WHERE id NOT IN (SELECT id FROM articles_to_keep);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS news_fetch_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_api text NOT NULL,
  articles_processed integer DEFAULT 0,
  articles_inserted integer DEFAULT 0,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text,
  url text,
  language text DEFAULT 'en',
  credibility_score integer,
  analysis text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE news_fetch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admins can read fetch logs" ON news_fetch_logs;
CREATE POLICY "Admins can read fetch logs"
  ON news_fetch_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can read verification logs" ON verification_logs;
CREATE POLICY "Admins can read verification logs"
  ON verification_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_news_fetch_logs_created_at ON news_fetch_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON verification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_created_at_desc ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_source_url ON news(source_url);
CREATE INDEX IF NOT EXISTS idx_news_is_breaking ON news(is_breaking) WHERE is_breaking = true;
CREATE INDEX IF NOT EXISTS idx_news_category_language ON news(category, language);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_source_url' 
    AND table_name = 'news'
  ) THEN
    ALTER TABLE news ADD CONSTRAINT unique_source_url UNIQUE (source_url);
  END IF;
END $$;

-- Insert sample data (only if no articles exist)
INSERT INTO news (title, summary, source, source_url, category, language, admin_status, is_breaking)
SELECT * FROM (VALUES
  ('Sample Breaking News: Global Climate Summit Reaches Agreement', 'World leaders unite on climate action with binding commitments from 195 countries in historic agreement.', 'Reuters', 'https://reuters.com/sample-climate', 'politics', 'en', 'valid'::admin_status_type, true),
  ('Tech Innovation: AI Breakthrough in Medical Diagnosis', 'New artificial intelligence system demonstrates 95% accuracy in early disease detection across multiple conditions.', 'TechCrunch', 'https://techcrunch.com/sample-ai', 'business', 'en', 'valid'::admin_status_type, false),
  ('Sports Update: Championship Final Set for This Weekend', 'Two top teams prepare for the most anticipated championship match of the season with record ticket sales.', 'ESPN', 'https://espn.com/sample-sports', 'sports', 'en', 'pending'::admin_status_type, false),
  ('Entertainment News: Film Festival Announces Award Winners', 'Independent filmmakers take center stage at this years international film festival with groundbreaking documentaries.', 'Variety', 'https://variety.com/sample-film', 'entertainment', 'en', 'valid'::admin_status_type, false),
  ('Business Report: Market Shows Strong Recovery Signs', 'Economic indicators point to sustained growth as consumer confidence reaches highest levels in two years.', 'Financial Times', 'https://ft.com/sample-market', 'business', 'en', 'pending'::admin_status_type, false)
) AS v(title, summary, source, source_url, category, language, admin_status, is_breaking)
WHERE NOT EXISTS (SELECT 1 FROM news LIMIT 1);
```

## 🎯 **Recommended Steps:**

1. **First, try Option 1:**
   ```sql
   ALTER TABLE news ADD CONSTRAINT unique_source_url UNIQUE (source_url);
   ```

2. **Then run the original third migration again**

3. **If that fails, use the complete modified script from Option 2**

## ✅ **This Will Fix:**
- ✅ The ON CONFLICT error
- ✅ Create all missing functions
- ✅ Add sample articles for testing
- ✅ Make the Admin Dashboard work properly

Try Option 1 first - it's the cleanest solution! 🚀