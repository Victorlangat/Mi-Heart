import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import '../Pages/homepage.css';
import './ourservices.css';

const OurServices = () => {
  const [activeService, setActiveService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate('/booking');
  };

  const handleCardClick = (service) => {
    setSelectedService(service);
    setShowPopup(true);
    // Prevent body scroll when popup is open
    document.body.style.overflow = 'hidden';
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedService(null);
    // Re-enable body scroll
    document.body.style.overflow = 'unset';
  };

  const handlePopupBookNow = () => {
    setShowPopup(false);
    document.body.style.overflow = 'unset';
    navigate('/booking');
  };

  const services = [
    {
      id: 1,
      title: 'Standard Cleaning',
      description: 'Regular maintenance cleaning to keep your space fresh and tidy.',
      features: [
        'Dusting all surfaces',
        'Vacuuming & mopping floors',
        'Kitchen & bathroom sanitization',
        'Trash removal',
        'Surface wiping'
      ],
      price: 'From 2000/=',
      duration: '2-3 hours',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      icon: '',
      popular: true,
      detailedDescription: 'Our standard cleaning service is perfect for regular maintenance. We focus on all essential areas to keep your home sparkling clean and hygienic.'
    },
    {
      id: 2,
      title: 'Deep Cleaning',
      description: 'Thorough, intensive cleaning for move-in/move-out or seasonal deep cleans.',
      features: [
        'Inside appliances cleaning',
        'Window track cleaning',
        'Baseboard wiping',
        'Cabinet organization',
        'Grout scrubbing'
      ],
      price: 'From 4500/=',
      duration: '4-6 hours',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      icon: '',
      popular: false,
      detailedDescription: 'Deep cleaning service targets hard-to-reach areas and provides intensive cleaning for move-in/move-out situations or seasonal deep cleans.'
    },
    {
      id: 4,
      title: 'Custom Service',
      description: 'Tailored cleaning solutions designed for your unique needs.',
      features: [
        'Customized cleaning plan',
        'Special requests accommodated',
        'Flexible scheduling',
        'Specific focus areas',
        'Recurring plans available'
      ],
      price: 'Custom Quote',
      duration: 'Flexible',
      image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      icon: '',
      popular: false,
      featured: true,
      detailedDescription: 'Get a completely customized cleaning plan tailored to your specific needs and preferences. Perfect for unique spaces or special requirements.'
    },
    {
      id: 3,
      title: 'Laundry Services',
      description: 'Professional laundry and folding service with careful handling.',
      features: [
        'Wash & fold service',
        'Stain treatment',
        'Ironing & steaming',
        'Special fabric care',
        'Eco-friendly detergents'
      ],
      price: 'From 1000/=',
      duration: '24-48 hours',
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      icon: '',
      popular: false,
      detailedDescription: 'Professional laundry service with careful handling of all fabric types. We use eco-friendly detergents and provide stain treatment.'
    }
  ];

  return (
    <section id="services" className="services-section">
      <div className="services-container">
        {/* Services Header */}
        <div className="services-header">
          <h2 className="services-title">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="services-subtitle">
            Professional cleaning services tailored to your needs. 
            From routine maintenance to deep cleans, we've got you covered.
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service, index) => (
            <div 
              key={service.id}
              className={`service-card ${service.popular ? 'popular' : ''} ${service.featured ? 'featured' : ''} ${activeService === service.id ? 'active' : ''}`}
              onMouseEnter={() => setActiveService(service.id)}
              onMouseLeave={() => setActiveService(null)}
              onClick={() => handleCardClick(service)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {service.popular && (
                <div className="popular-badge">
                  <span>Most Popular</span>
                </div>
              )}

              {/* Featured Badge */}
              {service.featured && (
                <div className="featured-badge">
                  <span> Custom Solution</span>
                </div>
              )}

              {/* Service Image */}
              <div className="service-image">
                <img src={service.image} alt={service.title} />
                <div className="service-overlay"></div>
              </div>

              {/* Simplified Service Content */}
              <div className="service-content-simple">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-click-hint">
                  Click for details →
                </div>
              </div>

              {/* Hover Effect Layer */}
              <div className="card-hover-effect"></div>
            </div>
          ))}
        </div>

        {/* Services CTA */}
        
      </div>

      {/* Service Popup Modal */}
      {showPopup && selectedService && (
        <div className="service-popup-overlay" onClick={handleClosePopup}>
          <div className="service-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={handleClosePopup}>
              ×
            </button>
            
            <div className="popup-content">
              {/* Popup Header */}
              <div className="popup-header">
                <div className="popup-image">
                  <img src={selectedService.image} alt={selectedService.title} />
                  <div className="popup-overlay"></div>
                  {selectedService.popular && (
                    <div className="popup-popular-badge">
                      <span>Most Popular</span>
                    </div>
                  )}
                  {selectedService.featured && (
                    <div className="popup-featured-badge">
                      <span> Custom Solution</span>
                    </div>
                  )}
                </div>
                
                <div className="popup-header-content">
                  <h2>{selectedService.title}</h2>
                  <p className="popup-description">{selectedService.detailedDescription}</p>
                  
                  <div className="popup-meta">
                    <div className="popup-meta-item">
                      <span className="meta-label">Price</span>
                      <span className="meta-value">{selectedService.price}</span>
                    </div>
                    <div className="popup-meta-item">
                      <span className="meta-label">Duration</span>
                      <span className="meta-value">{selectedService.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popup Features */}
              <div className="popup-features">
                <h3>What's Included</h3>
                <ul className="popup-features-list">
                  {selectedService.features.map((feature, index) => (
                    <li key={index} className="popup-feature-item">
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popup CTA */}
              <div className="popup-actions">
                <button className="popup-btn secondary" onClick={handleClosePopup}>
                  Close
                </button>
                <button className="popup-btn primary" onClick={handlePopupBookNow}>
                  Book This Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OurServices;