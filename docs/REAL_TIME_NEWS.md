# Real-Time News System

## Overview

The Real-Time News System provides live, up-to-the-minute news feeds from multiple global sources with automatic categorization, regional filtering, and breaking news alerts. The system ensures users receive the most current information with minimal latency.

## How It Works

### 1. Multi-Source News Aggregation

The system aggregates news from multiple sources:

- **News API**: Primary news source with global coverage
- **GNews API**: Secondary source for additional coverage
- **Country-specific APIs**: Regional news sources
- **User Submissions**: Community-contributed news

### 2. Real-Time Processing Pipeline

1. **Source Monitoring**: Continuous monitoring of news sources
2. **Content Fetching**: Automated content retrieval
3. **Deduplication**: Remove duplicate articles
4. **Categorization**: Automatic content categorization
5. **Translation**: Multi-language support
6. **Verification**: AI-powered fact-checking
7. **Distribution**: Real-time delivery to users

### 3. Live Updates Architecture

```typescript
// Real-time news flow
interface NewsUpdate {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: string;
  category: string;
  region: string;
  isBreaking: boolean;
  verificationStatus: 'pending' | 'verified' | 'disputed';
}
```

## Workflow

### Step 1: News Source Monitoring
```typescript
// Monitor multiple news sources
const newsSources = [
  { name: 'NewsAPI', endpoint: NEWS_API_ENDPOINT, interval: 300000 },
  { name: 'GNews', endpoint: GNEWS_API_ENDPOINT, interval: 600000 },
  { name: 'CountryNews', endpoint: COUNTRY_NEWS_ENDPOINT, interval: 900000 }
];

// Continuous monitoring
setInterval(async () => {
  for (const source of newsSources) {
    await fetchNewsFromSource(source);
  }
}, 300000); // 5 minutes
```

### Step 2: Content Processing
```typescript
// Process incoming news
const processNewsArticle = async (rawArticle) => {
  // Deduplication check
  if (await isDuplicate(rawArticle)) return;
  
  // Content enhancement
  const enhancedArticle = await enhanceContent(rawArticle);
  
  // Categorization
  const category = await categorizeContent(enhancedArticle);
  
  // Translation (if needed)
  const translatedArticle = await translateIfNeeded(enhancedArticle);
  
  // AI verification
  const verification = await verifyContent(enhancedArticle);
  
  return {
    ...enhancedArticle,
    category,
    verification,
    translatedContent: translatedArticle
  };
};
```

### Step 3: Real-Time Distribution
```typescript
// Distribute to users in real-time
const distributeNews = async (article) => {
  // Store in database
  await storeArticle(article);
  
  // Send to subscribed users
  await notifySubscribers(article);
  
  // Update breaking news alerts
  if (article.isBreaking) {
    await sendBreakingNewsAlert(article);
  }
  
  // Update category feeds
  await updateCategoryFeeds(article);
};
```

### Step 4: User Interface Updates
```typescript
// Real-time UI updates
const useRealTimeNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('news_updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'news' },
        (payload) => {
          setArticles(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, []);
  
  return { articles, loading };
};
```

## Implementation Details

### Core Components

1. **RealTimeNews Page** (`src/pages/RealTimeNews.tsx`)
   - Main real-time news interface
   - Live updates display
   - Filtering and categorization

2. **NewsAPI Hook** (`src/hooks/useNewsAPI.ts`)
   - API integration
   - Data fetching
   - Error handling

3. **Edge Functions** (`supabase/functions/`)
   - `country-news`: Country-specific news
   - `schedule-countrynews-fetch`: Automated fetching
   - `submit-news`: User submissions

4. **News Context** (`src/contexts/NewsContext.tsx`)
   - State management
   - Real-time subscriptions
   - Data synchronization

### Database Schema

```sql
-- News articles table
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  category TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  location TEXT,
  image_url TEXT,
  admin_status TEXT DEFAULT 'pending',
  is_breaking BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_category (category),
  INDEX idx_created_at (created_at),
  INDEX idx_is_breaking (is_breaking)
);

-- News fetch logs
CREATE TABLE news_fetch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_api TEXT NOT NULL,
  articles_processed INTEGER DEFAULT 0,
  articles_inserted INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Breaking news alerts
CREATE TABLE breaking_news_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID REFERENCES news(id),
  alert_type TEXT DEFAULT 'breaking',
  sent_at TIMESTAMP DEFAULT NOW(),
  recipients_count INTEGER DEFAULT 0
);
```

## Configuration

