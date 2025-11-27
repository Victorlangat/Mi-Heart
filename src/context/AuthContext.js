import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Single useEffect to initialize auth state from localStorage
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('madEasy_token');
      const userData = localStorage.getItem('madEasy_user');
      
      console.log('🔄 AuthContext: Checking auth status from localStorage');
      console.log('🔑 Token exists:', !!token);
      console.log('👤 User data exists:', !!userData);
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('✅ AuthContext: User found in localStorage:', parsedUser);
          setIsAuthenticated(true);
          setUser(parsedUser);
        } catch (error) {
          console.error('❌ AuthContext: Error parsing user data:', error);
          clearAuth();
        }
      } else {
        console.log('❌ AuthContext: No valid auth data in localStorage');
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('madEasy_token');
    localStorage.removeItem('madEasy_user');
    setUser(null);
    setIsAuthenticated(false);
    setErrors({});
  };

  const clearErrors = () => {
    setErrors({});
  };

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      clearErrors();
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('madEasy_token', data.data.token);
        localStorage.setItem('madEasy_user', JSON.stringify(data.data.user));
        
        setUser(data.data.user);
        setIsAuthenticated(true);
        
        console.log('✅ AuthContext: Login successful');
        return { success: true, user: data.data.user };
      } else {
        setErrors({ message: data.message || 'Login failed' });
        return { 
          success: false, 
          error: data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ message: 'Network error during login' });
      return { 
        success: false, 
        error: 'Network error during login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      clearErrors();
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('madEasy_token', data.data.token);
        localStorage.setItem('madEasy_user', JSON.stringify(data.data.user));
        
        setUser(data.data.user);
        setIsAuthenticated(true);
        
        return { success: true, user: data.data.user };
      } else {
        setErrors({ message: data.message || 'Registration failed' });
        return { 
          success: false, 
          error: data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ message: 'Network error during registration' });
      return { 
        success: false, 
        error: 'Network error during registration' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearAuth();
  };

  // Helper functions
  const getDisplayName = () => {
    if (!user) return 'Guest';
    return user.firstName || user.name || 'User';
  };

  const canBook = () => {
    return user?.userType === 'client';
  };

  const canOfferServices = () => {
    return user?.userType === 'cleaner';
  };

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    errors,
    
    // Auth actions
    register,
    login,
    logout,
    clearErrors,
    
    // Helper functions
    getDisplayName,
    canBook,
    canOfferServices,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;