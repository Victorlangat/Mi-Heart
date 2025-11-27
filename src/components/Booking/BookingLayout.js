import React from 'react';
import { useBooking } from '../../context/BookingContext';
import './BookingLayout.css';

const BookingLayout = ({ children }) => {
  const { state } = useBooking();

  const steps = [
    { number: 1, title: 'Service', description: 'Choose Service' },
    { number: 2, title: 'Schedule', description: 'Date & Time' },
    { number: 3, title: 'Location', description: 'Property Details' },
    { number: 4, title: 'Extras', description: 'Additional Services' },
    { number: 5, title: 'Contact', description: 'Your Info & Cleaner' },
    { number: 6, title: 'Acceptance', description: 'Wait for Cleaner' }, // NEW
    { number: 7, title: 'Payment', description: 'Secure Payment' },
    { number: 8, title: 'Confirm', description: 'Booking Complete' }
  ];

  return (
    <div className="booking-layout">
      {/* Progress Bar */}
      <div className="booking-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((state.currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        <div className="steps-container">
          {steps.map((step) => (
            <div 
              key={step.number}
              className={`step ${state.currentStep === step.number ? 'active' : ''} ${state.currentStep > step.number ? 'completed' : ''}`}
            >
              <div className="step-number">
                {state.currentStep > step.number ? '✓' : step.number}
              </div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="booking-content">
        {children}
      </div>
    </div>
  );
};

export default BookingLayout;