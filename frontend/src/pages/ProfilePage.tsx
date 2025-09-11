import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Upload, X, Clock, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { uploadToCloudinary } from '../utils/cloudinary';
import type { User, Post } from '../types';

const ProfilePage: React.FC = () => {
  const { user: currentUser, isAuthenticated, loading: authLoading, updateBio, updateAvatar } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('🔄 ProfilePage render - Full state:', {
    isAuthenticated,
    authLoading,
    localLoading: loading,
    hasUser: !!user,
    hasCurrentUser: !!currentUser,
    userDetails: user ? { id: user._id, name: user.name } : null,
    currentUserDetails: currentUser ? { id: currentUser._id, name: currentUser.name } : null
  });

  useEffect(() => {
    console.log('🔄 ProfilePage useEffect - Triggered:', { 
      isAuthenticated, 
      authLoading, 
      currentUserName: currentUser?.name,
      currentUserId: currentUser?._id
    });

    // Only proceed if auth is not loading
    if (!authLoading) {
      if (isAuthenticated && currentUser) {
        console.log('✅ Setting up authenticated user - Full user data:', currentUser);
        setUser(currentUser);
        setNewBio(currentUser.bio || '');
        setLoading(false); // Set loading to false immediately when we have user data
        fetchUserPosts(); // Fetch posts asynchronously without blocking UI
      } else {
        console.log('❌ User not authenticated or no currentUser, stopping loading');
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, currentUser]);

  const fetchUserPosts = async () => {
    try {
      console.log('📝 Fetching user posts...');
      const response = await api.getAllPosts();
      console.log('✅ Posts fetched:', response?.length || 0);
      setPosts(response || []);
    } catch (error) {
      console.error('❌ Error fetching user posts:', error);
      setPosts([]);
    }
    // Removed the finally block that set loading to false
  };

  const handleBioUpdate = async () => {
    const result = await updateBio(newBio);
    if (result?.success && user) {
      setUser({ ...user, bio: newBio });
      setEditingBio(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const imageUrl = await uploadToCloudinary(file);

      // Update avatar using the auth hook
      const result = await updateAvatar(imageUrl);
      if (result?.success && user) {
        setUser({ ...user, avatar: imageUrl });
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    if (!user) return;

    try {
      const result = await updateAvatar('');
      if (result?.success && user) {
        setUser({ ...user, avatar: '' });
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      alert('Failed to remove avatar. Please try again.');
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

  const getAuthorName = (author: string | { name?: string; avatar?: string } | undefined) => {
    if (!author) return user?.name || 'Unknown Author';
    if (typeof author === 'string') return user?.name || 'Unknown Author';
    return author.name || user?.name || 'Unknown Author';
  };

  const getAuthorAvatar = (author: string | { name?: string; avatar?: string } | undefined) => {
    if (!author) return user?.avatar || undefined;
    return typeof author === 'object' ? (author.avatar || user?.avatar) : user?.avatar;
  };

  // Show auth loading first
  if (authLoading) {
    console.log('⏳ Rendering: Auth loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Checking Authentication</h1>
          <p className="text-gray-600">Please wait while we verify your login status...</p>
        </div>
      </div>
    );
  }

  // Show not authenticated if user is not logged in
  if (!isAuthenticated) {
    console.log('🚫 Rendering: Not authenticated');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">You need to sign in to view your profile page.</p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show profile loading while fetching data
  if (loading || !user) {
    console.log('⏳ Rendering: Profile loading state or no user');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Profile</h1>
          <p className="text-gray-600">Please wait while we load your profile information...</p>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering: Profile page for user:', user.name);

  return (
    <div className="min-h-screen bg-white">
      {/* Profile Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-full flex items-center justify-center relative group mx-auto md:mx-0">
              {user.avatar ? (
                <>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload-profile"
                    />
                    <label
                      htmlFor="avatar-upload-profile"
                      className="cursor-pointer text-white flex flex-col items-center"
                    >
                      <Upload size={20} />
                      <span className="text-xs mt-1 font-medium">Change</span>
                    </label>
                  </div>
                  <button
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-gray-600 font-bold text-3xl md:text-4xl mb-2">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload-profile"
                  />
                  <label
                    htmlFor="avatar-upload-profile"
                    className="cursor-pointer text-gray-500 text-sm hover:text-gray-700 transition-colors font-medium"
                  >
                    {uploadingAvatar ? 'Uploading...' : 'Add photo'}
                  </label>
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-4 md:mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{user.name || 'User'}</h1>
                <button
                  onClick={() => setEditingBio(!editingBio)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium cursor-pointer"
                >
                  <Edit size={16} />
                  <span>{editingBio ? 'Cancel' : 'Edit Bio'}</span>
                </button>
              </div>

              {editingBio ? (
                <div className="mb-8">
                  <textarea
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  <div className="flex justify-end mt-3 space-x-3">
                    <button
                      onClick={() => setEditingBio(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBioUpdate}
                      className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mb-6 md:mb-8 text-base md:text-lg leading-relaxed">{user.bio || 'No bio yet.'}</p>
              )}

              <div className="flex flex-wrap gap-4 md:gap-8 text-sm">
                <div>
                  <span className="font-medium text-gray-900 text-lg">{user.followers?.length || 0}</span>
                  <span className="text-gray-500 ml-2">Followers</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 text-lg">{user.following?.length || 0}</span>
                  <span className="text-gray-500 ml-2">Following</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 text-lg">{posts.length}</span>
                  <span className="text-gray-500 ml-2">Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex space-x-6 md:space-x-8 mb-8 md:mb-12">
          <button className="text-gray-900 font-medium border-b-2 border-gray-900 pb-2 cursor-pointer">
            Stories
          </button>
          <button className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
            About
          </button>
        </div>

        {/* User's Posts */}
        <div className="space-y-12">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article key={post._id} className="border-b border-gray-200 pb-12 last:border-b-0">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Author Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {getAuthorAvatar(post.author) ? (
                        <img
                          src={getAuthorAvatar(post.author)!}
                          alt={getAuthorName(post.author)}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium text-sm">
                          {(getAuthorName(post.author) || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {getAuthorName(post.author)}
                      </span>
                      <span className="text-gray-400">·</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    <Link to={`/post/${post.slug}`}>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 hover:text-gray-700 transition-colors leading-tight">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed text-sm sm:text-base">
                      {post.description}
                    </p>

                    {/* Post Stats */}
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>5 min read</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart size={14} />
                        <span>{post.likes?.length ?? 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle size={14} />
                        <span>{post.comments?.length ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="flex-shrink-0 sm:ml-8">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No stories yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Be the first to share your thoughts and start a conversation!</p>
              <Link
                to="/write"
                className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Write your first story
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
