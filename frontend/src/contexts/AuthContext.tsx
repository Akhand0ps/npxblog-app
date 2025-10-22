import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, ApiError } from '../utils/api';
import type { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { name: string; email: string; password: string; bio?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateBio: (bio: string) => Promise<{ success: boolean; error?: string }>;
  updateAvatar: (avatarUrl: string) => Promise<{ success: boolean; error?: string }>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Show loading for minimum 500ms to prevent flash, then check auth
    const minLoadingTime = setTimeout(() => {
      setLoading(false);
    }, 500);

    // Defer auth check to allow immediate rendering
    const authCheckTimeout = setTimeout(() => {
      checkAuthStatus();
    }, 100);
    
    return () => {
      clearTimeout(minLoadingTime);
      clearTimeout(authCheckTimeout);
    };
  }, []);

  const checkAuthStatus = async () => {
    if (authChecked) return; // Prevent multiple auth checks
    
    try {
      if (import.meta.env.DEV) console.log('🔍 AuthContext - Checking authentication status...');
      const response = await api.getProfile();
      if (import.meta.env.DEV) console.log('✅ AuthContext - Profile response:', response);
      
      // Handle 304 Not Modified response - user is authenticated
      if ((response as any)?.status === 304) {
        if (import.meta.env.DEV) console.log('ℹ️ AuthContext - Received 304 Not Modified from profile endpoint');
        if (user) {
          if (import.meta.env.DEV) console.log('ℹ️ AuthContext - Keeping existing user from state:', user.name);
          setIsAuthenticated(true);
          return;
        }
        // If 304 but no user in state, treat as unauthenticated
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      
      if (response && (response as any).data) {
        const userData = (response as any).data as User;
        if (import.meta.env.DEV) console.log('✅ AuthContext - User authenticated:', userData.name, 'ID:', userData._id);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        if (import.meta.env.DEV) console.log('❌ AuthContext - No user data in response');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.log('❌ AuthContext - Authentication check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      
      // If it's a timeout or network error, keep loading false so app can still be used
      if (error instanceof ApiError && (error.status === 408 || error.status === 0)) {
        if (import.meta.env.DEV) console.log('� AuthContext - Network/timeout error, allowing unauthenticated access');
      }
    } finally {
      if (import.meta.env.DEV) console.log('🔄 AuthContext - Authentication check complete');
      setAuthChecked(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      if (import.meta.env.DEV) console.log('🔐 AuthContext - Attempting login...');
      const response = await api.login({ email, password });
      if (import.meta.env.DEV) console.log('✅ AuthContext - Login response:', response);
      
      if (response.token) {
        if (import.meta.env.DEV) console.log('✅ AuthContext - Login successful, updating auth state...');
        
        // After successful login, fetch user profile and update state
        setAuthChecked(false); // Allow re-checking auth
        await checkAuthStatus();
        if (import.meta.env.DEV) console.log('✅ AuthContext - Login complete, auth state updated');
        return { success: true };
      }
      return { success: false, error: 'Login failed. Please try again.' };
    } catch (error) {
      console.error('❌ AuthContext - Login failed:', error);
      const errorMessage = error instanceof ApiError ? error.message : 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: { name: string; email: string; password: string; bio?: string; avatar?: string }) => {
    try {
      if (import.meta.env.DEV) console.log('📝 AuthContext - Attempting registration...');
      const response = await api.register(userData);
      if (import.meta.env.DEV) console.log('✅ AuthContext - Registration response:', response);
      
      if (response.userId) {
        if (import.meta.env.DEV) console.log('✅ AuthContext - Registration successful, updating auth state...');
        
        // After successful registration, fetch user profile and update state
        setAuthChecked(false); // Allow re-checking auth
        await checkAuthStatus();
        if (import.meta.env.DEV) console.log('✅ AuthContext - Registration complete, auth state updated');
        return { success: true };
      }
      return { success: false, error: 'Registration failed. Please try again.' };
    } catch (error) {
      console.error('❌ AuthContext - Registration failed:', error);
      const errorMessage = error instanceof ApiError ? error.message : 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      if (import.meta.env.DEV) console.log('🚪 AuthContext - Logging out...');
      await api.logout();
    } catch (error) {
      if (import.meta.env.DEV) console.error('AuthContext - Logout error:', error);
    } finally {
      // Clear local state regardless of API response
      if (import.meta.env.DEV) console.log('✅ AuthContext - Logout complete, clearing state');
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(false);
    }
  };

  const updateBio = async (bio: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const response = await api.updateBio(user._id, { bio });
      if (response.message) {
        // Update local user state
        setUser({ ...user, bio });
        return { success: true };
      }
      return { success: false, error: 'Bio update failed' };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Bio update failed';
      return { success: false, error: errorMessage };
    }
  };

  const updateAvatar = async (avatarUrl: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const response = await api.updateAvatar(user._id, avatarUrl);
      if (response.message) {
        // Update local user state
        setUser({ ...user, avatar: avatarUrl });
        return { success: true };
      }
      return { success: false, error: 'Avatar update failed' };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Avatar update failed';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    updateBio,
    updateAvatar,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
