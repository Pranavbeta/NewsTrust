/*
  # Create UI translations table for brand voice caching

  1. New Table
    - `ui_translations`
      - `id` (uuid, primary key)
      - `translation_key` (text)
      - `target_language` (text)
      - `translated_text` (text)
      - `context` (text)
      - `source` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for UI translation system
*/

-- Create UI translations table
CREATE TABLE IF NOT EXISTS ui_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_key text NOT NULL,
  target_language text NOT NULL,
  translated_text text NOT NULL,
  context text DEFAULT 'general',
  source text DEFAULT 'lingo-api',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(translation_key, target_language)
);

-- Enable RLS
ALTER TABLE ui_translations ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ui_translations_key_lang ON ui_translations(translation_key, target_language);
CREATE INDEX IF NOT EXISTS idx_ui_translations_context ON ui_translations(context);
CREATE INDEX IF NOT EXISTS idx_ui_translations_updated_at ON ui_translations(updated_at DESC);

-- Policy for service role (API access)
CREATE POLICY "Service role can manage UI translations"
  ON ui_translations
  FOR ALL
  TO service_role
  USING (true);

-- Policy for authenticated users to read UI translations
CREATE POLICY "Users can read UI translations"
  ON ui_translations
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE TRIGGER update_ui_translations_updated_at
  BEFORE UPDATE ON ui_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to cleanup old UI translations (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_ui_translations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ui_translations
  WHERE updated_at < now() - interval '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;