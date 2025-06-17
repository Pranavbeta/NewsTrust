# News API Integration Setup

This document explains how to set up the automated news fetching system that connects to NewsAPI and GNews to fetch top headlines every 30 minutes.

## Features

- **Automated News Fetching**: Fetches news from NewsAPI and GNews every 30 minutes
- **Multi-language Support**: Supports English, Spanish, French, and German
- **Category Classification**: Automatically categorizes articles (politics, business, sports, entertainment, conflicts)
- **Breaking News Detection**: Identifies breaking news based on keywords
- **Location Extraction**: Attempts to extract location information from articles
- **Duplicate Prevention**: Prevents duplicate articles from being saved
- **Admin Dashboard**: Monitor fetch status, statistics, and logs

## Setup Instructions

### 1. Get API Keys

#### NewsAPI (Primary Source)
1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier: 1,000 requests/day

#### GNews (Secondary Source)
1. Visit [GNews.io](https://gnews.io/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier: 100 requests/day

### 2. Configure Supabase Edge Functions

Add the API keys to your Supabase project:

```bash
# Using Supabase CLI
supabase secrets set NEWS_API_KEY=your_newsapi_key_here
supabase secrets set GNEWS_API_KEY=your_gnews_api_key_here
```

Or add them through the Supabase Dashboard:
1. Go to Project Settings → Edge Functions
2. Add the environment variables

### 3. Deploy Edge Functions

The following functions need to be deployed:

- `fetch-news`: Main function that fetches and processes news
- `schedule-news-fetch`: Scheduler function for automated fetching
- `verify-news`: Enhanced with better error handling

### 4. Set Up Automated Scheduling

#### Option A: Using Supabase Cron (Recommended)
```sql
-- Add to your Supabase SQL editor
SELECT cron.schedule(
  'fetch-news-every-30-minutes',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/schedule-news-fetch',
    headers := '{"Authorization": "Bearer your-service-role-key"}'::jsonb
  );
  $$
);
```

#### Option B: External Cron Service
Use services like:
- GitHub Actions (free)
- Vercel Cron
- Railway Cron
- Any server with cron jobs

Example GitHub Action (`.github/workflows/fetch-news.yml`):
```yaml
name: Fetch News
on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  fetch-news:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger News Fetch
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            https://your-project.supabase.co/functions/v1/schedule-news-fetch
```

### 5. Database Migration

Run the cleanup function migration:

```sql
-- This creates the cleanup function and additional indexes
-- File: supabase/migrations/create_cleanup_function.sql
```

## How It Works

### 1. News Fetching Process

1. **Scheduled Trigger**: Every 30 minutes, the scheduler checks if a fetch is needed
2. **API Calls**: Fetches from NewsAPI and GNews across multiple categories and languages
3. **Processing**: Each article is processed for:
   - Category classification using keyword matching
   - Breaking news detection
   - Location extraction
   - Duplicate checking
4. **Database Storage**: Valid articles are saved to the `news` table
5. **Cleanup**: Old articles are removed to maintain performance

### 2. Category Classification

Articles are automatically categorized based on content analysis:

- **Politics**: election, government, president, minister, parliament, etc.
- **Business**: stock, market, economy, business, company, financial, etc.
- **Sports**: football, basketball, tennis, olympics, championship, etc.
- **Entertainment**: movie, actor, celebrity, music, concert, etc.
- **Conflicts**: war, conflict, military, attack, violence, crisis, etc.

### 3. Breaking News Detection

Articles are marked as breaking news if they contain keywords like:
- breaking, urgent, just in, developing, live, update, emergency, alert

### 4. Language Support

Currently supports:
- English (en)
- Spanish (es)
- French (fr)
- German (de)

Additional languages can be added by updating the `LANGUAGE_MAPPING` in the edge function.

## Admin Dashboard Features

Access the admin dashboard to monitor the news fetching system:

1. **Statistics**: View total articles, breaking news count, language distribution
2. **Category Breakdown**: See articles by category
3. **Fetch Logs**: Monitor recent fetch attempts and their success/failure status
4. **Manual Trigger**: Manually trigger a news fetch
5. **Error Monitoring**: View error messages and troubleshoot issues

## Rate Limiting & Costs

### NewsAPI
- Free: 1,000 requests/day
- Developer: $449/month for 1M requests
- Rate limit: 1 request per second

### GNews
- Free: 100 requests/day
- Basic: $9/month for 10,000 requests
- Rate limit: 10 requests per minute

### Optimization Tips

1. **Reduce Categories**: Limit to essential categories to save API calls
2. **Reduce Languages**: Focus on your target languages
3. **Increase Interval**: Change from 30 minutes to 1 hour if needed
4. **Use Caching**: Implement caching for repeated requests

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify keys are correctly set in Supabase secrets
   - Check API key validity and quotas

2. **Rate Limiting**
   - Reduce fetch frequency
   - Implement exponential backoff
   - Monitor API usage

3. **Database Errors**
   - Check RLS policies
   - Verify table structure
   - Monitor database performance

4. **Function Timeouts**
   - Reduce batch sizes
   - Optimize database queries
   - Add error handling

### Monitoring

Check the admin dashboard regularly for:
- Fetch success rates
- Error patterns
- Article quality
- Database performance

## Future Enhancements

1. **Additional Sources**: Add more news APIs (BBC, Reuters, etc.)
2. **AI Enhancement**: Use GPT/Claude for better categorization
3. **Sentiment Analysis**: Add article sentiment scoring
4. **Image Processing**: Analyze and categorize article images
5. **Real-time Updates**: Implement WebSocket for live updates
6. **Content Filtering**: Add content quality filters
7. **Personalization**: User-specific news preferences

## Support

For issues or questions:
1. Check the admin dashboard for error logs
2. Review Supabase Edge Function logs
3. Monitor API usage and quotas
4. Check database performance metrics