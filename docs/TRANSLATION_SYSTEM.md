# Translation System

## Overview

The Translation System in NewsTrust provides comprehensive multilingual support through a hybrid approach that combines multiple translation services with intelligent caching strategies. The system supports 50+ languages and ensures efficient, accurate translations for both news content and user interface elements.

## How It Works

### 1. Hybrid Translation Architecture

The system uses a multi-layered approach:

1. **In-Memory Cache**: Fastest access for frequently used translations
2. **Database Cache**: Persistent storage for all translations
3. **Translation Services**: Multiple providers for redundancy
4. **Fallback System**: Graceful degradation when services fail

### 2. Translation Providers

#### Primary Services
- **Lingvanex**: Primary translation service with high accuracy
- **DeepL**: High-quality translations for supported languages
- **Lingo**: Fallback service for broader language coverage

#### Fallback Options
- **Mock Service**: Development and testing translations
- **Brand Voice**: Pre-built translations for UI elements

### 3. Caching Strategy

#### Two-Tier Caching
```typescript
// 1. In-Memory Cache (Fastest)
const memoryCache = new Map<string, string>();

// 2. Database Cache (Persistent)
const dbCache = await supabase
  .from('translation_cache')
  .select('translated_text')
  .eq('original_text_hash', hash)
  .eq('target_language', language);
```

#### Cache Key Generation
```typescript
function generateCacheKey(text: string, fromLang: string, toLang: string, type: string) {
  return `${hash(text)}_${fromLang}_${toLang}_${type}`;
}
```

## Workflow

### Step 1: Translation Request
```typescript
// User requests translation
const translationRequest = {
  text: "Original text to translate",
  fromLanguage: "en",
  toLanguage: "es",
  type: "news" // news, ui, chat
};
```

### Step 2: Cache Check
```typescript
// Check in-memory cache first
const memoryResult = memoryCache.get(cacheKey);
if (memoryResult) {
  return { translatedText: memoryResult, cached: true, service: 'memory' };
}

// Check database cache
const dbResult = await checkDatabaseCache(cacheKey);
if (dbResult) {
  memoryCache.set(cacheKey, dbResult);
  return { translatedText: dbResult, cached: true, service: 'database' };
}
```

### Step 3: Service Translation
```typescript
// Try primary service (Lingvanex)
try {
  const result = await callLingvanexAPI(text, fromLang, toLang);
  await cacheTranslation(cacheKey, result);
  return { translatedText: result, cached: false, service: 'lingvanex' };
} catch (error) {
  // Fallback to DeepL
  try {
    const result = await callDeepLAPI(text, fromLang, toLang);
    await cacheTranslation(cacheKey, result);
    return { translatedText: result, cached: false, service: 'deepl' };
  } catch (error) {
    // Final fallback to mock service
    const result = createMockTranslation(text, toLang);
    await cacheTranslation(cacheKey, result);
    return { translatedText: result, cached: false, service: 'mock' };
  }
}
```

### Step 4: Cache Storage
```typescript
// Store in both memory and database
memoryCache.set(cacheKey, translatedText);
await supabase.from('translation_cache').upsert({
  original_text_hash: hash,
  original_text: text,
  translated_text: translatedText,
  source_language: fromLang,
  target_language: toLang,
  translation_type: type,
  service_used: service,
  created_at: new Date().toISOString()
});
```

## Implementation Details

### Core Components

1. **HybridTranslationService** (`src/lib/hybridTranslation.ts`)
   - Main translation orchestration
   - Service selection logic
   - Cache management

2. **BrandVoiceTranslationService** (`src/lib/brandVoiceTranslation.ts`)
   - UI element translations
   - Pre-built translation management
   - Context-aware translations

3. **Translation Hooks** (`src/hooks/useTranslation.ts`)
   - React integration
   - State management
   - Performance optimization

4. **Edge Function** (`supabase/functions/translate/index.ts`)
   - Server-side translation
   - API rate limiting
   - Error handling

### Database Schema

```sql
-- Translation cache table
CREATE TABLE translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_text_hash TEXT NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  translation_type TEXT NOT NULL,
  service_used TEXT NOT NULL,
  confidence_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(original_text_hash, target_language, translation_type)
);

-- UI translations table
CREATE TABLE ui_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_key TEXT NOT NULL UNIQUE,
  english_text TEXT NOT NULL,
  translations JSONB NOT NULL,
  context TEXT,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

## Configuration

### Environment Variables
```bash
# Translation Service Keys
LINGVANEX_API_KEY=your_lingvanex_key
DEEPL_API_KEY=your_deepl_key
LINGO_API_KEY=your_lingo_key

# Cache Configuration
TRANSLATION_CACHE_TTL=86400
MEMORY_CACHE_SIZE=1000
DATABASE_CACHE_ENABLED=true

# Service Configuration
PRIMARY_TRANSLATION_SERVICE=lingvanex
FALLBACK_SERVICE=deepl
MOCK_SERVICE_ENABLED=true
```

### Service Priority
1. **Lingvanex** (Primary)
2. **DeepL** (High Quality)
3. **Lingo** (Broad Coverage)
4. **Mock** (Development)

## Performance Optimization

### Caching Benefits
- **Memory Cache**: ~1ms response time
- **Database Cache**: ~10ms response time
- **Service Translation**: ~500ms response time

### Batch Processing
```typescript
// Translate multiple texts efficiently
const batchResult = await translationService.translateBatch(
  texts,
  fromLanguage,
  toLanguage
);
```

### Progress Tracking
```typescript
// Real-time progress updates
const progress = {
  current: 3,
  total: 10,
  language: 'es',
  status: 'translating'
};
```

## Language Support

### Supported Languages
- **European**: English, Spanish, French, German, Italian, Portuguese
- **Asian**: Chinese, Japanese, Korean, Hindi, Thai, Vietnamese
- **Middle Eastern**: Arabic, Hebrew, Turkish, Persian
- **African**: Swahili, Yoruba, Zulu, Amharic
- **And 40+ more languages**

### Language Detection
```typescript
// Automatic language detection
const detectedLanguage = await detectLanguage(text);
```

## Monitoring & Analytics

### Metrics Tracked
- Translation success rates by service
- Cache hit rates
- Response times
- Error rates by language
- Service availability

### Performance Dashboard
- Real-time translation statistics
- Service health monitoring
- Cache efficiency metrics
- User language preferences

## Error Handling

### Graceful Degradation
1. **Primary Service Fails**: Switch to fallback
2. **All Services Fail**: Use cached translations
3. **No Cache Available**: Return original text
4. **System Error**: Show user-friendly message

### Error Types
- **API Rate Limits**: Automatic retry with backoff
- **Network Errors**: Service switching
- **Invalid Content**: Content validation
- **Language Unsupported**: Fallback to similar language

## Debug Tools

### Translation Debug Panel
- Real-time translation testing
- Service performance comparison
- Cache hit rate analysis
- Error log viewing

### Development Tools
- Mock translation generation
- Cache clearing utilities
- Service health checks
- Performance profiling

## Future Enhancements

1. **Advanced Features**
   - Neural machine translation
   - Context-aware translations
   - Domain-specific models
   - Real-time learning

2. **Performance Improvements**
   - WebAssembly acceleration
   - GPU-accelerated translation
   - Distributed caching
   - CDN integration

3. **User Experience**
   - Offline translation support
   - Voice translation
   - Image text translation
   - Real-time conversation translation 