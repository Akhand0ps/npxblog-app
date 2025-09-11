import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Heart, MessageCircle, Share2, UserPlus, UserMinus } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import type { Post, User } from '../types';

const PROD_ORIGIN = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined;

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const [{ data }, { posts }] = await Promise.all([
          api.getPublicProfile(userId),
          api.getPostsByUser(userId),
        ]);
        setProfile(data as User);
        setPosts(posts || []);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const isOwnProfile = currentUser?._id === userId;

  // Derive following state from the viewed profile's followers, not currentUser.following
  useEffect(() => {
    if (profile && currentUser) {
      setIsFollowing((profile.followers || []).includes(currentUser._id));
    } else {
      setIsFollowing(false);
    }
  }, [profile, currentUser]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated || !profile) return;
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await api.unfollowUser({ targetId: profile._id });
        // Optimistic update
        setProfile({
          ...profile,
          followers: (profile.followers || []).filter((id) => id !== currentUser!._id),
        });
        setIsFollowing(false);
      } else {
        await api.followUser({ targetId: profile._id });
        setProfile({
          ...profile,
          followers: [...(profile.followers || []), currentUser!._id],
        });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow/unfollow failed:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const baseOrigin = PROD_ORIGIN && PROD_ORIGIN.startsWith('http') ? PROD_ORIGIN : window.location.origin;
  const shareUrl = `${baseOrigin}/post/${posts[0]?.slug || ''}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">User not found</div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mx-auto md:mx-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl md:text-3xl text-gray-600 font-bold">{profile.name?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile.name}</h1>
                {!isOwnProfile && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={!isAuthenticated || followLoading}
                    className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full font-medium transition-colors ${
                      isFollowing ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                    } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
              <p className="text-gray-700 mt-3 text-base md:text-lg">{profile.bio || 'No bio yet.'}</p>
              <div className="flex flex-wrap gap-4 md:gap-8 mt-4 text-sm">
                <div><span className="font-semibold">{profile.followers?.length || 0}</span> Followers</div>
                <div><span className="font-semibold">{profile.following?.length || 0}</span> Following</div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => navigator.share?.({ url: shareUrl }) || navigator.clipboard.writeText(shareUrl)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <Share2 size={18} /> Share profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Stories</h2>
        <div className="space-y-12">
          {posts.length === 0 ? (
            <div className="text-gray-500">No stories yet.</div>
          ) : (
            posts.map((post) => (
              <article key={post._id} className="border-b border-gray-200 pb-8 sm:pb-10">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-sm text-gray-500">
                      <span>{profile.name}</span>
                      <span>·</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <a href={`/post/${post.slug}`} className="group">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-gray-700">{post.title}</h3>
                    </a>
                    <p className="text-gray-600 mt-2 sm:mt-3 line-clamp-3 text-sm sm:text-base">{post.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500 mt-3 sm:mt-4">
                      <div className="inline-flex items-center gap-1"><Clock size={14} /> <span>5 min read</span></div>
                      <div className="inline-flex items-center gap-1"><Heart size={14} /> <span>{post.likes.length}</span></div>
                      <div className="inline-flex items-center gap-1"><MessageCircle size={14} /> <span>{post.comments.length}</span></div>
                    </div>
                  </div>
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="w-full sm:w-28 h-40 sm:h-24 object-cover rounded" />
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
