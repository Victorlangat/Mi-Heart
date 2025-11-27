import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const { login, isAuthenticated, isLoading, errors, clearErrors } = useAuth();
  const navigate = useNavigate();

  // FIXED: Redirect only when authenticated AND not loading
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('🚀 Redirecting to homepage...');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // FIXED: Remove the problematic clearErrors useEffect
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password) {
      return;
    }

    console.log('📤 Attempting login...');
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      console.log('✅ SignIn: Login successful, waiting for redirect...');
    } else {
      console.log('❌ SignIn: Login failed:', result.error);
    }
  };

  const fillDemoCredentials = (type) => {
    const demos = {
      client: { email: 'client@demo.com', password: 'password123' },
      cleaner: { email: 'cleaner@demo.com', password: 'password123' }
    };
    
    setFormData(prev => ({
      ...prev,
      ...demos[type]
    }));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-text">MadEasy</span>
          </Link>
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <p>Quick test:</p>
          <div className="demo-buttons">
            <button 
              type="button" 
              className="demo-btn client-demo"
              onClick={() => fillDemoCredentials('client')}
              disabled={isLoading}
            >
              Client Demo
            </button>
            <button 
              type="button" 
              className="demo-btn cleaner-demo"
              onClick={() => fillDemoCredentials('cleaner')}
              disabled={isLoading}
            >
              Cleaner Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {/* Submit Error */}
          {errors.message && (
            <div className="submit-error">
              <span className="error-icon">⚠️</span>
              {errors.message}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Sign Up Link */}
          <div className="auth-switch">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">Sign Up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;