/*
  # Create translation cache table for Lingo.dev translations

  1. New Table
    - `translation_cache`
      - `id` (uuid, primary key)
      - `source_text` (text)
      - `source_language` (text)
      - `target_language` (text)
      - `translated_text` (text)
      - `translation_type` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for caching system
*/

-- Create translation cache table
CREATE TABLE IF NOT EXISTS translation_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text text NOT NULL,
  source_language text NOT NULL DEFAULT 'en',
  target_language text NOT NULL,
  translated_text text NOT NULL,
  translation_type text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_translation_cache_lookup ON translation_cache(source_language, target_language, md5(source_text));
CREATE INDEX IF NOT EXISTS idx_translation_cache_created_at ON translation_cache(created_at DESC);

-- Policy for translation system (service role only)
CREATE POLICY "Service role can manage translation cache"
  ON translation_cache
  FOR ALL
  TO service_role
  USING (true);

-- Policy for authenticated users to read cached translations
CREATE POLICY "Users can read translation cache"
  ON translation_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to cleanup old translations (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_translations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM translation_cache
  WHERE created_at < now() - interval '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;