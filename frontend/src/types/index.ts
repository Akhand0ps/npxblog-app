// User types - matching backend UserModel.js
export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string; // Only for registration
  bio?: string;
  avatar?: string;
  following?: string[]; // Array of User IDs
  followers?: string[]; // Array of User IDs
  likedPost?: string[]; // Array of Post IDs
  createdAt?: string;
  updatedAt?: string;
}

// Post types - matching backend PostModel.js
export interface Post {
  _id: string;
  author: User | string; // Can be populated User object or just ID
  title: string;
  slug: string;
  content: string;
  description: string;
  tags: string[];
  likes: string[]; // Array of User IDs
  comments: string[]; // Array of Comment IDs
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

// Comment types - matching backend Comment.js
export interface Comment {
  _id: string;
  author: User | string; // Can be populated User object or just ID
  post: string; // Post ID
  content: string;
  likes: string[]; // Array of User IDs
  // Backend returns populated nested replies; support both IDs and nested docs
  replies: Comment[] | string[];
  parentCommentId?: string; // Parent comment for replies
  createdAt: string;
  updatedAt?: string;
}

// API Response types - matching backend responses
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  userId?: string;
  token?: string;
  post?: Post;
  posts?: Post[];
  comment?: Comment;
  comments?: Comment[];
  user?: User;
  results?: Post[];
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
  error?: string;
}

// Feed response type
export interface FeedResponse {
  posts: Post[];
  hasMore: boolean;
}

// Search response type
export interface SearchResponse {
  results: Post[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: string;
}

export interface CreatePostForm {
  title: string;
  content: string;
  tags?: string[];
  imageUrl?: string;
}

export interface UpdatePostForm {
  title?: string;
  content?: string;
  tags?: string[];
  imageUrl?: string;
}

export interface CreateCommentForm {
  content: string;
  parentCommentId?: string;
}

export interface UpdateBioForm {
  bio: string;
}

// Activity types
export interface FollowRequest {
  targetId: string;
}

export interface LikeRequest {
  postId?: string;
  commentId?: string;
}

// Search types
export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
}
