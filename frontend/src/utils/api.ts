// API utility functions - matching backend endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
    // Avoid 304 responses breaking fetch() for XHR by disabling HTTP cache
    cache: 'no-store',
    ...options,
  };

  try {
    const response = await fetch(url, config);
    // Treat 304 Not Modified as a non-fatal condition
    if (response.status === 304) {
      return { status: 304 } as any;
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error');
  }
};

export const api = {
  // User endpoints - matching UserRoute.js
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: { name: string; email: string; password: string; bio?: string; avatar?: string }) =>
    apiRequest('/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () =>
    apiRequest('/user/logout', {
      method: 'POST',
    }),

  getProfile: () => apiRequest('/user/profile'),
  // Public user profile by ID
  getPublicProfile: (userId: string) => apiRequest(`/user/profile/${userId}`),

  updateBio: (userId: string, bioData: { bio: string }) =>
    apiRequest(`/user/${userId}/bio`, {
      method: 'PATCH',
      body: JSON.stringify(bioData),
    }),

  updateAvatar: (userId: string, avatarUrl: string) =>
    apiRequest(`/user/${userId}/avatar`, {
      method: 'PATCH',
      body: JSON.stringify({ avatar: avatarUrl }),
    }),

  // Post endpoints - matching PostRoute.js
  getAllPosts: () => apiRequest('/posts/get-posts'),

  getPost: (slug: string) => apiRequest(`/posts/${slug}`),
  // Public posts by user
  getPostsByUser: (userId: string) => apiRequest(`/posts/by-user/${userId}`),

  createPost: (postData: { title: string; content: string; tags?: string[]; imageUrl?: string }) =>
    apiRequest('/posts/create-post', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),

  updatePost: (slug: string, postData: { title?: string; content?: string; tags?: string[]; imageUrl?: string }) =>
    apiRequest(`/posts/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    }),

  deletePost: (slug: string) =>
    apiRequest(`/posts/${slug}`, {
      method: 'DELETE',
    }),

  likeUnlikePost: (postData: { postId: string }) =>
    apiRequest('/posts/like-unlike', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),

  // Comment endpoints - matching CommentRoute.js
  getComments: (slug: string) => apiRequest(`/posts/comments/${slug}`),

  createComment: (slug: string, commentData: { content: string; parentCommentId?: string }) =>
    apiRequest(`/posts/comments/${slug}`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    }),

  deleteComment: (commentId: string) =>
    apiRequest(`/posts/comments/${commentId}`, {
      method: 'DELETE',
    }),

  likeUnlikeComment: (commentData: { commentId: string }) =>
    apiRequest('/posts/comments/like-unlike', {
      method: 'POST',
      body: JSON.stringify(commentData),
    }),

  // Social features - matching ActivityRoute.js
  followUser: (followData: { targetId: string }) =>
    apiRequest('/user/follow', {
      method: 'POST',
      body: JSON.stringify(followData),
    }),

  unfollowUser: (followData: { targetId: string }) =>
    apiRequest('/user/unfollow', {
      method: 'POST',
      body: JSON.stringify(followData),
    }),

  // Feed and Search - matching feedRoute.js
  getFeed: (params?: { lastId?: string; limit?: number }) => {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiRequest(`/feed${query}`);
  },

  search: (params: { q: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any);
    return apiRequest(`/search?${query}`);
  },
};

export { ApiError };
