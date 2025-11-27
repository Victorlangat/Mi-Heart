import React, { useState } from 'react';
import { useBooking } from '../../../context/BookingContext';
import './BookingSteps.css';

const PaymentStep = () => {
  const { state, dispatch } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  const handlePayment = async () => {
    if (selectedMethod === 'mpesa' && !mpesaNumber) {
      alert('Please enter your M-Pesa number');
      return;
    }

    if (selectedMethod === 'paypal' && !paypalEmail) {
      alert('Please enter your PayPal email');
      return;
    }

    setIsProcessing(true);
    
    try {
      // For demo purposes, we'll simulate payment processing
      // In a real app, you'd integrate with actual payment gateways
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate API call to backend
      console.log('Processing payment with:', {
        method: selectedMethod,
        amount: state.totalPrice,
        transactionId
      });

      // For M-Pesa, simulate STK push
      if (selectedMethod === 'mpesa') {
        console.log('Sending M-Pesa STK push to:', mpesaNumber);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // For PayPal, simulate redirect
      if (selectedMethod === 'paypal') {
        console.log('Redirecting to PayPal for:', paypalEmail);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Move to confirmation step
      dispatch({ 
        type: 'SET_PAYMENT_DETAILS', 
        payload: {
          paymentMethod: selectedMethod,
          transactionId,
          status: 'completed'
        }
      });
      dispatch({ type: 'SET_STEP', payload: 7 }); // Go to Confirmation
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatMpesaNumber = (value) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Format as Kenyan phone number (254... or 07...)
    if (digitsOnly.startsWith('0')) {
      return `254${digitsOnly.slice(1)}`;
    }
    return digitsOnly.slice(0, 12);
  };

  const handleMpesaNumberChange = (value) => {
    const formatted = formatMpesaNumber(value);
    setMpesaNumber(formatted);
  };

  return (
    <div className="booking-step">
      <div className="step-header">
        <h2>Payment Method</h2>
        <p>Choose your preferred payment option</p>
      </div>

      <div className="payment-content">
        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span>Service</span>
              <span>{getServiceName(state.cleaningType)}</span>
            </div>
            <div className="summary-item">
              <span>Date & Time</span>
              <span>{state.schedule.date} at {state.schedule.time}</span>
            </div>
            <div className="summary-item">
              <span>Frequency</span>
              <span>{state.schedule.frequency === 'once' ? 'One Time' : 
                    state.schedule.frequency === 'weekly' ? 'Weekly' :
                    state.schedule.frequency === 'biweekly' ? 'Bi-Weekly' : 'Monthly'}</span>
            </div>
            <div className="summary-total">
              <span>Total Amount</span>
              <span>KSh {state.totalPrice?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          
          {/* M-Pesa Option */}
          <div 
            className={`payment-option ${selectedMethod === 'mpesa' ? 'selected' : ''}`}
            onClick={() => setSelectedMethod('mpesa')}
          >
            <div className="payment-method-header">
              <div className="method-icon">📱</div>
              <div className="method-info">
                <h4>M-Pesa</h4>
                <p>Pay via M-Pesa STK Push</p>
              </div>
              <div className="selection-indicator">
                <div className="indicator-circle"></div>
              </div>
            </div>
            
            {selectedMethod === 'mpesa' && (
              <div className="payment-details">
                <div className="form-section">
                  <label htmlFor="mpesaNumber">M-Pesa Phone Number *</label>
                  <input
                    type="tel"
                    id="mpesaNumber"
                    value={mpesaNumber}
                    onChange={(e) => handleMpesaNumberChange(e.target.value)}
                    className="form-input"
                    placeholder="07XX XXX XXX"
                    maxLength="12"
                  />
                  <small className="input-hint">
                    Enter your M-Pesa registered phone number
                  </small>
                </div>
                
                <div className="payment-instructions">
                  <h5>How to pay with M-Pesa:</h5>
                  <ol>
                    <li>Enter your M-Pesa registered phone number</li>
                    <li>Click "Pay with M-Pesa"</li>
                    <li>Check your phone for STK push prompt</li>
                    <li>Enter your M-Pesa PIN to complete payment</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* PayPal Option */}
          <div 
            className={`payment-option ${selectedMethod === 'paypal' ? 'selected' : ''}`}
            onClick={() => setSelectedMethod('paypal')}
          >
            <div className="payment-method-header">
              <div className="method-icon">🌐</div>
              <div className="method-info">
                <h4>PayPal</h4>
                <p>Pay via PayPal</p>
              </div>
              <div className="selection-indicator">
                <div className="indicator-circle"></div>
              </div>
            </div>
            
            {selectedMethod === 'paypal' && (
              <div className="payment-details">
                <div className="form-section">
                  <label htmlFor="paypalEmail">PayPal Email Address *</label>
                  <input
                    type="email"
                    id="paypalEmail"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="form-input"
                    placeholder="your-email@example.com"
                  />
                  <small className="input-hint">
                    Enter your PayPal account email
                  </small>
                </div>
                
                <div className="payment-instructions">
                  <h5>How to pay with PayPal:</h5>
                  <ol>
                    <li>Enter your PayPal email address</li>
                    <li>Click "Pay with PayPal"</li>
                    <li>You'll be redirected to PayPal</li>
                    <li>Log in and confirm your payment</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="secure-badge">🔒 Secure</div>
          <p>Your payment information is encrypted and secure. We don't store your payment details.</p>
        </div>
      </div>

      <div className="step-actions">
        <button 
          className="btn-secondary"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })}
          disabled={isProcessing}
        >
          Back
        </button>
        <button 
          className="btn-primary"
          onClick={handlePayment}
          disabled={isProcessing || 
            (selectedMethod === 'mpesa' && !mpesaNumber) ||
            (selectedMethod === 'paypal' && !paypalEmail)}
        >
          {isProcessing ? (
            <>
              <div className="spinner"></div>
              Processing...
            </>
          ) : (
            selectedMethod === 'mpesa' ? 
              `Pay KSh ${state.totalPrice?.toLocaleString()} with M-Pesa` :
              `Pay KSh ${state.totalPrice?.toLocaleString()} with PayPal`
          )}
        </button>
      </div>
    </div>
  );
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

export default PaymentStep;