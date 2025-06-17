/*
  # Enhanced Features Database Schema

  1. New Tables
    - `ai_verifications` - Store AI verification results
    - `payments` - Track premium verification payments
    - `blockchain_logs` - Record blockchain verification proofs
    - `country_preferences` - User country preferences
    - `comment_moderation` - Comment toxicity scores

  2. Enhanced Tables
    - Add AI verification fields to news table
    - Add payment status fields
    - Add blockchain verification references

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- AI Verifications Table
CREATE TABLE IF NOT EXISTS ai_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id uuid REFERENCES news(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  source_url text,
  verdict text CHECK (verdict IN ('valid', 'fake', 'unclear')) NOT NULL,
  confidence integer CHECK (confidence >= 0 AND confidence <= 100) NOT NULL,
  explanation text NOT NULL,
  sources_checked text[] DEFAULT '{}',
  flags text[] DEFAULT '{}',
  reasoning text,
  ai_model text DEFAULT 'unknown',
  created_at timestamptz DEFAULT now()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  news_id uuid REFERENCES news(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text DEFAULT 'usd',
  status text CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  type text DEFAULT 'verification',
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blockchain Logs Table
CREATE TABLE IF NOT EXISTS blockchain_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id uuid REFERENCES news(id) ON DELETE CASCADE,
  transaction_id text UNIQUE NOT NULL,
  block_number bigint,
  verdict text NOT NULL,
  verified_by text NOT NULL,
  metadata jsonb DEFAULT '{}',
  network text DEFAULT 'algorand-mainnet',
  created_at timestamptz DEFAULT now()
);

-- Country Preferences Table
CREATE TABLE IF NOT EXISTS country_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  country_code text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, country_code)
);

-- Comment Moderation Table
CREATE TABLE IF NOT EXISTS comment_moderation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  toxicity_score decimal(3,2) CHECK (toxicity_score >= 0 AND toxicity_score <= 1),
  moderation_result jsonb DEFAULT '{}',
  service_used text DEFAULT 'perspective_api',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_moderation ENABLE ROW LEVEL SECURITY;

-- AI Verifications Policies
CREATE POLICY "Users can read AI verifications"
  ON ai_verifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage AI verifications"
  ON ai_verifications
  FOR ALL
  TO service_role
  USING (true);

-- Payments Policies
CREATE POLICY "Users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payments"
  ON payments
  FOR ALL
  TO service_role
  USING (true);

-- Blockchain Logs Policies
CREATE POLICY "Users can read blockchain logs"
  ON blockchain_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage blockchain logs"
  ON blockchain_logs
  FOR ALL
  TO service_role
  USING (true);

-- Country Preferences Policies
CREATE POLICY "Users can manage own country preferences"
  ON country_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Comment Moderation Policies
CREATE POLICY "Users can read comment moderation"
  ON comment_moderation
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage comment moderation"
  ON comment_moderation
  FOR ALL
  TO service_role
  USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_verifications_news_id ON ai_verifications(news_id);
CREATE INDEX IF NOT EXISTS idx_ai_verifications_verdict ON ai_verifications(verdict);
CREATE INDEX IF NOT EXISTS idx_ai_verifications_created_at ON ai_verifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_news_id ON payments(news_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_blockchain_logs_news_id ON blockchain_logs(news_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_logs_transaction_id ON blockchain_logs(transaction_id);

CREATE INDEX IF NOT EXISTS idx_country_preferences_user_id ON country_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_country_preferences_country_code ON country_preferences(country_code);

CREATE INDEX IF NOT EXISTS idx_comment_moderation_comment_id ON comment_moderation(comment_id);

-- Add triggers for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add new columns to existing tables
ALTER TABLE news ADD COLUMN IF NOT EXISTS ai_verification_id uuid REFERENCES ai_verifications(id);
ALTER TABLE news ADD COLUMN IF NOT EXISTS blockchain_verification_id uuid REFERENCES blockchain_logs(id);
ALTER TABLE news ADD COLUMN IF NOT EXISTS is_premium_verified boolean DEFAULT false;
ALTER TABLE news ADD COLUMN IF NOT EXISTS country_code text;

ALTER TABLE comments ADD COLUMN IF NOT EXISTS moderation_score decimal(3,2);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_news_ai_verification_id ON news(ai_verification_id);
CREATE INDEX IF NOT EXISTS idx_news_blockchain_verification_id ON news(blockchain_verification_id);
CREATE INDEX IF NOT EXISTS idx_news_is_premium_verified ON news(is_premium_verified);
CREATE INDEX IF NOT EXISTS idx_news_country_code ON news(country_code);

CREATE INDEX IF NOT EXISTS idx_comments_moderation_score ON comments(moderation_score);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved);