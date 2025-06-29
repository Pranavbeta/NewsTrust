# Community Features

## Overview

The Community Features in NewsTrust enable users to actively participate in the news verification process through voting, commenting, and submitting news articles. These features create a collaborative environment where users can contribute to the platform's credibility and accuracy.

## How It Works

### 1. User Voting System

Users can vote on news articles to indicate their assessment of credibility:

- **Valid**: Article appears to be factual and reliable
- **Fake**: Article contains misinformation or is unreliable
- **Not Sure**: User is uncertain about the article's credibility

### 2. Community Comments

Users can leave comments to:
- Share additional context or sources
- Discuss the article's credibility
- Provide verification insights
- Engage in constructive dialogue

### 3. News Submissions

Users can submit news articles for:
- Community verification
- Fact-checking
- Publication consideration
- Source validation

## Workflow

### Step 1: User Authentication
```typescript
// Check user authentication for community features
const useCommunityFeatures = () => {
  const { user } = useAuth();
  
  const canVote = !!user;
  const canComment = !!user;
  const canSubmit = !!user;
  
  return { canVote, canComment, canSubmit };
};
```

### Step 2: Voting Process
```typescript
// Handle user voting
const handleVote = async (articleId: string, vote: 'valid' | 'fake' | 'not_sure') => {
  if (!user) return;
  
  try {
    // Submit vote to database
    await supabase.from('votes').upsert({
      user_id: user.id,
      news_id: articleId,
      vote: vote,
      created_at: new Date().toISOString()
    });
    
    // Update local state
    updateArticleVotes(articleId, vote);
    
    // Trigger verification if threshold reached
    if (shouldTriggerVerification(articleId)) {
      await triggerAIVerification(articleId);
    }
  } catch (error) {
    console.error('Voting failed:', error);
  }
};
```

### Step 3: Comment System
```typescript
// Handle comment submission
const handleComment = async (articleId: string, content: string) => {
  if (!user) return;
  
  // AI toxicity check
  const toxicityResult = await checkToxicity(content);
  
  if (toxicityResult.isToxic) {
    throw new Error('Comment contains inappropriate content');
  }
  
  // Submit comment
  await supabase.from('comments').insert({
    user_id: user.id,
    news_id: articleId,
    comment_text: content,
    helpful_votes: 0,
    is_flagged: false,
    created_at: new Date().toISOString()
  });
};
```

### Step 4: News Submission
```typescript
// Handle news submission
const handleNewsSubmission = async (submission: NewsSubmission) => {
  if (!user) return;
  
  // Rate limiting check
  const recentSubmissions = await getRecentSubmissions(user.id);
  if (recentSubmissions.length >= 3) {
    throw new Error('Rate limit exceeded. Max 3 submissions per 24 hours.');
  }
  
  // Content validation
  const validationResult = await validateSubmission(submission);
  if (!validationResult.isValid) {
    throw new Error(validationResult.error);
  }
  
  // Submit for review
  await supabase.from('submissions').insert({
    user_id: user.id,
    title: submission.title,
    content: submission.content,
    source_url: submission.sourceUrl,
    category: submission.category,
    location: submission.location,
    status: 'pending',
    created_at: new Date().toISOString()
  });
};
```

## Implementation Details

### Core Components

1. **EnhancedNewsCard** (`src/components/EnhancedNewsCard.tsx`)
   - Voting interface
   - Vote display
   - User interaction handling

2. **EnhancedCommentsSection** (`src/components/EnhancedCommentsSection.tsx`)
   - Comment display and management
   - Comment moderation
   - User interaction

3. **SubmitNews Page** (`src/pages/SubmitNews.tsx`)
   - News submission form
   - Content validation
   - Submission workflow

4. **Comment Moderation** (`src/lib/commentModeration.ts`)
   - AI-powered toxicity detection
   - Content filtering
   - Moderation tools

### Database Schema

```sql
-- User votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  news_id UUID REFERENCES news(id),
  vote TEXT CHECK (vote IN ('valid', 'fake', 'not_sure')),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate votes
  UNIQUE(user_id, news_id)
);

-- User comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  news_id UUID REFERENCES news(id),
  comment_text TEXT NOT NULL,
  helpful_votes INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT false,
  moderation_score NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- News submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User reputation
CREATE TABLE user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  reputation_score INTEGER DEFAULT 0,
  verified_articles INTEGER DEFAULT 0,
  helpful_comments INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Configuration

### Environment Variables
```bash
# Community Configuration
COMMUNITY_VOTING_ENABLED=true
COMMUNITY_COMMENTS_ENABLED=true
COMMUNITY_SUBMISSIONS_ENABLED=true

# Rate Limiting
MAX_SUBMISSIONS_PER_DAY=3
MAX_COMMENTS_PER_HOUR=10
VOTING_COOLDOWN_MINUTES=5

