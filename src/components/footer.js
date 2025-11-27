import React from 'react';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/#about' }
  ];

  const services = [
    'Residential Cleaning',
    'Commercial Cleaning',
    'Deep Cleaning',
    'Move In/Out Cleaning'
  ];

  const socialLinks = [
    { name: 'Facebook', icon: '', url: '#' },
    { name: 'Twitter', icon: '', url: '#' },
    { name: 'Instagram', icon: '', url: '#' },
    { name: 'LinkedIn', icon: '', url: '#' }
  ];

  return (
    <footer className="footer">
      <div className="footer-wave"></div>
      
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section company-info">
            <div className="footer-logo">
              <span className="logo-text">MadEasy</span>
              <div className="logo-underline"></div>
            </div>
            <p className="company-description">
              Connecting you with trusted cleaning professionals for a spotless 
              home and peace of mind. Quality service made easy.
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon"></span>
                <span>hello@madeasy.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon"></span>
                <span>+254-7123-4567</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon"></span>
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={link.name} className="footer-link-item">
                  <a 
                    href={link.path} 
                    className="footer-link"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="link-icon">→</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h3 className="footer-title">Our Services</h3>
            <ul className="footer-links">
              {services.map((service, index) => (
                <li key={service} className="footer-link-item">
                  <a 
                    href="/services" 
                    className="footer-link"
                    style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
                  >
                    <span className="link-icon"></span>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section newsletter">
            <h3 className="footer-title">Stay Updated</h3>
            <p className="newsletter-description">
              Subscribe to get special offers and cleaning tips
            </p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button className="newsletter-btn">
                <span>Subscribe</span>
                <div className="btn-hover-effect"></div>
              </button>
            </div>
            
            {/* Social Links */}
            <div className="social-links">
              <h4 className="social-title">Follow Us</h4>
              <div className="social-icons">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    className="social-icon"
                    aria-label={social.name}
                  >
                    <span className="social-emoji">{social.icon}</span>
                    <div className="social-tooltip">{social.name}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              © {currentYear} MadEasy. All rights reserved.
            </div>
            <div className="footer-legal">
              <a href="#privacy" className="legal-link">Privacy Policy</a>
              <a href="#terms" className="legal-link">Terms of Service</a>
              <a href="#cookies" className="legal-link">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="footer-floating-elements">
        <div className="floating-bubble bubble-1"></div>
        <div className="floating-bubble bubble-2"></div>
        <div className="floating-bubble bubble-3"></div>
      </div>
    </footer>
  );
};

export default Footer;