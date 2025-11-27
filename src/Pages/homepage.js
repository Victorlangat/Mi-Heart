import React, { useRef, useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OurServices from '../components/ourservices';
import './homepage.css';

const Homepage = () => {
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated, user, getDisplayName } = useAuth();

  // Scroll to sections if URL hash matches
  React.useEffect(() => {
    if (location.hash === '#about' && aboutRef.current) {
      aboutRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    if (location.hash === '#services' && servicesRef.current) {
      servicesRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [location]);

  // Animation trigger
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // RESTORED: Perfect UX functions
  const canBook = () => {
    return user?.userType === 'client';
  };

  const canOfferServices = () => {
    return user?.userType === 'cleaner';
  };

  const handleBookNow = () => {
    if (isAuthenticated) {
      if (canBook()) {
        navigate('/booking');
      } else {
        alert('Cleaners cannot book services. Please use a client account.');
      }
    } else {
      navigate('/signup', { state: { userType: 'client' } });
    }
  };

  const handleFindClients = () => {
    if (isAuthenticated) {
      if (canOfferServices()) {
        navigate('/find-client');
      } else {
        alert('Only cleaners can offer services. Please sign up as a cleaner.');
      }
    } else {
      navigate('/signup', { state: { userType: 'cleaner' } });
    }
  };

  const getWelcomeMessage = () => {
    if (!isAuthenticated) {
      return "Request your trusted cleaners";
    }
    
    const name = getDisplayName();
    const time = new Date().getHours();
    let greeting = "Hello";
    
    if (time < 12) greeting = "Good morning";
    else if (time < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    
    return `${greeting}, ${name}! Ready to ${user?.userType === 'client' ? 'book a cleaning' : 'find cleaning jobs'}?`;
  };

  const getHeroDescription = () => {
    if (!isAuthenticated) {
      return "Experience premium cleaning services with verified professionals. Book instantly or join our network of trusted cleaners.";
    }
    
    if (user?.userType === 'client') {
      return `Welcome back! You have ${user.bookings || 0} previous bookings. Ready for your next spotless experience?`;
    } else {
      return `Welcome back! You've completed ${user.completedJobs || 0} jobs with a ${user.rating || '5.0'}★ rating. New clients are waiting!`;
    }
  };

  const getHeroBadge = () => {
    if (!isAuthenticated) return 'Premium Cleaning Services';
    
    return user?.userType === 'client' ? 'Premium Cleaning Services' : 'Professional Cleaning Jobs';
  };

  const getPrimaryButton = () => {
    if (!isAuthenticated) {
      return (
        <Link to="/booking" className="hero-btn booking-btn" style={{ textDecoration: 'none' }}>
          <span className="btn-text">Book Cleaning</span>
          <div className="btn-hover-effect"></div>
          <div className="btn-sparkle"></div>
        </Link>
      );
    }
    
    if (user?.userType === 'client') {
      return (
        <button onClick={handleBookNow} className="hero-btn booking-btn">
          <span className="btn-text">Book Cleaning</span>
          <div className="btn-hover-effect"></div>
          <div className="btn-sparkle"></div>
        </button>
      );
    } else {
      return (
        <button onClick={handleFindClients} className="hero-btn booking-btn">
          <span className="btn-text">View Available Jobs</span>
          <div className="btn-hover-effect"></div>
          <div className="btn-sparkle"></div>
        </button>
      );
    }
  };

  const getSecondaryButton = () => {
    if (!isAuthenticated) {
      return (
        <button onClick={handleFindClients} className="hero-btn client-btn">
          <span className="btn-text">Find Clients</span>
          <div className="btn-hover-effect"></div>
        </button>
      );
    }
    
    // For authenticated users, show different secondary actions
    if (user?.userType === 'client') {
      return (
        <Link to="/my-bookings" className="hero-btn client-btn" style={{ textDecoration: 'none' }}>
          <span className="btn-text">My Bookings</span>
          <div className="btn-hover-effect"></div>
        </Link>
      );
    } else {
      return (
        <Link to="/cleaner/applications" className="hero-btn client-btn" style={{ textDecoration: 'none' }}>
          <span className="btn-text">My Applications</span>
          <div className="btn-hover-effect"></div>
        </Link>
      );
    }
  };

  const getTrustIndicators = () => {
    if (!isAuthenticated) {
      return (
        <>
          <div className="trust-item">
            <div className="trust-icon">✅</div>
            <span>Verified Professionals</span>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🛡️</div>
            <span>Fully Insured</span>
          </div>
          <div className="trust-item">
            <div className="trust-icon">⭐</div>
            <span>5-Star Rated</span>
          </div>
        </>
      );
    }

    if (user?.userType === 'client') {
      return (
        <>
          <div className="trust-item">
            <div className="trust-icon">📅</div>
            <span>{user.bookings || 0} Bookings</span>
          </div>
          <div className="trust-item">
            <div className="trust-icon">⭐</div>
            <span>Loyal Customer</span>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🎯</div>
            <span>Priority Support</span>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="trust-item">
            <div className="trust-icon">💼</div>
            <span>{user.completedJobs || 0} Jobs</span>
          </div>
          <div className="trust-item">
            <div className="trust-icon">⭐</div>
            <span>{user.rating || '5.0'} Rating</span>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🚀</div>
            <span>Top Cleaner</span>
          </div>
        </>
      );
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-gradient-overlay"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className={`hero-text ${isVisible ? 'animate-in' : ''}`}>
              <div className="text-wrapper">
                <div className="hero-badge">
                  <span>{getHeroBadge()}</span>
                </div>
                
                <h1 className="hero-title">
                  {getWelcomeMessage()}
                </h1>
                
                <p className="hero-subtitle">
                  {getHeroDescription()}
                </p>
                
                <div className="hero-buttons">
                  {getPrimaryButton()}
                  {getSecondaryButton()}
                </div>

                {/* Trust Indicators */}
                <div className="trust-indicators">
                  {getTrustIndicators()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
          <span>Discover More</span>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="about-section">
        {/* ... your about section content ... */}
      </section>

      {/* Services Section */}
      <div ref={servicesRef}>
        <OurServices />
      </div>
    </div>
  );
};

export default Homepage;