# Moderation Configuration
COMMENT_MODERATION_ENABLED=true
TOXICITY_THRESHOLD=0.7
AUTO_FLAG_ENABLED=true
```

### Voting Thresholds
- **Verification Trigger**: 10 votes with 70% consensus
- **Breaking News**: 5 votes with 80% consensus
- **Community Flag**: 3 votes for fake content

## Performance Optimization

### Caching Strategy
- **Vote Cache**: Cache user votes for fast access
- **Comment Cache**: Cache recent comments
- **Submission Cache**: Cache submission status
- **Reputation Cache**: Cache user reputation scores

### Batch Processing
```typescript
// Process multiple votes efficiently
const processVoteBatch = async (votes) => {
  const batchSize = 50;
  for (let i = 0; i < votes.length; i += batchSize) {
    const batch = votes.slice(i, i + batchSize);
    await Promise.all(batch.map(processVote));
  }
};
```

## Moderation Features

### AI-Powered Moderation
```typescript
// Comment toxicity detection
const checkToxicity = async (text: string) => {
  const toxicityResult = await commentModerationService.checkToxicity(text);
  
  return {
    isToxic: toxicityResult.isToxic,
    score: toxicityResult.score,
    reason: toxicityResult.reason
  };
};
```

### Community Moderation
- **User Reporting**: Users can report inappropriate content
- **Helpful Votes**: Users can vote on comment helpfulness
- **Auto-Flagging**: Automatic flagging of suspicious content
- **Admin Review**: Administrative review of flagged content

### Moderation Actions
```typescript
// Handle moderation actions
const handleModeration = async (contentId: string, action: string) => {
  switch (action) {
    case 'approve':
      await approveContent(contentId);
      break;
    case 'reject':
      await rejectContent(contentId);
      break;
    case 'flag':
      await flagContent(contentId);
      break;
    case 'delete':
      await deleteContent(contentId);
      break;
  }
};
```

## User Reputation System

### Reputation Calculation
```typescript
// Calculate user reputation
const calculateReputation = (userActivity) => {
  const reputation = {
    verifiedArticles: userActivity.verifiedArticles * 10,
    helpfulComments: userActivity.helpfulComments * 2,
    accurateVotes: userActivity.accurateVotes * 1,
    communityReports: userActivity.communityReports * -5
  };
  
  return Object.values(reputation).reduce((sum, score) => sum + score, 0);
};
```

### Reputation Benefits
- **Higher Submission Limits**: More submissions for trusted users
- **Priority Review**: Faster review of submissions
- **Moderation Access**: Ability to moderate content
- **Community Recognition**: Badges and recognition

## Analytics & Insights

### Community Metrics
- **Voting Patterns**: Vote distribution and trends
- **Comment Engagement**: Comment activity and quality
- **Submission Quality**: Submission success rates
- **User Participation**: User engagement levels

### Quality Assessment
```typescript
// Assess content quality
const assessContentQuality = async (contentId: string) => {
  const metrics = {
    voteConsensus: await calculateVoteConsensus(contentId),
    commentQuality: await assessCommentQuality(contentId),
    userReputation: await getUserReputation(contentId),
    verificationStatus: await getVerificationStatus(contentId)
  };
  
  return calculateQualityScore(metrics);
};
```

## Security Features

### Rate Limiting
- **Submission Limits**: Prevent spam submissions
- **Comment Limits**: Prevent comment spam
- **Voting Limits**: Prevent vote manipulation
- **Cooldown Periods**: Prevent rapid-fire actions

### Content Validation
```typescript
// Validate user submissions
const validateSubmission = async (submission) => {
  const validations = [
    validateTitle(submission.title),
    validateContent(submission.content),
    validateSourceUrl(submission.sourceUrl),
    checkDuplicateSubmission(submission),
    validateUserEligibility(submission.userId)
  ];
  
  const results = await Promise.all(validations);
  const errors = results.filter(result => !result.isValid);
  
  return {
    isValid: errors.length === 0,
    errors: errors.map(error => error.message)
  };
};
```

## Future Enhancements

1. **Advanced Community Features**
   - **Community Challenges**: Collaborative fact-checking challenges
   - **Expert Verification**: Expert user verification system
   - **Community Awards**: Recognition for contributions
   - **Collaborative Editing**: Community article editing

2. **Enhanced Moderation**
   - **Community Moderation**: User-based moderation system
   - **Reputation-Based Moderation**: Moderation based on user reputation
   - **Automated Moderation**: AI-powered content filtering
   - **Appeal System**: Content appeal process

3. **User Experience**
   - **Gamification**: Points, badges, and achievements
   - **Social Features**: User profiles and connections
   - **Personalization**: Customized content feeds
   - **Mobile Optimization**: Enhanced mobile experience 