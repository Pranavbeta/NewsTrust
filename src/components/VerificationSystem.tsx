import React, { useState, useEffect } from 'react';
import { Bot, Crown, Shield, ExternalLink, CheckCircle2, XCircle, AlertTriangle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { aiVerificationService } from '../lib/aiVerification';
import { paymentService } from '../lib/paymentService';
import { blockchainService } from '../lib/blockchainService';

interface Props {
  newsId: string;
  title: string;
  content: string;
  sourceUrl: string;
  onVerificationComplete?: (result: any) => void;
}

const VerificationSystem: React.FC<Props> = ({
  newsId,
  title,
  content,
  sourceUrl,
  onVerificationComplete
}) => {
  const { user } = useAuth();
  const [aiVerifying, setAiVerifying] = useState(false);
  const [premiumProcessing, setPremiumProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [blockchainProof, setBlockchainProof] = useState<any>(null);
  const [premiumSubmitted, setPremiumSubmitted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Check if browser-based verification is available
  const [browserVerificationAvailable, setBrowserVerificationAvailable] = useState(false);

  useEffect(() => {
    // Check if Puter.js is available
    const isPuterAvailable = typeof window !== 'undefined' && 
                            window.puter && 
                            typeof window.puter.ai === 'object';
    
    // Check if verification.js is loaded
    const isVerificationJsLoaded = typeof window !== 'undefined' && 
                                  window.newsVerification && 
                                  typeof window.newsVerification.verifyArticle === 'function';
    
    setBrowserVerificationAvailable(isPuterAvailable || isVerificationJsLoaded);
  }, []);

  const handleAIVerification = async () => {
    if (!user) {
      alert('Please sign in to use AI verification');
      return;
    }

    setAiVerifying(true);
    const startTime = performance.now();

    try {
      let result;
      
      // Try browser-based verification first if available
      if (browserVerificationAvailable && window.newsVerification) {
        try {
          // Use the browser-based verification system
          result = await window.newsVerification.verifyArticle({
            id: newsId,
            title,
            content,
            source: sourceUrl.split('/')[2] || 'Unknown',
            sourceUrl,
            publishDate: new Date().toISOString()
          });
          
          // If we got a blockchain proof from the browser verification
          if (result.blockchainProof) {
            setBlockchainProof({
              transactionId: result.blockchainProof,
              verdict: result.verdict,
              timestamp: result.timestamp || new Date().toISOString()
            });
          }
        } catch (browserVerificationError) {
          console.warn('Browser verification failed, falling back to server:', browserVerificationError);
          // Fall back to server-side verification
          result = await aiVerificationService.verifyNews(title, content, sourceUrl);
        }
      } else {
        // Use server-side verification
        result = await aiVerificationService.verifyNews(title, content, sourceUrl);
      }
      
      setAiResult(result);

      // Record verification time for performance monitoring
      const duration = performance.now() - startTime;
      if (window.recordVerificationTime) {
        window.recordVerificationTime(duration);
      }

      // Create blockchain proof if not already created by browser verification
      if (!blockchainProof && !result.blockchainProof) {
        try {
          const proof = await blockchainService.recordVerification(
            newsId,
            result.verdict as 'valid' | 'fake' | 'pending',
            'AI_SYSTEM'
          );
          setBlockchainProof(proof);
          
          // Add blockchain proof to result
          result.blockchainProof = proof.transactionId;
        } catch (blockchainError) {
          console.warn('Blockchain proof creation failed:', blockchainError);
        }
      }

      onVerificationComplete?.(result);
    } catch (error) {
      console.error('AI verification failed:', error);
      alert('AI verification failed. Please try again later.');
    } finally {
      setAiVerifying(false);
    }
  };

  const handlePremiumVerification = async () => {
    if (!user) {
      alert('Please sign in to submit for premium verification');
      return;
    }

    setPremiumProcessing(true);
    try {
      const paymentSession = await paymentService.createVerificationPayment(newsId);
      
      if (paymentSession.url === '#mock-payment') {
        // Mock payment success
        setTimeout(() => {
          setPremiumSubmitted(true);
          setPremiumProcessing(false);
          alert('Payment successful! Your article has been submitted for admin verification.');
        }, 2000);
      } else {
        paymentService.redirectToCheckout(paymentSession.url);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
      setPremiumProcessing(false);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'fake':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'unclear':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'valid':
        return 'text-green-600';
      case 'fake':
        return 'text-red-600';
      case 'unclear':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Verification Buttons */}
      <div className="flex flex-wrap gap-2">
        {!aiResult && (
          <button
            onClick={handleAIVerification}
            disabled={aiVerifying || !user}
            className="verify-btn flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-article-id={newsId}
          >
            {aiVerifying ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            <span>{aiVerifying ? 'Verifying...' : 'Verify with AI'}</span>
          </button>
        )}

        {!premiumSubmitted && (
          <button
            onClick={handlePremiumVerification}
            disabled={premiumProcessing || !user}
            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md text-sm font-medium hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {premiumProcessing ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Crown className="h-4 w-4" />
            )}
            <span>{premiumProcessing ? 'Processing...' : 'Premium Verification ($5)'}</span>
          </button>
        )}

        {premiumSubmitted && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-md text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>Submitted for Admin Review</span>
          </div>
        )}
      </div>

      {/* AI Verification Results */}
      {aiResult && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2">
              {getVerdictIcon(aiResult.verdict)}
              <span className={`font-medium ${getVerdictColor(aiResult.verdict)}`}>
                AI Verdict: {aiResult.verdict.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                ({aiResult.confidence}% confidence)
              </span>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {showDetails && (
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Explanation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{aiResult.explanation}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Reasoning</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{aiResult.reasoning}</p>
              </div>

              {aiResult.sources_checked && aiResult.sources_checked.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sources Checked</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {aiResult.sources_checked.map((source, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <ExternalLink className="h-3 w-3" />
                        <span>{source}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResult.flags && aiResult.flags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Flags</h4>
                  <div className="space-y-1">
                    {aiResult.flags.map((flag, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(blockchainProof || aiResult.blockchainProof) && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Blockchain Proof</h4>
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600 dark:text-gray-300">
                      TX: {(blockchainProof?.transactionId || aiResult.blockchainProof).substring(0, 16)}...
                    </span>
                    <button
                      onClick={() => window.open(blockchainService.getExplorerUrl(blockchainProof?.transactionId || aiResult.blockchainProof), '_blank')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline flex items-center space-x-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View on Blockchain</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add global type definitions for browser verification
declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (options: { prompt: string; temperature?: number; maxTokens?: number }) => Promise<any>;
      };
    };
    newsVerification?: {
      verifyArticle: (articleData: any) => Promise<any>;
      getVerificationState: () => any;
      getVerificationResult: (articleId: string) => any;
    };
    recordVerificationTime?: (duration: number) => void;
    reportPerformanceIssue?: (issue: any) => void;
  }
}

export default VerificationSystem;