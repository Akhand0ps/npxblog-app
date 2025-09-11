import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Upload, X, User, Mail, Lock, FileText, Camera, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { uploadToCloudinary } from '../utils/cloudinary';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    avatar: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one letter and one number';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
    } catch (error) {
      setError('Failed to upload image. Please try again.');
      console.error('Image upload error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await register({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim()
      });

      if (result?.success) {
        navigate('/profile', { replace: true });
      } else {
        setError(result?.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mb-6 shadow-lg">
            <div className="spinner w-6 h-6 border-white"></div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mb-6 shadow-lg">
            <span className="text-white font-bold text-xl">npx</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join npx</h1>
          <p className="text-gray-600">Create your account to start writing amazing stories</p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3 fade-in">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Profile Picture */}
            <div className="flex justify-center">
              <div className="relative">
                {formData.avatar ? (
                  <div className="relative">
                    <img
                      src={formData.avatar}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Remove profile picture"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <Camera size={32} className="text-gray-400" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={loading || uploadingImage}
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full p-2 hover:bg-emerald-600 transition-colors shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  aria-label="Upload profile picture"
                >
                  {uploadingImage ? (
                    <div className="w-4 h-4 spinner"></div>
                  ) : (
                    <Upload size={16} />
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-base pl-10 ${
                      fieldErrors.name 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                    }`}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-2 text-sm text-red-600 fade-in">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-base pl-10 ${
                      fieldErrors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                    }`}
                    placeholder="Enter your email address"
                    disabled={loading}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-2 text-sm text-red-600 fade-in">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-base pl-10 pr-10 ${
                      fieldErrors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                    }`}
                    placeholder="Create a strong password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-2 text-sm text-red-600 fade-in">{fieldErrors.password}</p>
                )}
                {!fieldErrors.password && formData.password && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Password strength:</div>
                    <div className="flex space-x-1">
                      <div className={`h-1 w-full rounded ${formData.password.length >= 6 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1 w-full rounded ${/[A-Za-z]/.test(formData.password) ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1 w-full rounded ${/\d/.test(formData.password) ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="input-base pl-10 resize-none"
                    placeholder="Tell us about yourself..."
                    disabled={loading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.bio.length}/200 characters
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                {loading ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors duration-200 focus:outline-none focus:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-500 fade-in" style={{ animationDelay: '300ms' }}>
          <p>
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
