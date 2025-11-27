import React from 'react';
import { useBooking } from '../../../context/BookingContext';
import { Link } from 'react-router-dom';
import './BookingSteps.css';

const ConfirmationStep = () => {
  const { state, dispatch } = useBooking();

  const handleNewBooking = () => {
    dispatch({ type: 'RESET_BOOKING' });
    dispatch({ type: 'SET_STEP', payload: 1 });
  };

  const getServiceName = (cleaningType) => {
    const names = {
      'standard': 'Standard Cleaning',
      'deep': 'Deep Cleaning',
      'move-in': 'Move-In Cleaning',
      'move-out': 'Move-Out Cleaning'
    };
    return names[cleaningType] || 'Standard Cleaning';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Safely get last 4 digits of card number
  const getLastFourDigits = () => {
    if (!state.payment.cardNumber) return '****';
    const cleanNumber = state.payment.cardNumber.replace(/\s/g, '');
    return cleanNumber.slice(-4) || '****';
  };

  return (
    <div className="booking-step">
      <div className="confirmation-content">
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h2>Booking Confirmed!</h2>
          <p>Your cleaning service has been scheduled successfully</p>
        </div>

        <div className="confirmation-details">
          <div className="detail-card">
            <h3>Booking Summary</h3>
            <div className="detail-item">
              <span>Service Type</span>
              <span>{getServiceName(state.cleaningType)}</span>
            </div>
            <div className="detail-item">
              <span>Date & Time</span>
              <span>{formatDate(state.schedule.date)} at {state.schedule.time}</span>
            </div>
            <div className="detail-item">
              <span>Frequency</span>
              <span>
                {state.schedule.frequency === 'once' ? 'One Time' : 
                 state.schedule.frequency === 'weekly' ? 'Weekly' :
                 state.schedule.frequency === 'biweekly' ? 'Bi-Weekly' : 'Monthly'}
              </span>
            </div>
            <div className="detail-item">
              <span>Address</span>
              <span>{state.location.address}, {state.location.city}</span>
            </div>
            <div className="detail-item">
              <span>Property</span>
              <span>
                {state.location.propertyType === 'apartment' ? 'Apartment' :
                 state.location.propertyType === 'house' ? 'House' :
                 state.location.propertyType === 'townhouse' ? 'Townhouse' : 'Office'}
                , {state.location.bedrooms} bed, {state.location.bathrooms} bath
              </span>
            </div>
            {state.selectedCleaner && (
              <div className="detail-item">
                <span>Assigned Cleaner</span>
                <span>{state.selectedCleaner.firstName} {state.selectedCleaner.lastName}</span>
              </div>
            )}
          </div>

          <div className="detail-card">
            <h3>Contact Information</h3>
            <div className="detail-item">
              <span>Name</span>
              <span>{state.contactInfo.firstName} {state.contactInfo.lastName}</span>
            </div>
            <div className="detail-item">
              <span>Email</span>
              <span>{state.contactInfo.email}</span>
            </div>
            <div className="detail-item">
              <span>Phone</span>
              <span>{state.contactInfo.phone}</span>
            </div>
          </div>

          <div className="detail-card">
            <h3>Payment Summary</h3>
            <div className="detail-item">
              <span>Service Fee</span>
              <span>KSh {state.totalPrice?.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span>Payment Method</span>
              <span>Credit Card ending in {getLastFourDigits()}</span>
            </div>
            <div className="detail-item total">
              <span>Total Paid</span>
              <span>KSh {state.totalPrice?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <div className="steps-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <strong>Confirmation Email</strong>
                <p>You'll receive a confirmation email with all booking details</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <strong>Cleaner Confirmation</strong>
                <p>Your assigned cleaner {state.selectedCleaner?.firstName} will contact you before the appointment</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <strong>Pre-Cleaning Call</strong>
                <p>Your cleaner will call 30 minutes before arrival</p>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <Link to="/" className="btn-secondary">
            Back to Home
          </Link>
          <button 
            className="btn-primary"
            onClick={handleNewBooking}
          >
            Book Another Cleaning
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationStep;