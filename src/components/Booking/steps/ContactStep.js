import React, { useState, useEffect } from 'react';
import { useBooking } from '../../../context/BookingContext';
import './BookingSteps.css';

const ContactStep = () => {
  const { state, dispatch } = useBooking();
  const [suggestedCleaners, setSuggestedCleaners] = useState([]);
  const [showCleaners, setShowCleaners] = useState(false);
  const [cleanersLoading, setCleanersLoading] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState(null);

  useEffect(() => {
    fetchSuggestedCleaners();
  }, []);

  const fetchSuggestedCleaners = async () => {
    try {
      setCleanersLoading(true);
      const token = localStorage.getItem('madEasy_token');
      
      // Fetch real available cleaners from your backend
      const response = await fetch('http://localhost:5000/api/cleaners/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedCleaners(data.data.cleaners || []);
      } else {
        // Fallback to mock data if API fails
        await loadMockCleaners();
      }
    } catch (error) {
      console.error('Error fetching cleaners:', error);
      await loadMockCleaners();
    } finally {
      setCleanersLoading(false);
    }
  };

  const loadMockCleaners = async () => {
    // Mock data as fallback
    const mockCleaners = [
      {
        _id: '1',
        firstName: 'Sarah',
        lastName: 'Mwangi',
        avatar: '👩‍💼',
        rating: 4.8,
        completedJobs: 47,
        specialties: ['Deep Cleaning', 'Move-in/Move-out'],
        responseTime: 'Within 15 minutes',
        isAvailable: true
      },
      {
        _id: '2',
        firstName: 'John',
        lastName: 'Kamau',
        avatar: '👨‍💼',
        rating: 4.9,
        completedJobs: 62,
        specialties: ['Standard Cleaning', 'Quick Response'],
        responseTime: 'Within 10 minutes',
        isAvailable: true
      }
    ];
    setSuggestedCleaners(mockCleaners);
  };

  const handleInputChange = (field, value) => {
    dispatch({
      type: 'SET_CONTACT_INFO',
      payload: { [field]: value }
    });
  };

  const handleContinue = async () => {
    if (!state.contactInfo.firstName || !state.contactInfo.lastName ||
        !state.contactInfo.email || !state.contactInfo.phone) {
      alert('Please fill in all required contact information');
      return;
    }

    if (!selectedCleaner) {
      alert('Please select a cleaner to continue');
      return;
    }

    // Set pending state and move to acceptance step
    dispatch({
      type: 'SET_SELECTED_CLEANER',
      payload: selectedCleaner
    });
    dispatch({ type: 'SET_STEP', payload: 6 }); // Move to Pending Acceptance
  };

  const handleCleanerSelect = async (cleaner) => {
    setSelectedCleaner(cleaner);
    
    // Send invitation to cleaner immediately when selected
    try {
      const token = localStorage.getItem('madEasy_token');
      
      // CORRECTED API ENDPOINT - FIXED 404 ERROR
      const response = await fetch('http://localhost:5000/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cleanerId: cleaner._id,
          bookingDetails: {
            serviceType: state.cleaningType,
            date: state.schedule.date,
            time: state.schedule.time,
            location: `${state.location.address}, ${state.location.city}`,
            totalPrice: state.totalPrice,
            bedrooms: state.location.bedrooms,
            bathrooms: state.location.bathrooms
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_INVITATION_ID', payload: data.data.invitationId });
        console.log('Invitation sent to cleaner:', cleaner.firstName);
      } else {
        alert('Failed to send invitation to cleaner. Please try again.');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Error sending invitation. Please try again.');
    }
  };

  return (
    <div className="booking-step">
      <div className="step-header">
        <h2>Contact Information & Cleaner Selection</h2>
        <p>Provide your details and choose your preferred cleaner</p>
      </div>

      <div className="contact-content">
        {/* Contact Form */}
        <div className="form-section">
          <h3>Your Contact Details</h3>
          <div className="form-row">
            <div className="form-section">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                value={state.contactInfo.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="form-input"
                placeholder="Enter your first name"
              />
            </div>
            <div className="form-section">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                value={state.contactInfo.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="form-input"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              value={state.contactInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-section">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              value={state.contactInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="form-input"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-section">
            <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
            <textarea
              id="specialInstructions"
              value={state.contactInfo.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              className="form-textarea"
              placeholder="Any special instructions for our cleaners? Access codes? Pet information?"
              rows="3"
            />
          </div>
        </div>

        {/* Suggested Cleaners Section */}
        <div className="suggested-cleaners-section">
          <div className="section-header">
            <h3>👥 Select Your Cleaner</h3>
            <p>Choose from available cleaners in {state.location.city}. Payment will proceed after acceptance.</p>
          </div>

          {selectedCleaner && (
            <div className="selected-cleaner-banner">
              <div className="selected-cleaner-info">
                <span className="selected-avatar">{selectedCleaner.avatar}</span>
                <div>
                  <strong>Selected: {selectedCleaner.firstName} {selectedCleaner.lastName}</strong>
                  <p>Invitation sent! Waiting for acceptance...</p>
                </div>
              </div>
              <button
                className="btn-change-cleaner"
                onClick={() => setSelectedCleaner(null)}
              >
                Change
              </button>
            </div>
          )}

          {!selectedCleaner && (
            <div className="cleaners-full-list">
              {cleanersLoading ? (
                <div className="loading-cleaners">
                  <div className="spinner-small"></div>
                  <p>Finding available cleaners...</p>
                </div>
              ) : (
                <div className="cleaners-grid">
                  {suggestedCleaners.map((cleaner) => (
                    <div key={cleaner._id} className="cleaner-suggestion-card">
                      <div className="cleaner-card-header">
                        <div className="cleaner-avatar">{cleaner.avatar}</div>
                        <div className="cleaner-main-info">
                          <h4>{cleaner.firstName} {cleaner.lastName}</h4>
                          <div className="cleaner-stats">
                            <span className="rating">⭐ {cleaner.rating || '5.0'}</span>
                            <span className="jobs">{cleaner.completedJobs || 0} jobs</span>
                          </div>
                          <div className="response-time">🕒 Usually responds within 15min</div>
                        </div>
                      </div>

                      <div className="cleaner-details">
                        <div className="specialties">
                          <strong>Experience:</strong>
                          <div className="specialty-tags">
                            {cleaner.specialties?.map(specialty => (
                              <span key={specialty} className="specialty-tag">{specialty}</span>
                            )) || ['General Cleaning']}
                          </div>
                        </div>
                        {cleaner.isAvailable && (
                          <div className="availability-badge">✅ Available Now</div>
                        )}
                      </div>

                      <button
                        className="btn-select-cleaner"
                        onClick={() => handleCleanerSelect(cleaner)}
                      >
                        Select {cleaner.firstName}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Notes */}
        <div className="contact-notes">
          <h4>📝 How It Works:</h4>
          <ul>
            <li><strong>Select a cleaner</strong> - They'll receive your booking request immediately</li>
            <li><strong>Wait for acceptance</strong> - Cleaner has 15 minutes to accept</li>
            <li><strong>Proceed to payment</strong> - Only after cleaner accepts your booking</li>
            <li><strong>Booking confirmed</strong> - You'll receive confirmation once payment is complete</li>
          </ul>
        </div>
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
          onClick={handleContinue}
          disabled={!state.contactInfo.firstName || !state.contactInfo.lastName ||
                  !state.contactInfo.email || !state.contactInfo.phone || !selectedCleaner}
        >
          {selectedCleaner ? `Wait for ${selectedCleaner.firstName}'s Response` : 'Select a Cleaner to Continue'}
        </button>
      </div>
    </div>
  );
};

export default ContactStep;