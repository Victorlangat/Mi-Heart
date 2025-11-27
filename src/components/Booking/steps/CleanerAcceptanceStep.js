import React from 'react';
import { useBooking } from '../../../context/BookingContext';

const CleanerAcceptanceStep = () => {
  const { dispatch } = useBooking();
  
  return (
    <div className="booking-step">
      <div className="step-header">
        <h2>Cleaner Acceptance</h2>
        <p>Your selected cleaner is reviewing the booking</p>
      </div>
      
      <div style={{textAlign: 'center', padding: '2rem'}}>
        <p>Waiting for cleaner to accept your booking...</p>
      </div>
      
      <div className="step-actions">
        <button 
          className="btn-secondary"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })}
        >
          Back
        </button>
        <button 
          className="btn-primary"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 7 })}
        >
          Continue to Contact
        </button>
      </div>
    </div>
  );
};

export default CleanerAcceptanceStep;