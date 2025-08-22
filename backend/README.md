# Medium Clone Backend API

A robust, scalable backend API for a Medium-style blogging platform built with Node.js, Express, and MongoDB.

## Features

### Core Functionality
- **User Management**: Registration, authentication, profile management
- **Content Creation**: Rich text posts with slugs, tags, and metadata
- **Social Features**: Follow/unfollow users, like posts and comments
- **Commenting System**: Nested comments with replies
- **Search Engine**: Full-text search across posts, users, and tags
- **Feed System**: Personalized content discovery

### Technical Highlights
- **JWT Authentication** with HTTP-only cookies
- **Password Hashing** with bcrypt
- **Input Validation** using Zod schemas
- **RESTful API Design** with proper HTTP status codes
- **MongoDB Integration** with Mongoose ODM
- **Modular Architecture** following MVC pattern

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Environment**: dotenv
- **Development**: Nodemon

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── UserController.js     # User operations
│   │   ├── ContentController.js  # Post CRUD operations
│   │   ├── CommentController.js  # Comment management
│   │   ├── ActivityController.js # Social interactions
│   │   └── SearchController.js   # Search functionality
│   ├── middlewares/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── UserModel.js         # User schema
│   │   ├── PostModel.js         # Post schema
│   │   ├── Comment.js           # Comment schema
│   │   └── BlacklistToken.js    # Token blacklist
│   ├── routes/
│   │   ├── UserRoute.js         # User endpoints
│   │   ├── PostRoute.js         # Post endpoints
│   │   ├── CommentRoute.js      # Comment endpoints
│   │   ├── ActivityRoute.js     # Social features
│   │   └── feedRoute.js         # Feed generation
│   ├── services/
│   │   ├── UserService.js       # User business logic
│   │   ├── PostService.js       # Post business logic
│   │   └── SearchService.js     # Search algorithms
│   └── utils/
│       ├── Helpers.js           # Utility functions
│       └── ZodValidations.js    # Input validation schemas
├── .env                         # Environment variables
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medium-app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   PORT=3000
   MONGO_URL=mongodb://localhost:27017/medium-app
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify installation**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/user/register` | User registration | No |
| `POST` | `/api/v1/user/login` | User login | No |
| `POST` | `/api/v1/user/logout` | User logout | Yes |
| `GET` | `/api/v1/user/profile` | Get user profile | Yes |
| `PATCH` | `/api/v1/user/:id/bio` | Update user bio | Yes |

### Content Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/posts/create` | Create new post | Yes |
| `GET` | `/api/v1/posts` | Get all posts | Yes |
| `GET` | `/api/v1/posts/:slug` | Get post by slug | No |
| `PATCH` | `/api/v1/posts/:slug` | Update post | Yes |
| `DELETE` | `/api/v1/posts/:slug` | Delete post | Yes |

### Social Features

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/user/follow` | Follow user | Yes |
| `POST` | `/api/v1/user/unfollow` | Unfollow user | Yes |
| `POST` | `/api/v1/posts/like-unlike` | Like/unlike post | Yes |
| `POST` | `/api/v1/posts/comments/like-unlike` | Like/unlike comment | Yes |

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/posts/comments/:slug` | Add comment | Yes |
| `GET` | `/api/v1/posts/comments/:slug` | Get comments | No |
| `DELETE` | `/api/v1/posts/comments/:commentId` | Delete comment | Yes |

### Search

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/v1/search?q=query&type=posts` | Search content | No |
| `GET` | `/api/v1/search/suggestions?q=query` | Search suggestions | No |
| `GET` | `/api/v1/trending` | Get trending content | No |

## API Usage Examples

### User Registration
```bash
curl -X POST http://localhost:3000/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "bio": "Software Developer"
  }'
```

### Create Post
```bash
curl -X POST http://localhost:3000/api/v1/posts/create \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your-jwt-token" \
  -d '{
    "title": "Getting Started with Node.js",
    "content": "<p>Node.js is a powerful runtime...</p>",
    "tags": ["nodejs", "javascript", "backend"],
    "imageUrl": "https://example.com/image.jpg"
  }'
```

### Search Posts
```bash
curl "http://localhost:3000/api/v1/search?q=javascript&type=posts&page=1&limit=10"
```

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  bio: String,
  avatar: String,
  followers: [ObjectId],
  following: [ObjectId],
  likedPosts: [ObjectId],
  createdAt: Date
}
```

### Post Model
```javascript
{
  title: String,
  content: String,
  slug: String (unique),
  description: String,
  author: ObjectId,
  tags: [String],
  imageUrl: String,
  likes: [ObjectId],
  comments: [ObjectId],
  createdAt: Date
}
```

### Comment Model
```javascript
{
  content: String,
  author: ObjectId,
  post: ObjectId,
  replies: [ObjectId],
  likes: [ObjectId],
  createdAt: Date
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: HTTP-only cookies
- **Token Blacklisting**: Secure logout implementation
- **Input Validation**: Zod schema validation
- **CORS Configuration**: Cross-origin request handling
- **Environment Variables**: Sensitive data protection



## Performance Considerations

- **Database Indexing**: Optimized queries on frequently accessed fields
- **Pagination**: Efficient data loading for large datasets
- **Aggregation Pipelines**: Optimized search and trending algorithms
- **Connection Pooling**: MongoDB connection optimization

## Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Using Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Future Enhancements

- [ ] **Email Notifications**: User engagement alerts
- [ ] **File Upload**: Image and media handling
- [ ] **Rate Limiting**: API abuse prevention
- [ ] **Caching Layer**: Redis integration
- [ ] **Real-time Features**: WebSocket notifications
- [ ] **Content Moderation**: Automated filtering
- [ ] **Analytics**: User behavior tracking
- [ ] **API Versioning**: Backward compatibility

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- **Akhand** - *Initial work* - [GitHub](https://github.com/Akhand0ps)

## Acknowledgments

- Express.js community for the robust framework
- MongoDB team for the flexible database
- All contributors and testers
