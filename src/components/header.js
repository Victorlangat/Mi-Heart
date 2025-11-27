import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './header.css';

const Header = () => {
  const { user, isAuthenticated, logout, getDisplayName } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when clicking on a link
  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  // Close user menu when clicking on a menu item
  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-text">MadEasy</span>
          <span className="logo-underline"></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav">
          {isAuthenticated ? (
            <>
              {user?.userType === 'client' ? (
                <>
                  <div className="nav-item">
                    <Link to="/booking" className="nav-link">Book Cleaning</Link>
                  </div>
                  <div className="nav-item">
                    <Link to="/my-bookings" className="nav-link">My Bookings</Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="nav-item">
                    <Link to="/find-client" className="nav-link">Dashboard</Link>
                  </div>
                  <div className="nav-item">
                    <Link to="/cleaner/jobs" className="nav-link">Available Jobs</Link>
                  </div>
                  <div className="nav-item">
                    <Link to="/cleaner/applications" className="nav-link">My Applications</Link>
                  </div>
                  <div className="nav-item">
                    <Link to="/cleaner/my-jobs" className="nav-link">My Jobs</Link>
                  </div>
                </>
              )}
              <div className="nav-item">
                <Link to="/profile" className="nav-link">Profile</Link>
              </div>
              <div className="nav-item">
                <button onClick={handleLogout} className="auth-btn sign-in">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <div className="nav-item">
                <Link to="/signin" className="auth-btn sign-in">Sign In</Link>
              </div>
              <div className="nav-item">
                <Link to="/signup" className="auth-btn sign-up">Sign Up</Link>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav-overlay" onClick={closeMobileMenu}>
            <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
              {isAuthenticated ? (
                <>
                  {user?.userType === 'client' ? (
                    <>
                      <Link to="/booking" className="nav-link" onClick={closeMobileMenu}>Book Cleaning</Link>
                      <Link to="/my-bookings" className="nav-link" onClick={closeMobileMenu}>My Bookings</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/find-client" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
                      <Link to="/cleaner/jobs" className="nav-link" onClick={closeMobileMenu}>Available Jobs</Link>
                      <Link to="/cleaner/applications" className="nav-link" onClick={closeMobileMenu}>My Applications</Link>
                      <Link to="/cleaner/my-jobs" className="nav-link" onClick={closeMobileMenu}>My Jobs</Link>
                    </>
                  )}
                  <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>Profile</Link>
                  <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="auth-btn sign-in">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="nav-link" onClick={closeMobileMenu}>Sign In</Link>
                  <Link to="/signup" className="auth-btn sign-up" onClick={closeMobileMenu}>Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        )}

        {/* User Menu Dropdown */}
        {isAuthenticated && (
          <div className="user-menu-container" ref={userMenuRef}>
            <div className="user-menu-trigger" onClick={toggleUserMenu}>
              <div className="user-avatar">
                {user?.userType === 'client' ? '👤' : '✨'}
              </div>
              <span className="user-greeting">Hi, {getDisplayName()}</span>
              <span className={`dropdown-arrow ${isUserMenuOpen ? 'rotated' : ''}`}>▼</span>
            </div>
            
            {isUserMenuOpen && (
              <div className="user-menu">
                <div className="user-info">
                  <div className="user-avatar-large">
                    {user?.userType === 'client' ? '👤' : '✨'}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user?.firstName} {user?.lastName}</div>
                    <div className="user-email">{user?.email}</div>
                    <div className="user-type-badge">
                      {user?.userType === 'client' ? 'Client' : 'Cleaner'}
                    </div>
                  </div>
                </div>
                
                <div className="user-menu-items">
                  <Link to="/profile" className="menu-item" onClick={closeUserMenu}>
                    <span className="menu-icon">👤</span>
                    <span>My Profile</span>
                  </Link>
                  
                  {user?.userType === 'client' ? (
                    <>
                      <Link to="/booking" className="menu-item" onClick={closeUserMenu}>
                        <span className="menu-icon">📅</span>
                        <span>Book Cleaning</span>
                      </Link>
                      <Link to="/my-bookings" className="menu-item" onClick={closeUserMenu}>
                        <span className="menu-icon">📋</span>
                        <span>My Bookings</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/find-client" className="menu-item" onClick={closeUserMenu}>
                        <span className="menu-icon">📊</span>
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/cleaner/jobs" className="menu-item" onClick={closeUserMenu}>
                        <span className="menu-icon">💼</span>
                        <span>Available Jobs</span>
                      </Link>
                      <Link to="/cleaner/applications" className="menu-item" onClick={closeUserMenu}>
                        <span className="menu-icon">📝</span>
                        <span>My Applications</span>
                      </Link>
                      <Link to="/cleaner/my-jobs" className="menu-item" onClick={closeUserMenu}>
                        <span className="menu-icon">🔄</span>
                        <span>My Jobs</span>
                      </Link>
                    </>
                  )}
                  
                  <div className="menu-divider"></div>
                  
                  <button onClick={handleLogout} className="menu-item logout-btn">
                    <span className="menu-icon">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;