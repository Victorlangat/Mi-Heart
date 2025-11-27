import React, { useState, useEffect } from 'react';
import { useBooking } from '../../../context/BookingContext';
import './BookingSteps.css';

const PendingAcceptanceStep = () => {
  const { state, dispatch } = useBooking();
  const [status, setStatus] = useState('pending');
  const [countdown, setCountdown] = useState(900);
  const [timeLeft, setTimeLeft] = useState('15:00');
  const [error, setError] = useState('');

  useEffect(() => {
    startStatusChecking();
    startCountdown();
  }, []);

  const startStatusChecking = () => {
    const interval = setInterval(checkAcceptanceStatus, 5000);
    return () => clearInterval(interval);
  };

  const checkAcceptanceStatus = async () => {
    try {
      const token = localStorage.getItem('madEasy_token') || localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      if (!state.invitationId) {
        setError('No invitation ID found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/invitations/status/${state.invitationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (data.data.status === 'accepted') {
          setStatus('accepted');
          dispatch({ type: 'SET_CLEANER_ACCEPTED', payload: true });
        } else if (data.data.status === 'declined') {
          setStatus('declined');
        } else if (data.data.status === 'expired') {
          setStatus('timeout');
        }
        setError(''); // Clear any previous errors
      } else {
        setError(data.message || 'Failed to check status');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setError('Error checking invitation status: ' + error.message);
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
  }, [countdown]);

  const handleTryAnotherCleaner = () => {
    dispatch({ type: 'RESET_CLEANER_SELECTION' });
    dispatch({ type: 'SET_STEP', payload: 5 });
  };

  const handleContinueToPayment = () => {
    if (status === 'accepted') {
      dispatch({ type: 'SET_STEP', payload: 7 });
    }
  };

  if (error) {
    return (
      <div className="booking-step">
        <div className="step-header">
          <h2>Error</h2>
          <p>There was a problem checking the invitation status</p>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={checkAcceptanceStatus} className="btn-primary">
            Try Again
          </button>
          <button onClick={handleTryAnotherCleaner} className="btn-secondary">
            Choose Another Cleaner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-step">
      <div className="step-header">
        <h2>Waiting for Cleaner Acceptance</h2>
        <p>Your selected cleaner is reviewing the booking request</p>
      </div>

      <div className="pending-acceptance-content">
        {/* Cleaner Card */}
        <div className="cleaner-card-pending">
          <div className="cleaner-avatar-large">
            {state.selectedCleaner?.avatar || '👩‍💼'}
          </div>
          <div className="cleaner-details-pending">
            <h3>{state.selectedCleaner?.firstName} {state.selectedCleaner?.lastName}</h3>
            <div className="cleaner-stats-pending">
              ⭐ {state.selectedCleaner?.rating || '5.0'} • {state.selectedCleaner?.completedJobs || 0} jobs completed
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="status-indicator-pending">
          {status === 'pending' && (
            <div className="status-pending">
              <div className="pulse-animation">
                <div className="pending-icon">⏳</div>
              </div>
              <h3>Waiting for Response</h3>
              <p>We've sent your booking request to {state.selectedCleaner?.firstName}</p>
              <div className="countdown-timer-pending">
                <div className="countdown-label">Time remaining: {timeLeft}</div>
                <div className="progress-bar-pending">
                  <div
                    className="progress-fill-pending"
                    style={{ width: `${((900 - countdown) / 900) * 100}%` }}
                  ></div>
                </div>
                <div className="countdown-note">
                  If no response is received in time, you can choose another cleaner
                </div>
              </div>
            </div>
          )}

          {status === 'accepted' && (
            <div className="status-accepted-pending">
              <div className="success-animation">
                <div className="success-icon">✅</div>
              </div>
              <h3>Booking Accepted!</h3>
              <p className="success-message">
                Great news! {state.selectedCleaner?.firstName} has accepted your booking request.
              </p>
              <button
                className="btn-primary"
                onClick={handleContinueToPayment}
              >
                Proceed to Payment
              </button>
            </div>
          )}

          {status === 'declined' && (
            <div className="status-declined-pending">
              <div className="declined-icon">❌</div>
              <h3>Cleaner Unavailable</h3>
              <p>
                {state.selectedCleaner?.firstName} is unable to accept this booking at the moment.
              </p>
              <button
                className="btn-primary"
                onClick={handleTryAnotherCleaner}
              >
                Choose Another Cleaner
              </button>
            </div>
          )}

          {status === 'timeout' && (
            <div className="status-timeout-pending">
              <div className="timeout-icon">⏰</div>
              <h3>Response Timeout</h3>
              <p>
                We didn't receive a response from {state.selectedCleaner?.firstName} in time.
              </p>
              <button
                className="btn-primary"
                onClick={handleTryAnotherCleaner}
              >
                Choose Another Cleaner
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingAcceptanceStep;