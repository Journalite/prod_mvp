import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArticleComment, 
  CommentReply,
  getArticleComments, 
  postComment, 
  postReply,
  likeComment, 
  likeReply,
  deleteComment, 
  deleteReply 
} from '@/services/articleService';
import { auth } from '@/firebase/clientApp';
import { onAuthStateChanged } from 'firebase/auth';

interface CommentSectionProps {
  slug: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ slug }) => {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focusState, setFocusState] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // This user object will be updated when authenticated
  const [currentUser, setCurrentUser] = useState({ id: '', name: 'Reader' });

  useEffect(() => {
    // Check authentication status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isAuth = !!user;
      setIsAuthenticated(isAuth);
      
      if (isAuth && user) {
        setCurrentUser({
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User'
        });
      } else {
        setCurrentUser({ id: '', name: 'Reader' });
      }
    });
    
    if (!slug) return;
    
    setLoading(true);
    getArticleComments(slug)
      .then(data => {
        // Add a small delay to show loading animation
        setTimeout(() => {
          setComments(data);
          setLoading(false);
        }, 800);
      })
      .catch(err => {
        setError('Unable to load discussions. Please refresh the page to try again.');
        setLoading(false);
      });
      
    return () => unsubscribe();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    try {
      setSubmitting(true);
      const comment = await postComment(slug, currentUser.id, newComment);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setSubmitting(false);
      setFocusState(false); // Reset focus state after submission
    } catch (err) {
      setError('Your response could not be posted. Please try again.');
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (commentId: string) => {
    if (!replyContent.trim() || submittingReply) return;
    
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    try {
      setSubmittingReply(true);
      const reply = await postReply(slug, commentId, currentUser.id, replyContent);
      
      // Update the local state with the new reply
      setComments(prev => 
        prev.map(comment => 
          comment.commentId === commentId
            ? { 
                ...comment, 
                replies: [...(comment.replies || []), reply]
              }
            : comment
        )
      );
      
      // Reset reply state
      setReplyContent('');
      setReplyingTo(null);
      setSubmittingReply(false);
      
      // Ensure replies for this comment are expanded
      setExpandedReplies(prev => ({
        ...prev,
        [commentId]: true
      }));
    } catch (err) {
      setSubmittingReply(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    try {
      const result = await likeComment(slug, commentId, currentUser.id);
      
      // Update local state
      setComments(prev => 
        prev.map(comment => 
          comment.commentId === commentId 
            ? { ...comment, likes: result.likes } 
            : comment
        )
      );
    } catch (err) {
      // Handle error silently
    }
  };

  const handleLikeReply = async (commentId: string, replyId: string) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    try {
      const result = await likeReply(slug, commentId, replyId, currentUser.id);
      
      // Update local state
      setComments(prev => 
        prev.map(comment => 
          comment.commentId === commentId 
            ? { 
                ...comment, 
                replies: comment.replies.map(reply => 
                  reply.replyId === replyId
                    ? { ...reply, likes: result.likes }
                    : reply
                )
              } 
            : comment
        )
      );
    } catch (err) {
      // Handle error silently
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      await deleteComment(slug, commentId, currentUser.id);
      
      // Remove comment from local state
      setComments(prev => 
        prev.filter(comment => comment.commentId !== commentId)
      );
    } catch (err) {
      // Handle error silently
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      await deleteReply(slug, commentId, replyId, currentUser.id);
      
      // Remove reply from local state
      setComments(prev => 
        prev.map(comment => 
          comment.commentId === commentId 
            ? { 
                ...comment, 
                replies: comment.replies.filter(reply => reply.replyId !== replyId)
              } 
            : comment
        )
      );
    } catch (err) {
      // Handle error silently
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMillis = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMillis / (1000 * 60));
    const diffInHours = Math.floor(diffInMillis / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  // Function to get user avatar with initial
  const getUserAvatar = (userId: string, isReply = false) => {
    const initial = userId.charAt(0).toUpperCase();
    const colors = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];
    const colorIndex = userId.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];
    
    return (
      <div 
        className={isReply ? "reply-avatar" : "comment-avatar-small"} 
        style={{ 
          backgroundColor: bgColor, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: isReply ? '0.9rem' : '1.2rem'
        }}
      >
        {initial}
      </div>
    );
  };

  return (
    <section className="comment-section">
      <h2 className="comment-section-title">
        Join the Discussion
      </h2>
      
      {error && (
        <div className="comment-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}
      
      <form className="comment-form" onSubmit={handleCommentSubmit}>
        <div
          className="comment-input-container"
          style={{ opacity: focusState ? 1 : 0.85 }}
        >
          {isAuthenticated ? (
            <>
              <div className="comment-avatar">
                {getUserAvatar(currentUser.id)}
              </div>
              <textarea
                className="comment-input"
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onFocus={() => setFocusState(true)}
                onBlur={() => {
                  if (!newComment.trim()) {
                    setFocusState(false);
                  }
                }}
              />
              <button
                className="comment-submit"
                type="submit"
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </>
          ) : (
            <div className="login-prompt-container" onClick={() => setShowLoginPrompt(true)}>
              <textarea
                className="comment-input"
                placeholder="Login to join the discussion..."
                disabled
              />
              <button
                className="comment-submit login-button"
                type="button"
                onClick={() => setShowLoginPrompt(true)}
              >
                Login to comment
              </button>
            </div>
          )}
        </div>
      </form>
      
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="login-modal-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="login-modal" onClick={e => e.stopPropagation()}>
            <button className="login-modal-close" onClick={() => setShowLoginPrompt(false)}>×</button>
            <h3 className="login-modal-title">Join the conversation</h3>
            <p className="login-modal-text">
              Sign in to Journalite to share your thoughts and join the discussion.
            </p>
            <div className="login-modal-buttons">
              <Link href="/login" className="login-modal-button primary">
                Log In
              </Link>
              <Link href="/register" className="login-modal-button secondary">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="comment-loading">
          <p>Loading comments...</p>
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="no-comments">
          Be the first to share your thoughts on this article.
        </div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.commentId} className="comment-item">
              <div className="comment-header">
                {getUserAvatar(comment.userId)}
                <span className="comment-user">{comment.userId}</span>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
              </div>
              <div className="comment-content">
                {comment.content}
              </div>
              <div className="comment-actions">
                <button
                  className={`comment-like-btn ${comment.likes.includes(currentUser.id) ? 'liked' : ''}`}
                  onClick={() => handleLikeComment(comment.commentId)}
                >
                  <span>❤</span>
                  <span>{comment.likes.length || ''}</span>
                </button>
                
                <button
                  className="reply-toggle"
                  onClick={() => {
                    if (isAuthenticated) {
                      setReplyingTo(replyingTo === comment.commentId ? null : comment.commentId);
                    } else {
                      setShowLoginPrompt(true);
                    }
                  }}
                >
                  <span>↩</span>
                  <span>Reply</span>
                </button>
                
                {/* Only show delete button for the user's own comments */}
                {comment.userId === currentUser.id && (
                  <button
                    className="comment-delete-btn"
                    onClick={() => handleDeleteComment(comment.commentId)}
                  >
                    <span>🗑</span>
                    <span>Delete</span>
                  </button>
                )}
              </div>
              
              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <>
                  <button
                    className="replies-toggle"
                    onClick={() => toggleReplies(comment.commentId)}
                  >
                    <span className={`replies-toggle-icon ${expandedReplies[comment.commentId] ? 'open' : ''}`}>
                      ▷
                    </span>
                    {`${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
                  </button>
                  
                  {expandedReplies[comment.commentId] && (
                    <div className="reply-section">
                      {comment.replies.map(reply => (
                        <div key={reply.replyId} className="reply-item">
                          <div className="reply-header">
                            {getUserAvatar(reply.userId, true)}
                            <span className="reply-user">{reply.userId}</span>
                            <span className="reply-date">{formatDate(reply.createdAt)}</span>
                          </div>
                          <div className="reply-content">
                            {reply.content}
                          </div>
                          <div className="reply-actions">
                            <button
                              className={`${reply.likes.includes(currentUser.id) ? 'liked' : ''}`}
                              onClick={() => handleLikeReply(comment.commentId, reply.replyId)}
                            >
                              ❤ {reply.likes.length || ''}
                            </button>
                            
                            {/* Only show delete button for the user's own replies */}
                            {reply.userId === currentUser.id && (
                              <button
                                onClick={() => handleDeleteReply(comment.commentId, reply.replyId)}
                              >
                                🗑 Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {/* Reply form */}
              {replyingTo === comment.commentId && (
                <div className={`reply-form ${comment.replies && comment.replies.length > 0 ? 'in-thread' : ''}`}>
                  <textarea
                    className="reply-input"
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                  />
                  <div className="reply-buttons">
                    <button
                      className="reply-cancel"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="reply-submit"
                      disabled={!replyContent.trim() || submittingReply}
                      onClick={() => handleReplySubmit(comment.commentId)}
                    >
                      {submittingReply ? 'Posting...' : 'Post Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentSection; 