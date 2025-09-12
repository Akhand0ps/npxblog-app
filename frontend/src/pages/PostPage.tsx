import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Pencil, Trash2 } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import type { Post, Comment } from '../types';

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (slug) {
      fetchPost();
      fetchComments();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await api.getPost(slug!);
      if (response.message) {
        setPost(response.message);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.getComments(slug!);
      setComments(response);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated) return;
    setDeleting(prev => ({ ...prev, [commentId]: true }));
    try {
      await api.deleteComment(commentId);
      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setDeleting(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleReplyToggle = (commentId: string) => {
    setReplyOpenFor(prev => (prev === commentId ? null : commentId));
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!isAuthenticated || !replyText[parentId]?.trim()) return;
    const content = replyText[parentId].trim();
    try {
      await api.createComment(slug!, { content, parentCommentId: parentId });
      // reset field and collapse
      setReplyText(prev => ({ ...prev, [parentId]: '' }));
      setReplyOpenFor(null);
      await fetchComments();
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleLikePost = async () => {
    if (!isAuthenticated || !post) return;

    try {
      await api.likeUnlikePost({ postId: post._id });
      // Refresh post data to get updated likes
      await fetchPost();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !newComment.trim() || !post) return;

    setCommentLoading(true);
    try {
      await api.createComment(slug!, { content: newComment.trim() });
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAuthorName = (author: string | { _id?: string; name: string; avatar?: string }) => {
    return typeof author === 'string' ? 'Unknown Author' : author.name;
  };

  const getAuthorAvatar = (author: string | { _id?: string; name: string; avatar?: string }) => {
    return typeof author === 'object' ? author.avatar : undefined;
  };

  const getAuthorId = (author: string | { _id?: string; name: string; avatar?: string }) => {
    return typeof author === 'object' ? (author as any)._id : (author as string | undefined);
  };

  const isAuthor = post && user && getAuthorId(post.author) === user._id;

  const PROD_ORIGIN = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined;
  const shareUrl = post ? `${(PROD_ORIGIN && PROD_ORIGIN.startsWith('http') ? PROD_ORIGIN : window.location.origin)}/post/${post.slug}` : window.location.href;

  const handleShare = async () => {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: post?.title, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
        <p className="text-gray-600">The post you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 mb-6 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3 sm:mb-4">
          {post.title}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {getAuthorAvatar(post.author) ? (
                <img
                  src={getAuthorAvatar(post.author)!}
                  alt={getAuthorName(post.author)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-semibold text-sm sm:text-base">
                  {getAuthorName(post.author).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {getAuthorId(post.author) ? (
              <Link to={`/user/${getAuthorId(post.author)}`} className="font-medium text-gray-900 hover:underline">
                {getAuthorName(post.author)}
              </Link>
            ) : (
              <span className="font-medium text-gray-900">{getAuthorName(post.author)}</span>
            )}
            <span>·</span>
            <time>{formatDate(post.createdAt)}</time>
          </div>
          <div className="flex items-center gap-3">
            {isAuthor && (
              <>
                <button
                  onClick={() => navigate(`/post/${slug}/edit`)}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <Pencil size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={async () => {
                    if (!post) return;
                    const ok = window.confirm('Delete this post? This cannot be undone.');
                    if (!ok) return;
                    try {
                      await api.deletePost(post.slug);
                      navigate('/');
                    } catch (e) {
                      console.error('Failed to delete post', e);
                    }
                  }}
                  className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </>
            )}
            <button
              onClick={handleLikePost}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Heart size={16} />
              <span>{post.likes?.length || 0}</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.imageUrl && (
        <div className="mb-6 sm:mb-8">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-base sm:prose-lg max-w-none">
        <p>{post.content}</p>
      </div>

      {isAuthor && (
        <div className="mt-4 text-sm">
          <button
            onClick={() => navigate(`/post/${slug}/edit`)}
            className="text-gray-500 hover:text-gray-900 underline"
          >
            Edit this post
          </button>
        </div>
      )}

      {/* Comments */}
      <section className="mt-10 sm:mt-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Comments</h2>

        {isAuthenticated && (
          <form onSubmit={handleCommentSubmit} className="mb-8 sm:mb-10">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-medium text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  required
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={commentLoading || !newComment.trim()}
                    className="bg-black text-white px-6 py-2 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {commentLoading ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
                <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {getAuthorAvatar(comment.author) ? (
                        <img
                          src={getAuthorAvatar(comment.author)!}
                          alt={getAuthorName(comment.author)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium text-sm">
                          {getAuthorName(comment.author).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                        <span className="font-medium text-gray-900">
                          {getAuthorName(comment.author)}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 text-sm sm:text-base break-words">{comment.content}</p>

                      <div className="mt-2 flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                        {isAuthenticated && (
                          <button
                            onClick={() => handleReplyToggle(comment._id)}
                            className="hover:text-gray-800"
                          >
                            Reply
                          </button>
                        )}
                        {isAuthenticated && (user?._id === (typeof comment.author === 'object' ? (comment.author as any)._id : comment.author)) && (
                          <button
                            disabled={!!deleting[comment._id]}
                            onClick={() => handleDeleteComment(comment._id)}
                            className="hover:text-red-600 disabled:opacity-50"
                          >
                            {deleting[comment._id] ? 'Deleting…' : 'Delete'}
                          </button>
                        )}
                      </div>

                      {/* Reply box */}
                      {replyOpenFor === comment._id && isAuthenticated && (
                        <form
                          className="mt-3"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleReplySubmit(comment._id);
                          }}
                        >
                          <textarea
                            rows={3}
                            value={replyText[comment._id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                            placeholder="Write a reply…"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                          <div className="mt-2 flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setReplyOpenFor(null)}
                              className="px-3 py-1 text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={!replyText[comment._id]?.trim()}
                              className="px-4 py-1 bg-black text-white rounded disabled:opacity-50"
                            >
                              Reply
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Replies list (populated from backend) */}
                      <div className="mt-4 space-y-4">
                        {Array.isArray(comment.replies) && (comment.replies as any[]).length > 0 &&
                          (comment.replies as any[]).map((reply: any) => (
                            <div key={reply._id} className="flex items-start gap-3 sm:gap-4 pl-6 sm:pl-8">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {getAuthorAvatar(reply.author) ? (
                                  <img
                                    src={getAuthorAvatar(reply.author)!}
                                    alt={getAuthorName(reply.author)}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-gray-600 font-medium text-xs">
                                    {getAuthorName(reply.author).charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {getAuthorName(reply.author)}
                                  </span>
                                  <span className="text-xs sm:text-sm text-gray-500">{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="text-gray-700 text-sm break-words">{reply.content}</p>
                                {isAuthenticated && (user?._id === (typeof reply.author === 'object' ? (reply.author as any)._id : reply.author)) && (
                                  <div className="mt-2">
                                    <button
                                      disabled={!!deleting[reply._id]}
                                      onClick={() => handleDeleteComment(reply._id)}
                                      className="text-xs sm:text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
                                    >
                                      {deleting[reply._id] ? 'Deleting…' : 'Delete'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No comments yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PostPage;
