import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Heart, MessageCircle, Sparkles, BookOpen, Users, Rocket, PenTool, Compass } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import type { Post, FeedResponse } from '../types';

const HomePage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastId, setLastId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchPosts();
    }
  }, [isAuthenticated, authLoading]);

  const fetchPosts = async (loadMore = false) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError('');
      const params = loadMore && lastId ? { lastId, limit: 10 } : { limit: 10 };
      const response: FeedResponse = await api.getFeed(params);

      if (loadMore) {
        setPosts(prev => [...prev, ...response.posts]);
      } else {
        setPosts(response.posts);
      }

      setHasMore(response.hasMore);
      if (response.posts.length > 0) {
        setLastId(response.posts[response.posts.length - 1]._id);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readTime);
  };

  const getAuthorName = (author: string | { _id?: string; name: string; avatar?: string }) => {
    return typeof author === 'string' ? 'Unknown Author' : author.name;
  };

  const getAuthorAvatar = (author: string | { _id?: string; name: string; avatar?: string }) => {
    return typeof author === 'object' ? author.avatar : undefined;
  };

  const getAuthorId = (author: string | { _id?: string; name: string; avatar?: string }) => {
    return typeof author === 'object' ? (author as any)._id : undefined;
  };

  // Loading skeleton component
  const PostSkeleton = () => (
    <div className="animate-pulse border-b border-gray-200 pb-12">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded mb-3"></div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
        <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0"></div>
      </div>
    </div>
  );

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show welcome message for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen md:overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white">
        {/* Animated background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 blur-3xl animate-float"></div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-fuchsia-500/20 blur-3xl animate-float-delayed"></div>

        {/* Hero */}
  <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-10 sm:pb-12">
          <div className="grid lg:grid-cols-12 gap-8 md:gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-xs font-semibold mb-5 shadow-sm">
                <Rocket size={14} /> New: Write, Learn, and Ship faster
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.2] sm:leading-[1.1] md:leading-[1.05] text-gray-900">
                Build ideas. <span className="gradient-text">Write boldly.</span> Ship stories.
              </h1>
              <p className="mt-4 sm:mt-5 text-base md:text-lg text-gray-600 max-w-2xl">
                npx is where makers and thinkers share what they’re building. Publish in minutes, grow an audience, and discover what’s next.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button onClick={() => navigate('/register')} className="group inline-flex items-center justify-center gap-2 bg-black text-white px-5 sm:px-7 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl cursor-pointer w-full sm:w-auto">
                  <PenTool size={18} className="group-hover:-rotate-6 transition-transform" /> Start writing
                </button>
                <button onClick={() => navigate('/login')} className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 rounded-full font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-800 transition-all cursor-pointer w-full sm:w-auto">
                  <Compass size={18} /> Explore first
                </button>
              </div>

              {/* Trending topics */}
              <div className="mt-10">
                <div className="text-sm font-semibold text-gray-700 mb-3">Trending topics</div>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                  {['AI', 'Design', 'Startups', 'Web Dev', 'Product', 'Data', 'Open Source'].map((t) => (
                    <Link key={t} to={`/`} className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm whitespace-nowrap transition-colors">
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden md:block lg:col-span-5">
              <div className="relative rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-transparent to-transparent" />
                <div className="relative p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="h-4 w-2/3 bg-gray-300 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-gray-300 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse" />
                    <div className="h-48 w-full rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="group p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">Publish in minutes</h3>
              <p className="text-gray-600 mt-2">A focused editor that gets out of your way so your ideas ship faster.</p>
            </div>
            <div className="group p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">Grow your audience</h3>
              <p className="text-gray-600 mt-2">Built-in discovery and sharing make it easy to be read by the right people.</p>
            </div>
            <div className="group p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">Join makers</h3>
              <p className="text-gray-600 mt-2">Connect with builders and thinkers shipping projects in public.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Show posts for authenticated users
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Following</h1>
            <p className="text-gray-600 text-sm sm:text-base">Fresh stories from writers you follow</p>
          </div>
          <Link
            to="/write"
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <PenTool size={16} /> New Story
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center space-x-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div>
              <p className="font-medium">{error}</p>
              <button
                onClick={() => fetchPosts()}
                className="text-red-600 hover:text-red-800 underline text-sm font-medium mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading && posts.length === 0 ? (
          <div className="space-y-12">
            {[...Array(3)].map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        ) : posts.length === 0 && !loading ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-400" aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No stories yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Start following writers or be the first to share your thoughts!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/write"
                className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                Write your first story
              </Link>
              <button
                onClick={() => fetchPosts()}
                className="text-gray-600 hover:text-gray-900 px-8 py-3 rounded-full border border-gray-300 hover:border-gray-400 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Refresh feed
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post, index) => (
              <article 
                key={post._id} 
                className="group border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-2xl p-6 transition-all shadow-sm hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Author Avatar */}
                  <div className="flex-shrink-0">
                    <Link to={getAuthorId(post.author) ? `/user/${getAuthorId(post.author)}` : '/profile'} className="block">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center ring-0 group-hover:ring-2 group-hover:ring-gray-300 transition-all duration-200">
                        {getAuthorAvatar(post.author) ? (
                          <img
                            src={getAuthorAvatar(post.author)!}
                            alt={getAuthorName(post.author)}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-semibold text-lg">
                            {getAuthorName(post.author).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link 
                        to={getAuthorId(post.author) ? `/user/${getAuthorId(post.author)}` : '/profile'}
                        className="text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-200"
                      >
                        {getAuthorName(post.author)}
                      </Link>
                      <span className="text-gray-400">·</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    <Link to={`/post/${post.slug}`} className="group">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors leading-tight">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-gray-600 mb-5 line-clamp-3 leading-relaxed text-sm sm:text-base">
                      {post.description}
                    </p>

                    {/* Post Stats */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Clock size={16} aria-hidden="true" />
                          <span>{calculateReadTime(post.content)} min read</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart size={16} aria-hidden="true" />
                          <span>{post.likes.length}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageCircle size={16} aria-hidden="true" />
                          <span>{post.comments.length}</span>
                        </div>
                      </div>

                      {/* Read More */}
                      <Link
                        to={`/post/${post.slug}`}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded px-2 py-1"
                      >
                        Read more
                      </Link>
                    </div>
                  </div>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="flex-shrink-0 sm:ml-8 w-full sm:w-auto">
                      <Link to={`/post/${post.slug}`}>
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full sm:w-36 h-40 sm:h-28 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-all"
                        />
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && posts.length > 0 && (
      <div className="text-center mt-10">
            <button
              onClick={() => fetchPosts(true)}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-8 py-3 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 inline-flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="spinner w-4 h-4"></div>
                  <span>Loading...</span>
                </>
              ) : (
        <span>Load more stories</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
