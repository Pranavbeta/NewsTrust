import React, { useState } from 'react';
import { Send, Flag, ChevronUp, AlertTriangle, Loader, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { commentModerationService } from '../lib/commentModeration';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  helpful: number;
  reported: boolean;
  flagged?: boolean;
  moderationScore?: number;
}

interface Props {
  articleId: string;
}

const EnhancedCommentsSection: React.FC<Props> = ({ articleId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      content: 'I verified this with multiple sources. The information checks out across Reuters, AP, and BBC.',
      timestamp: '2024-01-15T12:30:00Z',
      helpful: 12,
      reported: false
    },
    {
      id: '2',
      userId: '2',
      userName: 'Mike Chen',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      content: 'The source link leads to a legitimate news organization. Timeline matches other reports.',
      timestamp: '2024-01-15T11:45:00Z',
      helpful: 8,
      reported: false
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    setModerationWarning(null);
    
    try {
      // Check for toxicity
      const toxicityResult = await commentModerationService.checkToxicity(newComment);
      
      if (toxicityResult.isToxic) {
        setModerationWarning(toxicityResult.reason || 'Your comment contains inappropriate content and cannot be posted.');
        setSubmitting(false);
        return;
      }

      const comment: Comment = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.user_metadata?.full_name || user.email,
        userAvatar: user.user_metadata?.avatar_url || '/default-avatar.png',
        content: newComment,
        timestamp: new Date().toISOString(),
        helpful: 0,
        reported: false,
        moderationScore: toxicityResult.score
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulVote = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, helpful: comment.helpful + 1 }
        : comment
    ));
  };

  const handleReportComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, reported: true }
        : comment
    ));
  };

  const formatCommentTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const sortedComments = [...comments].sort((a, b) => b.helpful - a.helpful);

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Community Discussion ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start space-x-3">
            <img
              src={user.user_metadata?.avatar_url || '/default-avatar.png'}
              alt={user.user_metadata?.full_name || user.email || 'User avatar'}
              className="h-8 w-8 rounded-full flex-shrink-0"
              width="32"
              height="32"
              style={{ aspectRatio: '1/1' }}
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts or verification..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                maxLength={500}
                disabled={submitting}
              />
              
              {moderationWarning && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 dark:text-red-400 font-medium">Comment Blocked</p>
                      <p className="text-red-700 dark:text-red-300 text-sm mt-1">{moderationWarning}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Shield className="h-3 w-3" />
                  <span>Comments are automatically checked for harmful content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {newComment.length}/500 characters
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center mb-6">
          <p className="text-gray-600 dark:text-gray-400">Sign in to join the discussion and help verify news.</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <div
            key={comment.id}
            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${
              comment.flagged ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : ''
            }`}
          >
            {comment.flagged && (
              <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-400 text-sm mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span>This comment has been flagged for review.</span>
              </div>
            )}
            
            <div className="flex items-start space-x-3">
              <img
                src={comment.userAvatar}
                alt={comment.userName}
                className="h-8 w-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{comment.userName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCommentTime(comment.timestamp)}
                  </span>
                  {comment.moderationScore !== undefined && comment.moderationScore < 0.3 && (
                    <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs">
                      <Shield className="h-3 w-3" />
                      <span>Verified Safe</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {comment.content}
                </p>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleHelpfulVote(comment.id)}
                    className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span>Helpful ({comment.helpful})</span>
                  </button>
                  
                  {user && user.id !== comment.userId && !comment.reported && (
                    <button
                      onClick={() => handleReportComment(comment.id)}
                      className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Report</span>
                    </button>
                  )}
                  
                  {comment.reported && (
                    <span className="text-xs text-red-600 dark:text-red-400">Reported</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedCommentsSection;