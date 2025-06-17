import React, { useState } from 'react';
import { 
  ExternalLink, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  MessageCircle,
  Calendar,
  MapPin,
  Zap,
  Languages
} from 'lucide-react';
import { NewsArticle } from '../contexts/NewsContext';
import { useAuth } from '../contexts/AuthContext';
import { useNews } from '../contexts/NewsContext';
import { useLanguage } from '../contexts/LanguageContext';
import EnhancedCommentsSection from './EnhancedCommentsSection';
import VerificationSystem from './VerificationSystem';
import BlockchainBadge from './BlockchainBadge';

interface Props {
  article: NewsArticle & {
    aiVerification?: {
      verdict: 'valid' | 'fake' | 'unclear';
      confidence: number;
      explanation: string;
    };
    blockchainVerification?: {
      transactionId: string;
      verdict: string;
      timestamp: string;
    };
    isPremiumVerified?: boolean;
  };
}

const EnhancedNewsCard: React.FC<Props> = ({ article }) => {
  const { user } = useAuth();
  const { voteOnArticle } = useNews();
  const { currentLanguage } = useLanguage();
  const [showComments, setShowComments] = useState(false);
  const [voting, setVoting] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [aiVerification, setAiVerification] = useState(article.aiVerification);
  const [blockchainVerification, setBlockchainVerification] = useState(article.blockchainVerification);

  const totalVotes = article.votes.valid + article.votes.fake + article.votes.not_sure;
  const validPercentage = totalVotes > 0 ? Math.round((article.votes.valid / totalVotes) * 100) : 0;
  const fakePercentage = totalVotes > 0 ? Math.round((article.votes.fake / totalVotes) * 100) : 0;
  const notSurePercentage = totalVotes > 0 ? Math.round((article.votes.not_sure / totalVotes) * 100) : 0;

  const handleVote = async (vote: 'valid' | 'fake' | 'not_sure') => {
    if (!user || voting) return;
    
    setVoting(true);
    try {
      await voteOnArticle(article.id, vote);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleVerificationComplete = (result: any) => {
    setAiVerification(result);
    if (result.blockchainProof) {
      setBlockchainVerification({
        transactionId: result.blockchainProof,
        verdict: result.verdict,
        timestamp: new Date().toISOString()
      });
    }
  };

  const getAdminBadge = () => {
    if (!article.admin_status) return null;
    
    switch (article.admin_status) {
      case 'valid':
        return (
          <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Admin Verified</span>
          </div>
        );
      case 'fake':
        return (
          <div className="flex items-center space-x-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
            <XCircle className="h-3 w-3" />
            <span>Admin Disputed</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
            <AlertTriangle className="h-3 w-3" />
            <span>Under Review</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getAIVerificationBadge = () => {
    const verification = aiVerification || article.aiVerification;
    if (!verification) return null;
    
    const { verdict, confidence } = verification;
    const color = verdict === 'valid' ? 'green' : verdict === 'fake' ? 'red' : 'yellow';
    
    return (
      <div className={`flex items-center space-x-1 bg-${color}-100 dark:bg-${color}-900/20 text-${color}-800 dark:text-${color}-400 px-2 py-1 rounded-full text-xs font-medium`}>
        <CheckCircle2 className="h-3 w-3" />
        <span>AI: {verdict.toUpperCase()} ({confidence}%)</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  // Determine what content to show
  const displayTitle = showOriginal && article.originalTitle ? article.originalTitle : article.title;
  const displaySummary = showOriginal && article.originalSummary ? article.originalSummary : article.summary;

  return (
    <article 
      id={`article-${article.id}`} 
      className="news-article bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all"
    >
      {/* Article Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {article.is_breaking && (
              <div className="flex items-center space-x-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                <Zap className="h-3 w-3" />
                <span>BREAKING</span>
              </div>
            )}
            {getAdminBadge()}
            {getAIVerificationBadge()}
            {article.isPremiumVerified && (
              <div className="flex items-center space-x-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                <CheckCircle2 className="h-3 w-3" />
                <span>Premium Verified</span>
              </div>
            )}
            {article.isTranslated && (
              <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                <Languages className="h-3 w-3" />
                <span>{currentLanguage.flag} Translated</span>
              </div>
            )}
            {(blockchainVerification || article.blockchainVerification) && (
              <BlockchainBadge
                transactionId={(blockchainVerification || article.blockchainVerification)!.transactionId}
                verdict={(blockchainVerification || article.blockchainVerification)!.verdict}
                timestamp={(blockchainVerification || article.blockchainVerification)!.timestamp}
              />
            )}
          </div>
          <button
            onClick={() => window.open(article.source_url, '_blank')}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="View source"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        <h2 className="article-title text-xl font-semibold text-gray-900 dark:text-white mb-3 leading-tight">
          {displayTitle}
        </h2>

        <p className="article-content text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {displaySummary}
        </p>

        {/* Translation Toggle */}
        {article.isTranslated && article.originalTitle && (
          <div className="mb-4">
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {showOriginal ? 'Show Translation' : 'Show Original'}
            </button>
          </div>
        )}

        {article.image_url && (
          <div className="mb-4">
            <img
              src={article.image_url}
              alt={displayTitle}
              className="w-full h-48 object-cover rounded-lg"
              loading="lazy"
            />
          </div>
        )}

        {/* Article Metadata */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="article-source font-medium">{article.source}</span>
          <span className="article-date flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(article.created_at)}</span>
          </span>
          {article.location && (
            <span className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{article.location}</span>
            </span>
          )}
          {article.isTranslated && (
            <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
              <Languages className="h-3 w-3" />
              <span>{currentLanguage.name}</span>
            </span>
          )}
        </div>

        {/* AI Verification Details */}
        {(aiVerification || article.aiVerification) && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Analysis</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {(aiVerification || article.aiVerification)?.explanation}
            </p>
          </div>
        )}

        {/* Verification System */}
        <div className="verification-results mb-4">
          <VerificationSystem
            newsId={article.id}
            title={displayTitle}
            content={displaySummary}
            sourceUrl={article.source_url}
            onVerificationComplete={handleVerificationComplete}
          />
        </div>

        {/* Voting Section */}
        {user && (
          <div className="border-t dark:border-gray-700 pt-4 mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">What do you think?</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleVote('valid')}
                disabled={voting}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                  article.user_vote === 'valid'
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/10 hover:text-green-700 dark:hover:text-green-400'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Valid</span>
              </button>
              <button
                onClick={() => handleVote('fake')}
                disabled={voting}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                  article.user_vote === 'fake'
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-300 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-700 dark:hover:text-red-400'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>Fake</span>
              </button>
              <button
                onClick={() => handleVote('not_sure')}
                disabled={voting}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                  article.user_vote === 'not_sure'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-800'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 hover:text-yellow-700 dark:hover:text-yellow-400'
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                <span>Not Sure</span>
              </button>
            </div>
          </div>
        )}

        {/* Vote Results */}
        <div className="border-t dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Community Validation</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{totalVotes} votes</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Valid</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{validPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${validPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Fake</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{fakePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${fakePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Not Sure</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{notSurePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${notSurePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Comments Toggle */}
        <div className="border-t dark:border-gray-700 pt-4 mt-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{showComments ? 'Hide Comments' : 'Show Comments'}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <EnhancedCommentsSection articleId={article.id} />
        </div>
      )}
    </article>
  );
};

export default EnhancedNewsCard;