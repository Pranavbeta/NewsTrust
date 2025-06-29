# Admin Dashboard

## Overview

The Admin Dashboard is a comprehensive management interface that provides administrators with tools to monitor, manage, and optimize the NewsTrust platform. It includes real-time analytics, content moderation, translation management, and system health monitoring.

## How It Works

### 1. Multi-Tab Interface

The dashboard is organized into specialized tabs:

- **Overview**: Platform statistics and recent activity
- **Translation**: Translation system management and monitoring
- **Hook Debug**: Translation hook debugging tools
- **Debug**: System debugging and testing
- **News API**: News API status and management
- **Articles**: Article management and moderation
- **Users**: User management and analytics
- **Comments**: Comment moderation tools
- **Reports**: User report management
- **Submissions**: News submission moderation

### 2. Real-Time Monitoring

The dashboard provides real-time monitoring of:

- **System Performance**: Response times, error rates, cache efficiency
- **User Activity**: Active users, engagement metrics, usage patterns
- **Content Quality**: Verification rates, translation accuracy, moderation status
- **Platform Health**: API status, database performance, service availability

### 3. Administrative Actions

Administrators can perform various actions:

- **Content Moderation**: Approve/reject articles, moderate comments
- **User Management**: View user profiles, manage permissions
- **System Configuration**: Update settings, manage translations
- **Performance Optimization**: Monitor and optimize system performance

## Workflow

### Step 1: Access Control
```typescript
// Check admin permissions
const AdminDashboard = () => {
  const { user, profile } = useAuth();
  
  if (!user || !profile?.is_admin) {
    return <AccessDenied />;
  }
  
  return <DashboardContent />;
};
```

### Step 2: Data Loading
```typescript
// Load dashboard data
const loadDashboardData = async () => {
  const [stats, articles, users, submissions] = await Promise.all([
    fetchPlatformStats(),
    fetchRecentArticles(),
    fetchUserAnalytics(),
    fetchPendingSubmissions()
  ]);
  
  return { stats, articles, users, submissions };
};
```

### Step 3: Real-Time Updates
```typescript
// Subscribe to real-time updates
useEffect(() => {
  const subscription = supabase
    .channel('admin_updates')
    .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
      updateDashboardData(payload);
    })
    .subscribe();
    
  return () => subscription.unsubscribe();
}, []);
```

### Step 4: Administrative Actions
```typescript
// Handle admin actions
const handleAdminAction = async (action, data) => {
  switch (action) {
    case 'approve_article':
      await approveArticle(data.articleId);
      break;
    case 'reject_submission':
      await rejectSubmission(data.submissionId, data.reason);
      break;
    case 'moderate_comment':
      await moderateComment(data.commentId, data.action);
      break;
    case 'update_translation':
      await updateTranslation(data.key, data.translations);
      break;
  }
  
  refreshDashboardData();
};
```

## Implementation Details

### Core Components

1. **AdminDashboard Page** (`src/pages/AdminDashboard.tsx`)
   - Main dashboard interface
   - Tab navigation
   - Data management

2. **Admin Components**
   - **NewsAPIStatus**: News API monitoring
   - **EdgeFunctionTester**: Edge function testing
   - **TranslationDebugPanel**: Translation debugging
   - **TranslationDebugger**: Hook debugging

3. **Admin Services**
   - **User Management**: User analytics and management
   - **Content Moderation**: Article and comment moderation
   - **System Monitoring**: Performance and health monitoring
   - **Translation Management**: Translation system management

### Database Schema

```sql
-- Admin activity logs
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  action_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- System metrics
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Translation management
CREATE TABLE translation_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_key TEXT NOT NULL,
  english_text TEXT NOT NULL,
  translations JSONB NOT NULL,
  status TEXT DEFAULT 'active',
  last_updated TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);
```

## Configuration

### Environment Variables
```bash
# Admin Configuration
ADMIN_EMAIL_DOMAINS=admin@newstrust.com
ADMIN_PERMISSIONS=full_access
ADMIN_DASHBOARD_ENABLED=true

# Monitoring Configuration
METRICS_COLLECTION_ENABLED=true
METRICS_RETENTION_DAYS=30
ALERT_THRESHOLDS=high_error_rate,low_performance

# Debug Configuration
DEBUG_MODE_ENABLED=false
DEBUG_LOG_LEVEL=info
DEBUG_DATA_RETENTION=7
```

### Permission Levels
- **Super Admin**: Full system access
- **Content Moderator**: Article and comment moderation
- **Translation Manager**: Translation system management
- **System Monitor**: Performance monitoring only

## Performance Monitoring

### Real-Time Metrics
- **Response Times**: API and database response times
- **Error Rates**: Error frequency by service
- **Cache Hit Rates**: Translation and content cache efficiency
- **User Engagement**: Active users, session duration

