import React from 'react';
import { useBooking } from '../../../context/BookingContext';

const SuggestedCleanersStep = () => {
  const { dispatch } = useBooking();
  
  return (
    <div className="booking-step">
      <div className="step-header">
        <h2>Select Your Cleaner</h2>
        <p>Pick from our verified cleaning professionals</p>
      </div>
      
      <div className="step-actions">
        <button 
          className="btn-secondary"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 4 })}
        >
          Back
        </button>
        <button 
          className="btn-primary"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 6 })}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SuggestedCleanersStep;