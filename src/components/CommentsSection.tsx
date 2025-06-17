import React, { useState } from 'react';
import { Send, Flag, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
}

interface Props {
  articleId: string;
}

const CommentsSection: React.FC<Props> = ({ articleId }) => {
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    
    // Simulate content moderation (Perspective API)
    const containsToxicity = checkForToxicity(newComment);
    
    const comment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || '',
      content: newComment,
      timestamp: new Date().toISOString(),
      helpful: 0,
      reported: false,
      flagged: containsToxicity
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setSubmitting(false);
  };

  const checkForToxicity = (text: string): boolean => {
    // Simple toxicity detection simulation
    const toxicWords = ['spam', 'fake', 'stupid', 'hate'];
    return toxicWords.some(word => text.toLowerCase().includes(word));
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Community Discussion ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start space-x-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-8 w-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts or verification..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/500 characters
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Post</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center mb-6">
          <p className="text-gray-600">Sign in to join the discussion and help verify news.</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <div
            key={comment.id}
            className={`bg-white border border-gray-200 rounded-lg p-4 ${
              comment.flagged ? 'border-yellow-300 bg-yellow-50' : ''
            }`}
          >
            {comment.flagged && (
              <div className="flex items-center space-x-2 text-yellow-700 text-sm mb-2">
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
                  <span className="font-medium text-gray-900">{comment.userName}</span>
                  <span className="text-xs text-gray-500">
                    {formatCommentTime(comment.timestamp)}
                  </span>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-3">
                  {comment.content}
                </p>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleHelpfulVote(comment.id)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span>Helpful ({comment.helpful})</span>
                  </button>
                  
                  {user && user.id !== comment.userId && !comment.reported && (
                    <button
                      onClick={() => handleReportComment(comment.id)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Report</span>
                    </button>
                  )}
                  
                  {comment.reported && (
                    <span className="text-xs text-red-600">Reported</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;