### System Health
- **API Status**: External API availability
- **Database Performance**: Query performance and connection health
- **Service Availability**: All system services status
- **Resource Usage**: CPU, memory, and storage usage

### Alert System
- **Performance Alerts**: When metrics exceed thresholds
- **Error Alerts**: When error rates spike
- **Service Alerts**: When services become unavailable
- **Security Alerts**: When suspicious activity is detected

## Content Moderation

### Article Moderation
```typescript
// Article moderation workflow
const moderateArticle = async (articleId, action, reason) => {
  const article = await fetchArticle(articleId);
  
  switch (action) {
    case 'approve':
      await approveArticle(articleId);
      await notifyUser(article.userId, 'Article approved');
      break;
    case 'reject':
      await rejectArticle(articleId, reason);
      await notifyUser(article.userId, 'Article rejected', reason);
      break;
    case 'flag':
      await flagArticle(articleId, reason);
      await notifyUser(article.userId, 'Article flagged for review');
      break;
  }
  
  await logAdminAction('moderate_article', { articleId, action, reason });
};
```

### Comment Moderation
```typescript
// Comment moderation with AI assistance
const moderateComment = async (commentId, action) => {
  const comment = await fetchComment(commentId);
  
  // AI toxicity check
  const toxicityResult = await checkToxicity(comment.content);
  
  if (toxicityResult.isToxic) {
    await flagComment(commentId, toxicityResult.reason);
  }
  
  await logAdminAction('moderate_comment', { commentId, action });
};
```

## Translation Management

### Translation Monitoring
- **Cache Performance**: Translation cache hit rates
- **Service Health**: Translation service availability
- **Accuracy Metrics**: Translation quality assessment
- **User Preferences**: Language usage patterns

### Translation Tools
```typescript
// Translation debugging tools
const debugTranslation = async (text, targetLanguage) => {
  const results = await Promise.all([
    callLingvanexAPI(text, 'en', targetLanguage),
    callDeepLAPI(text, 'en', targetLanguage),
    callLingoAPI(text, 'en', targetLanguage)
  ]);
  
  return {
    original: text,
    targetLanguage,
    results: {
      lingvanex: results[0],
      deepl: results[1],
      lingo: results[2]
    }
  };
};
```

## User Management

### User Analytics
- **Registration Trends**: New user signups over time
- **Engagement Metrics**: User activity and interaction patterns
- **Geographic Distribution**: User locations and language preferences
- **Feature Usage**: Most and least used features

### User Actions
```typescript
// User management actions
const manageUser = async (userId, action) => {
  switch (action) {
    case 'suspend':
      await suspendUser(userId);
      break;
    case 'activate':
      await activateUser(userId);
      break;
    case 'delete':
      await deleteUser(userId);
      break;
    case 'change_role':
      await changeUserRole(userId, newRole);
      break;
  }
  
  await logAdminAction('manage_user', { userId, action });
};
```

## Debug Tools

### System Debugging
- **Edge Function Testing**: Test all edge functions
- **API Health Checks**: Verify external API connectivity
- **Database Queries**: Test database performance
- **Cache Testing**: Verify caching functionality

### Performance Profiling
```typescript
// Performance profiling tools
const profilePerformance = async () => {
  const metrics = {
    translationSpeed: await measureTranslationSpeed(),
    verificationTime: await measureVerificationTime(),
    cacheEfficiency: await measureCacheEfficiency(),
    databasePerformance: await measureDatabasePerformance()
  };
  
  return metrics;
};
```

## Security Features

### Access Control
- **Role-Based Access**: Different permission levels
- **Session Management**: Secure admin sessions
- **Action Logging**: All admin actions logged
- **IP Restrictions**: Admin access from specific IPs

### Audit Trail
```typescript
// Comprehensive audit logging
const logAdminAction = async (action, data) => {
  await supabase.from('admin_actions').insert({
    admin_id: currentUser.id,
    action_type: action,
    target_type: data.targetType,
    target_id: data.targetId,
    action_data: data,
    ip_address: getClientIP(),
    user_agent: getUserAgent()
  });
};
```

## Future Enhancements

1. **Advanced Analytics**
   - **Predictive Analytics**: Forecast user behavior and system needs
   - **Machine Learning**: AI-powered content moderation
   - **Real-Time Dashboards**: Live system monitoring
   - **Custom Reports**: User-defined analytics reports

2. **Enhanced Moderation**
   - **Automated Moderation**: AI-powered content filtering
   - **Bulk Actions**: Process multiple items simultaneously
   - **Moderation Queues**: Organized content review system
   - **Quality Scoring**: Content quality assessment

3. **System Optimization**
   - **Performance Tuning**: Automatic system optimization
   - **Resource Management**: Intelligent resource allocation
   - **Load Balancing**: Dynamic load distribution
   - **Auto-scaling**: Automatic system scaling 