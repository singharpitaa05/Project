// AUTHENTICATION CONTEXT

// Global authentication context for managing user state
import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Axios instance with base URL
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  });

  // Add token to requests if available
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Signup function
  const signup = async (email, password, phone) => {
    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        phone
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Signup failed' };
    }
  };

  // Verify OTP function
  const verifyOTP = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp
      });
      
      const { user: userData, token: authToken } = response.data.data;
      
      // Save token and user
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'OTP verification failed' };
    }
  };

  // Resend OTP function
  const resendOTP = async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resend OTP' };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      const { user: userData, token: authToken } = response.data.data;
      
      // Save token and user
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  // Update profile function
  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/profile', data);
      setUser(response.data.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Profile update failed' };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password change failed' };
    }
  };

  const value = {
    user,
    token,
    loading,
    signup,
    verifyOTP,
    resendOTP,
    login,
    logout,
    updateProfile,
    changePassword,
    api
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};