import React from 'react';
import { useBooking } from '../../../context/BookingContext';
import './BookingSteps.css';

const ExtrasStep = () => {
  const { state, dispatch } = useBooking();

  const extrasOptions = [
    {
      id: 'deepCleaning',
      title: 'Deep Cleaning',
      description: 'Intensive cleaning for hard-to-reach areas',
      price: '5000/=',
      numericPrice: 5000,
      icon: ''
    },
    {
      id: 'windowCleaning',
      title: 'Window Cleaning',
      description: 'Inside window cleaning and tracks',
      price: '3000/=',
      numericPrice: 3000,
      icon: ''
    },
    {
      id: 'laundry',
      title: 'Laundry Service',
      description: 'Wash, dry, and fold your laundry',
      price: '1500/=',
      numericPrice: 1500,
      icon: ''
    },
    {
      id: 'fridgeCleaning',
      title: 'Fridge Cleaning',
      description: 'Deep clean and organize refrigerator',
      price: '2000/=',
      numericPrice: 2000,
      icon: ''
    },
    {
      id: 'ovenCleaning',
      title: 'Oven Cleaning',
      description: 'Thorough oven and stove cleaning',
      price: '2000/=',
      numericPrice: 2000,
      icon: ''
    }
  ];

  const handleExtraToggle = (extraId) => {
    const currentValue = state.extras[extraId];
    dispatch({
      type: 'SET_EXTRAS',
      payload: { [extraId]: !currentValue }
    });
    
    // Recalculate total immediately
    dispatch({ type: 'CALCULATE_TOTAL' });
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_STEP', payload: 5 }); // ORIGINAL: Goes to Contact
  };

  // Calculate current extras total
  const calculateExtrasTotal = () => {
    return Object.entries(state.extras).reduce((total, [key, isSelected]) => {
      if (isSelected) {
        const extra = extrasOptions.find(e => e.id === key);
        return total + (extra?.numericPrice || 0);
      }
      return total;
    }, 0);
  };

  const extrasTotal = calculateExtrasTotal();
  const basePrice = calculateBasePrice(state.cleaningType, state.location);
  const currentTotal = basePrice + extrasTotal;

  return (
    <div className="booking-step">
      <div className="step-header">
        <h2>Additional Services</h2>
        <p>Enhance your cleaning experience with these optional extras</p>
      </div>

      <div className="extras-content">
        <div className="extras-grid">
          {extrasOptions.map((extra) => (
            <div
              key={extra.id}
              className={`extra-option ${state.extras[extra.id] ? 'selected' : ''}`}
              onClick={() => handleExtraToggle(extra.id)}
            >
              <div className="extra-icon">{extra.icon}</div>
              
              <div className="extra-content">
                <h3>{extra.title}</h3>
                <p>{extra.description}</p>
                <div className="extra-price">{extra.price}</div>
              </div>

              <div className="extra-toggle">
                <div className={`toggle-switch ${state.extras[extra.id] ? 'active' : ''}`}>
                  <div className="toggle-knob"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary */}
        <div className="price-summary">
          <div className="summary-item">
            <span>Base Cleaning</span>
            <span>KSh {basePrice.toLocaleString()}</span>
          </div>
          
          {Object.entries(state.extras).map(([key, value]) => {
            if (value) {
              const extra = extrasOptions.find(e => e.id === key);
              if (extra) {
                return (
                  <div key={key} className="summary-item extra-item">
                    <span>{extra.title}</span>
                    <span>KSh {extra.numericPrice.toLocaleString()}</span>
                  </div>
                );
              }
            }
            return null;
          })}
          
          <div className="summary-total">
            <span>Total</span>
            <span>KSh {currentTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button 
          className="btn-secondary"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
        >
          Back
        </button>
        <button 
          className="btn-primary"
          onClick={handleContinue}
        >
          Continue to Contact
        </button>
      </div>
    </div>
  );
};

// Helper function to match Kenyan pricing
const calculateBasePrice = (cleaningType, location) => {
  const basePrices = {
    'standard': 2000,
    'deep': 4500,
    'move-in': 5000,
    'move-out': 2500
  };
  
  let price = basePrices[cleaningType] || 2000;
  
  // Adjust based on property size (Kenyan market rates)
  if (location.bedrooms > 2) price += (location.bedrooms - 2) * 500;
  if (location.bathrooms > 2) price += (location.bathrooms - 2) * 400;
  if (location.squareFootage > 1500) price += Math.floor((location.squareFootage - 1500) / 500) * 300;
  
  return price;
};

export default ExtrasStep;