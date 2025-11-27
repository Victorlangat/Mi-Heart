import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'client',
    phone: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const { register, isAuthenticated, isLoading, errors: authErrors, clearErrors } = useAuth();
  const navigate = useNavigate();

  // REDIRECT ONLY WHEN AUTHENTICATED
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearErrors();
  }, [clearErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (authErrors.message) {
      clearErrors();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Prepare data for API (remove confirmPassword)
    const { confirmPassword, ...submitData } = formData;
    
    const result = await register(submitData);
    
    if (result.success) {
      console.log('✅ Signup successful! Redirecting...');
    } else {
      console.log('❌ Signup failed:', result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-text">MadEasy</span>
          </Link>
          <h2>Create Your Account</h2>
          <p>Join thousands of satisfied customers and cleaners</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* User Type Selection */}
          <div className="user-type-selector">
            <label>I want to:</label>
            <div className="type-options">
              <button
                type="button"
                className={`type-option ${formData.userType === 'client' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'client' }))}
              >
                <span className="option-icon">👤</span>
                <span>Book Cleaning Services</span>
              </button>
              <button
                type="button"
                className={`type-option ${formData.userType === 'cleaner' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'cleaner' }))}
              >
                <span className="option-icon">✨</span>
                <span>Offer Cleaning Services</span>
              </button>
            </div>
          </div>

          {/* Name Fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={formErrors.firstName ? 'error' : ''}
                placeholder="Enter your first name"
                disabled={isLoading}
              />
              {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={formErrors.lastName ? 'error' : ''}
                placeholder="Enter your last name"
                disabled={isLoading}
              />
              {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email ? 'error' : ''}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {formErrors.email && <span className="error-message">{formErrors.email}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number (Optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
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
              className={formErrors.password ? 'error' : ''}
              placeholder="Create a password"
              disabled={isLoading}
            />
            {formErrors.password && <span className="error-message">{formErrors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={formErrors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {formErrors.confirmPassword && <span className="error-message">{formErrors.confirmPassword}</span>}
          </div>

          {/* Auth Error */}
          {authErrors.message && (
            <div className="submit-error">
              <span className="error-icon">⚠️</span>
              {authErrors.message}
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Login Link */}
          <div className="auth-switch">
            <p>
              Already have an account?{' '}
              <Link to="/signin" className="auth-link">Sign In</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;