### Environment Variables
```bash
# News API Configuration
NEWS_API_KEY=your_news_api_key
GNEWS_API_KEY=your_gnews_api_key
NEWS_API_ENDPOINT=https://newsapi.org/v2
GNEWS_API_ENDPOINT=https://gnews.io/api/v4

# Fetch Configuration
NEWS_FETCH_INTERVAL=300000
BREAKING_NEWS_CHECK_INTERVAL=60000
MAX_ARTICLES_PER_FETCH=100

# Regional Configuration
DEFAULT_COUNTRY=us
SUPPORTED_COUNTRIES=us,gb,de,fr,es,it,jp,cn,in
```

### Regional Mapping
```typescript
const REGION_COUNTRY_MAP = {
  all: [],
  us: ['us'],
  eu: ['gb', 'de', 'fr', 'it', 'es', 'nl', 'be', 'pl'],
  asia: ['in', 'jp', 'cn', 'kr'],
  africa: ['ng', 'eg', 'za', 'dz'],
  americas: ['us', 'ca', 'mx', 'br']
};
```

## Performance Optimization

### Caching Strategy
- **Article Cache**: Cache recent articles
- **Category Cache**: Cache categorized content
- **Source Cache**: Cache source information
- **Translation Cache**: Cache translated content

### Deduplication
```typescript
// Smart deduplication
const isDuplicate = (article) => {
  const key = `${article.title}_${article.source}_${article.publishedAt}`;
  return seenArticles.has(key);
};
```

### Batch Processing
```typescript
// Process articles in batches
const processBatch = async (articles) => {
  const batchSize = 10;
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    await Promise.all(batch.map(processArticle));
  }
};
```

## Real-Time Features

### Live Updates
- **WebSocket Connections**: Real-time data streaming
- **Server-Sent Events**: Fallback for older browsers
- **Polling**: Backup update mechanism
- **Push Notifications**: Breaking news alerts

### Breaking News Detection
```typescript
// Detect breaking news
const detectBreakingNews = (article) => {
  const breakingKeywords = ['breaking', 'urgent', 'alert', 'emergency'];
  const title = article.title.toLowerCase();
  
  return breakingKeywords.some(keyword => title.includes(keyword)) ||
         article.isBreaking ||
         isRecentAndImportant(article);
};
```

### Regional Filtering
```typescript
// Filter by region
const filterByRegion = (articles, region) => {
  if (region === 'all') return articles;
  
  const regionCountries = REGION_COUNTRY_MAP[region] || [];
  return articles.filter(article => 
    regionCountries.includes(article.country_code)
  );
};
```

## Monitoring & Analytics

### Real-Time Metrics
- **Articles per minute**: Processing rate
- **Source performance**: Success rates by source
- **Category distribution**: Content categorization
- **User engagement**: Read time and interactions

### Performance Monitoring
- **Response times**: API response monitoring
- **Error rates**: Source failure tracking
- **Cache hit rates**: Caching efficiency
- **User experience**: Load times and updates

### Alert System
- **Source failures**: Immediate notification
- **High error rates**: Performance alerts
- **Breaking news**: Real-time alerts
- **System health**: Overall system status

## Error Handling

### Graceful Degradation
1. **Primary Source Fails**: Switch to backup
2. **All Sources Fail**: Show cached content
3. **Network Issues**: Offline mode with cached data
4. **API Limits**: Rate limiting and queuing

### Recovery Strategies
- **Automatic Retry**: Exponential backoff
- **Source Rotation**: Switch between sources
- **Cache Fallback**: Use cached content
- **User Notification**: Inform users of issues

## Debug Tools

### Real-Time Debug Panel
- **Live Feed Monitoring**: Real-time article flow
- **Source Health**: API status monitoring
- **Performance Metrics**: Response time tracking
- **Error Logs**: Detailed error information

### Development Tools
- **Mock Data**: Test with sample articles
- **Source Simulation**: Simulate news sources
- **Performance Testing**: Load testing tools
- **Network Simulation**: Test network conditions

## Future Enhancements

1. **Advanced Features**
   - **AI Content Generation**: Automated summaries
   - **Personalization**: User preference learning
   - **Social Integration**: Social media feeds
   - **Video Content**: Video news integration

2. **Performance Improvements**
   - **CDN Integration**: Global content delivery
   - **Edge Computing**: Local processing
   - **Predictive Loading**: Anticipate user needs
   - **Optimized Caching**: Smart cache management

3. **User Experience**
   - **Customizable Feeds**: Personal news feeds
   - **Offline Support**: Offline reading mode
   - **Voice Integration**: Voice news reading
   - **Augmented Reality**: AR news visualization 