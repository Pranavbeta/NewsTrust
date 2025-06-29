# AI Verification System

## Overview

The AI Verification System is a core component of NewsTrust that automatically analyzes news content for credibility, authenticity, and potential misinformation using advanced AI models and machine learning algorithms.

## How It Works

### 1. Content Analysis Pipeline

The AI verification process follows a multi-stage pipeline:

1. **Content Extraction**: Extracts text content from news articles
2. **Language Detection**: Identifies the source language
3. **Feature Analysis**: Analyzes various content features
4. **Credibility Scoring**: Generates a confidence score (0-100)
5. **Flag Detection**: Identifies potential red flags
6. **Source Verification**: Cross-references with known sources

### 2. Analysis Features

The system analyzes multiple aspects of content:

- **Language Patterns**: Sensationalist language detection
- **Source Reliability**: Known source verification
- **Content Length**: Adequacy of information provided
- **Factual Claims**: Verification of specific claims
- **Temporal Consistency**: Timeline validation
- **Cross-Reference**: Multiple source verification

### 3. Credibility Scoring

Scores are calculated based on:

- **Base Score**: 70 points (neutral starting point)
- **Positive Indicators**: +10 points for reliable language
- **Negative Indicators**: -30 points for sensationalist content
- **Content Quality**: -20 points for insufficient content
- **Source Verification**: +15 points for verified sources

## Workflow

### Step 1: Content Submission
```typescript
// User submits news for verification
const verificationRequest = {
  title: "Article Title",
  content: "Article content...",
  sourceUrl: "https://example.com/article",
  language: "en"
};
```

### Step 2: AI Analysis
```typescript
// AI service analyzes content
const analysis = await aiVerificationService.verifyNews(
  title,
  content,
  sourceUrl
);
```

### Step 3: Result Processing
```typescript
// Process and categorize results
const result = {
  credibilityScore: 85, // 0-100
  verdict: "valid", // valid/fake/unclear
  explanation: "Detailed analysis...",
  flags: ["Contains reliable sources"],
  sources: ["Reuters", "AP", "BBC"]
};
```

### Step 4: Blockchain Recording
```typescript
// Record verification on blockchain
const blockchainProof = await blockchainService.recordVerification(
  newsId,
  verdict,
  verifiedBy
);
```

## Implementation Details

### Core Components

1. **AIVerificationService** (`src/lib/aiVerification.ts`)
   - Main verification logic
   - Mock AI implementation
   - Result caching

2. **VerificationSystem Component** (`src/components/VerificationSystem.tsx`)
   - UI for verification interface
   - User interaction handling
   - Result display

3. **Edge Function** (`supabase/functions/verify-news/index.ts`)
   - Server-side verification
   - Database integration
   - Caching logic

### Database Schema

```sql
-- AI verification results
CREATE TABLE ai_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID REFERENCES news(id),
  verdict TEXT CHECK (verdict IN ('valid', 'fake', 'unclear')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  explanation TEXT,
  sources_checked TEXT[],
  flags TEXT[],
  ai_model TEXT,
  content_hash TEXT,
  language TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Verification logs
CREATE TABLE verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  url TEXT,
  language TEXT,
  credibility_score INTEGER,
  analysis TEXT,
  recommendation TEXT,
  sources_checked TEXT[],
  flags TEXT[],
  content_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Configuration

### Environment Variables
```bash
# AI Model Configuration
AI_MODEL_PROVIDER=openai
AI_MODEL_VERSION=gpt-4
AI_VERIFICATION_THRESHOLD=70

# Caching Configuration
VERIFICATION_CACHE_TTL=3600
VERIFICATION_CACHE_SIZE=1000
```

### Thresholds
- **Valid**: Score ≥ 70
- **Unclear**: Score 40-69
- **Fake**: Score < 40

## Performance Optimization

### Caching Strategy
- **Content Hash Caching**: Prevents duplicate analysis
- **Result Caching**: Stores verification results
- **TTL Management**: Automatic cache expiration

### Batch Processing
- Multiple articles processed simultaneously
- Queue management for high-volume requests
- Rate limiting to prevent abuse

## Monitoring & Analytics

### Metrics Tracked
- Verification accuracy rates
- Processing times
- Cache hit rates
- Error rates by content type

### Logging
- Detailed verification logs
- Performance metrics
- Error tracking
- User interaction analytics

## Future Enhancements

1. **Advanced AI Models**
   - GPT-4 integration
   - Custom fine-tuned models
   - Multi-modal analysis (text + images)

2. **Enhanced Features**
   - Fact-checking against databases
   - Image verification
   - Video content analysis
   - Social media integration

3. **Real-time Updates**
   - Live fact-checking
   - Continuous learning
   - Adaptive thresholds

## Troubleshooting

### Common Issues

1. **Low Accuracy Scores**
   - Check content quality
   - Verify source reliability
   - Review language patterns

2. **Slow Processing**
   - Check cache configuration
   - Monitor API rate limits
   - Optimize batch sizes

3. **False Positives/Negatives**
   - Adjust scoring thresholds
   - Update flag detection rules
   - Review training data

### Debug Tools

- **Translation Debug Panel**: Monitor verification performance
- **Admin Dashboard**: View verification statistics
- **Log Analysis**: Detailed error tracking 