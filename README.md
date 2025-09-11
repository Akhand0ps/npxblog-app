# npxblog - Full Stack Blog Application

A modern, full-stack blog application inspired by npx, built with React.js (TypeScript) frontend and Node.js/Express.js backend. This platform allows users to create, read, and interact with blog posts in a clean, responsive interface.

## 🌟 Features

### Core Functionality
- **User Authentication** - Secure user registration and login with JWT tokens
- **Post Management** - Create, edit, and delete blog posts with rich content
- **Content Discovery** - Browse and search through published articles
- **User Profiles** - Personalized user profiles and author pages
- **Comments System** - Interactive commenting on posts
- **Activity Tracking** - User activity and engagement metrics
- **Responsive Design** - Mobile-first approach with Tailwind CSS

### Technical Features
- **RESTful API** - Well-structured backend API with proper HTTP methods
- **Real-time Updates** - Dynamic content loading and updates
- **Image Upload** - Cloudinary integration for media management
- **Search Functionality** - Advanced search capabilities
- **Input Validation** - Zod schema validation for data integrity
- **Security** - Protected routes and secure authentication

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icon library
- **Cloudinary** - Image and media management

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js 5** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing and security
- **Zod** - Schema validation library
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - Cookie handling middleware
- **Slugify** - URL-friendly string generation

## 📁 Project Structure

```
npx-app/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middlewares/       # Custom middleware
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helper functions
│   ├── app.js                # Express app configuration
│   ├── index.js              # Server entry point
│   └── package.json          # Backend dependencies
│
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── assets/          # Static assets
│   ├── public/              # Public static files
│   └── package.json         # Frontend dependencies
│
└── README.md                # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Akhand0ps/npxblog-app.git
   cd npx-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/npx-clone
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

#### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:3000/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### Running the Application

#### Development Mode

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend server will run on `http://localhost:3000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend application will run on `http://localhost:5173`

#### Production Build

1. **Build the Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Preview Production Build**
   ```bash
   npm run preview
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID

### Post Endpoints
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:slug` - Get post by slug
- `POST /api/posts` - Create new post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

### Comment Endpoints
- `GET /api/posts/:postId/comments` - Get comments for post
- `POST /api/posts/:postId/comments` - Add comment (protected)
- `DELETE /api/comments/:id` - Delete comment (protected)

### Search & Activity
- `GET /api/search` - Search posts and users
- `GET /api/activity` - Get user activity feed

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run lint
```

### Backend Testing
```bash
cd backend
npm test
```

## 🔧 Development Guidelines

### Code Style
- Use **TypeScript** for type safety in frontend
- Follow **ESLint** configurations
- Use **Prettier** for code formatting
- Follow **REST API** conventions for backend

### Git Workflow
1. Create feature branches from `main`
2. Use descriptive commit messages
3. Submit pull requests for code review
4. Ensure all tests pass before merging

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables on the platform

### Backend Deployment (Railway/Heroku)
1. Set up MongoDB Atlas for production database
2. Configure environment variables
3. Deploy from the `backend` directory

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📝 License

This project is licensed under the ISC License - see the package.json files for details.

## 👨Author

**Akhand Singh**
- GitHub: [@Akhand0ps](https://github.com/Akhand0ps)


## Support

For support, please open an issue in the GitHub repository or contact the maintainer.

---

**Happy Blogging! 📝✨**
