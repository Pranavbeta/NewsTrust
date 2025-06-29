import React, { useState, useRef, useEffect } from 'react';
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
import OptimizedImage from './OptimizedImage';
import { FastAverageColor } from 'fast-average-color';
import './EnhancedNewsCard.css';

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

// Utility: Check if image URL is CORS-safe (same-origin or known CORS-enabled domains)
function isCorsSafeImage(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    // Allow same-origin
    if (parsed.origin === window.location.origin) return true;
    // Add your trusted CORS-enabled domains here:
    const corsDomains = [
      'https://your-cdn.com',
      'http://localhost',
      'https://images.unsplash.com',
      // Add more if you control the CORS headers
    ];
    return corsDomains.some(domain => parsed.origin.startsWith(domain));
  } catch {
    return false;
  }
}

// Helper to detect mobile
function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 640;
}

let globalActiveCardId: string | null = null;

const EnhancedNewsCard: React.FC<Props> = ({ article }) => {
  const { user } = useAuth();
  const { voteOnArticle } = useNews();
  const { currentLanguage } = useLanguage();
  const [showComments, setShowComments] = useState(false);
  const [voting, setVoting] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [aiVerification, setAiVerification] = useState(article.aiVerification);
  const [blockchainVerification, setBlockchainVerification] = useState(article.blockchainVerification);
  const [bgColor, setBgColor] = useState<string>('linear-gradient(135deg, #232526 0%, #414345 100%)');
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isPopped, setIsPopped] = useState(false);
  const [popClass, setPopClass] = useState('');
  const tappedRef = useRef(false);

  const votes = article.votes || { valid: 0, fake: 0, not_sure: 0 };
  const totalVotes = votes.valid + votes.fake + votes.not_sure;
  const validPercentage = totalVotes > 0 ? Math.round((votes.valid / totalVotes) * 100) : 0;
  const fakePercentage = totalVotes > 0 ? Math.round((votes.fake / totalVotes) * 100) : 0;
  const notSurePercentage = totalVotes > 0 ? Math.round((votes.not_sure / totalVotes) * 100) : 0;

  useEffect(() => {
    if (article.image_url && imgRef.current && isCorsSafeImage(article.image_url)) {
      // Only extract color after image loads, and only if CORS-safe
      const handleLoad = () => {
        try {
          const fac = new FastAverageColor();
          fac.getColorAsync(imgRef.current!)
            .then((color: { value: [number, number, number, number] }) => {
              setBgColor(`rgba(${color.value[0]},${color.value[1]},${color.value[2]},0.7)`);
            })
            .catch(() => {
              setBgColor('linear-gradient(135deg, #232526 0%, #414345 100%)');
            });
        } catch (err) {
          // Suppress CORS errors
          setBgColor('linear-gradient(135deg, #232526 0%, #414345 100%)');
        }
      };
      const img = imgRef.current;
      if (img.complete) {
        handleLoad();
      } else {
        img.addEventListener('load', handleLoad);
        return () => img.removeEventListener('load', handleLoad);
      }
    } else {
      setBgColor('linear-gradient(135deg, #232526 0%, #414345 100%)');
    }
  }, [article.image_url]);

  // Helper to set pop state and animation class
  const setPop = (popped: boolean) => {
    setIsPopped(popped);
    setPopClass(popped ? 'news-pop-in' : 'news-pop-out');
  };

  // Desktop: hover/focus
  const handlePopIn = () => {
    if (!isMobile()) setPop(true);
  };
  const handlePopOut = () => {
    if (!isMobile()) setPop(false);
  };

  // Intersection Observer for mobile scroll-based pop-in
  useEffect(() => {
    if (!isMobile() || !cardRef.current) return;
    const node = cardRef.current;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!tappedRef.current) setPop(true);
        } else {
          if (!tappedRef.current) setPop(false);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [article.id]);

  // Mobile: tap to pop in and keep popped in until another card is tapped
  const handleMobileTap = (e: React.MouseEvent) => {
    if (isMobile()) {
      if (!isPopped) {
        globalActiveCardId = article.id;
        setPop(true);
        tappedRef.current = true;
        window.dispatchEvent(new CustomEvent('cardPop', { detail: article.id }));
      }
      // Prevent bubbling to parent
      e.stopPropagation();
    }
  };

  // On mobile, pop out if another card is tapped
  useEffect(() => {
    if (!isMobile()) return;
    if (globalActiveCardId !== article.id) {
      setPop(false);
      tappedRef.current = false;
    }
  }, [article.id]);

  // On mobile, tap outside to pop out
  useEffect(() => {
    if (!isMobile()) return;
    if (!isPopped) return;
    const handleTapOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setPop(false);
        tappedRef.current = false;
      }
    };
    document.addEventListener('mousedown', handleTapOutside);
    return () => document.removeEventListener('mousedown', handleTapOutside);
  }, [isPopped]);

  const handleVote = async (vote: 'valid' | 'fake' | 'not_sure') => {
    if (!user || voting) return;
    setVoting(true);
    try {
      const newVote = article.user_vote === vote ? null : vote;
      await voteOnArticle(article.id, newVote);
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
      ref={cardRef}
      id={`article-${article.id}`} 
      className={`news-article card-force-white-text rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 transform ${popClass}`}
      style={{ background: bgColor }}
      onMouseEnter={handlePopIn}
      onMouseLeave={handlePopOut}
      onClick={handleMobileTap}
      tabIndex={0}
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

        <h2 className="article-title text-base sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight">
          {displayTitle}
        </h2>

        <p className="article-content text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed">
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

        {article.image_url ? (
          <div className="mb-3 sm:mb-4 relative">
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg animate-pulse z-10">
                <span className="text-gray-400 text-base sm:text-lg">Loading...</span>
              </div>
            )}
            <img
              ref={imgRef}
              src={article.image_url}
              alt={displayTitle || 'News article image'}
              className={`w-full h-40 sm:h-64 object-cover rounded-lg transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              width={800}
              height={256}
              style={{ aspectRatio: '800/256' }}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
            />
          </div>
        ) : (
          <div className="mb-3 sm:mb-4 w-full h-40 sm:h-64 flex items-center justify-center bg-gray-200 rounded-lg">
            <span className="text-gray-500 text-base sm:text-lg">Image</span>
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