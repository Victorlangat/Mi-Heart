import React from 'react';
import { useBooking } from '../../../context/BookingContext';
import './BookingSteps.css';

const ServiceStep = () => {
  const { state, dispatch } = useBooking();

  const services = [
    {
      id: 'standard',
      title: 'Standard Cleaning',
      description: 'Regular maintenance cleaning to keep your space fresh and tidy',
      price: 'From 2000/=',
      duration: '2-3 hours',
      features: ['Dusting', 'Vacuuming', 'Surface wiping', 'Kitchen & bathroom sanitization'],
      popular: true
    },
    {
      id: 'deep',
      title: 'Deep Cleaning',
      description: 'Thorough, intensive cleaning for move-in/move-out or seasonal deep cleans',
      price: 'From 4500/=',
      duration: '4-6 hours',
      features: ['Inside appliances', 'Window tracks', 'Baseboards', 'Cabinet organization'],
      popular: false
    },
    {
      id: 'move-in',
      title: 'Move-In Cleaning',
      description: 'Perfect for new homes - comprehensive cleaning before you move in',
      price: 'From 5000/=',
      duration: '5-7 hours',
      features: ['All deep cleaning', 'Closet sanitization', 'Inside cabinets', 'Complete wipe-down'],
      popular: false
    },
    {
      id: 'move-out',
      title: 'Move-Out Cleaning',
      description: 'Leave your old place spotless for the next occupants',
      price: 'From 2500/=',
      duration: '5-7 hours',
      features: ['All deep cleaning', 'Wall wiping', 'Light fixtures', 'Final inspection'],
      popular: false
    }
  ];

  const handleServiceSelect = (serviceId) => {
    dispatch({ type: 'SET_CLEANING_TYPE', payload: serviceId });
    setTimeout(() => {
      dispatch({ type: 'SET_STEP', payload: 2 });
    }, 500);
  };

  return (
    <div className="booking-step">
      <div className="step-header">
        <h2>Choose Your Cleaning Service</h2>
        <p>Select the type of cleaning that best fits your needs</p>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className={`service-option ${state.cleaningType === service.id ? 'selected' : ''} ${service.popular ? 'popular' : ''}`}
            onClick={() => handleServiceSelect(service.id)}
          >
            {service.popular && <div className="popular-badge">Most Popular</div>}
            
            <div className="service-content">
              <h3>{service.title}</h3>
              <p className="service-description">{service.description}</p>
              
              <div className="service-features">
                {service.features.map((feature, index) => (
                  <div key={index} className="feature">
                    <span className="feature-check">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              <div className="service-meta">
                <div className="price">{service.price}</div>
                <div className="duration">{service.duration}</div>
              </div>
            </div>

            <div className="selection-indicator">
              <div className="indicator-circle"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="step-actions">
        <button 
          className="btn-secondary"
          onClick={() => window.history.back()}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ServiceStep;