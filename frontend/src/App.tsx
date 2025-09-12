import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar.tsx';

// Lazy load components
const HomePage = lazy(() => import('./pages/HomePage.tsx'));
const PostPage = lazy(() => import('./pages/PostPage.tsx'));
const WritePage = lazy(() => import('./pages/WritePage.tsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.tsx'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage.tsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.tsx'));
const EditPostPage = lazy(() => import('./pages/EditPostPage.tsx'));

// Loading component
const PageLoader = () => (
  <div className="min-h-96 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-full">
        <div className="spinner w-6 h-6 border-white border-2 border-t-transparent"></div>
      </div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/post/:slug" element={<PostPage />} />
                <Route path="/post/:slug/edit" element={<EditPostPage />} />
                <Route path="/write" element={<WritePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/user/:userId" element={<UserProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
