// src/components/Booking/steps/LocationStep.js
import React, { useState } from 'react';
import { useBooking } from '../../../context/BookingContext';
import './BookingSteps.css';

const LocationStep = () => {
  const { state, dispatch } = useBooking();
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleInputChange = (field, value) => {
    dispatch({
      type: 'SET_LOCATION',
      payload: { [field]: value }
    });

    // Auto-suggest for address
    if (field === 'address' && value.length > 2) {
      fetchAddressSuggestions(value);
    }
  };

  const handleNumberChange = (field, value) => {
    const numValue = parseInt(value) || 1;
    dispatch({
      type: 'SET_LOCATION',
      payload: { [field]: Math.max(1, Math.min(10, numValue)) } // Limit to 10
    });
  };

  const fetchAddressSuggestions = async (query) => {
    setIsLoadingLocation(true);
    try {
      // Simulate API call to location service
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock suggestions for Nairobi areas
      const mockSuggestions = [
        'Westlands, Nairobi',
        'Kilimani, Nairobi',
        'Karen, Nairobi',
        'Lavington, Nairobi',
        'Kileleshwa, Nairobi',
        'Parklands, Nairobi'
      ].filter(area => 
        area.toLowerCase().includes(query.toLowerCase())
      );
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    dispatch({
      type: 'SET_LOCATION',
      payload: { address: suggestion, city: 'Nairobi' }
    });
    setSuggestions([]);
  };

  const handleContinue = () => {
    if (state.location.address && state.location.city && state.location.propertyType) {
      dispatch({ type: 'SET_STEP', payload: 4 });
    }
  };

  const propertyTypes = [
    { 
      id: 'apartment', 
      label: 'Apartment', 
      icon: '🏢',
      description: 'Flat or condominium'
    },
    { 
      id: 'house', 
      label: 'House', 
      icon: '🏠',
      description: 'Standalone home'
    },
    { 
      id: 'townhouse', 
      label: 'Townhouse', 
      icon: '🏡',
      description: 'Row house or duplex'
    },
    { 
      id: 'office', 
      label: 'Office', 
      icon: '💼',
      description: 'Commercial space'
    }
  ];

  const getPropertySize = () => {
    const { bedrooms, bathrooms, squareFootage } = state.location;
    if (bedrooms <= 1 && bathrooms <= 1) return 'small';
    if (bedrooms <= 3 && bathrooms <= 2) return 'medium';
    return 'large';
  };

  const sizeLabel = {
    small: 'Studio/1BR',
    medium: '2-3 Bedrooms',
    large: '4+ Bedrooms'
  }[getPropertySize()];

  return (
    <div className="booking-step">
      <div className="step-header">
        <h2>📍 Property Details</h2>
        <p>Tell us about your space for accurate pricing</p>
      </div>

      <div className="location-content">
        {/* Address with Autocomplete */}
        <div className="form-section">
          <label htmlFor="address">
            Street Address *
            {state.location.address && (
              <span className="input-status">✓</span>
            )}
          </label>
          <div className="input-with-suggestions">
            <input
              type="text"
              id="address"
              value={state.location.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`form-input ${state.errors.address ? 'error' : ''}`}
              placeholder="Start typing your address..."
            />
            {isLoadingLocation && (
              <div className="loading-spinner-small"></div>
            )}
            {suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    📍 {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          {state.errors.address && (
            <span className="error-message">{state.errors.address}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-section">
            <label htmlFor="city">City *</label>
            <select
              id="city"
              value={state.location.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="form-input"
            >
              <option value="Nairobi">Nairobi</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Kisumu">Kisumu</option>
              <option value="Nakuru">Nakuru</option>
              <option value="Eldoret">Eldoret</option>
            </select>
          </div>

          <div className="form-section">
            <label htmlFor="squareFootage">
              Square Footage 
              <span className="optional">(Optional)</span>
            </label>
            <input
              type="number"
              id="squareFootage"
              value={state.location.squareFootage}
              onChange={(e) => handleInputChange('squareFootage', e.target.value)}
              className="form-input"
              placeholder="e.g., 1200"
              min="100"
              max="10000"
            />
          </div>
        </div>

        {/* Property Type Selection */}
        <div className="form-section">
          <label>Property Type *</label>
          <div className="property-type-options">
            {propertyTypes.map((type) => (
              <div
                key={type.id}
                className={`property-type-option ${state.location.propertyType === type.id ? 'selected' : ''}`}
                onClick={() => handleInputChange('propertyType', type.id)}
              >
                <div className="property-icon">{type.icon}</div>
                <div className="property-info">
                  <div className="property-label">{type.label}</div>
                  <div className="property-description">{type.description}</div>
                </div>
                <div className="selection-check">✓</div>
              </div>
            ))}
          </div>
          {state.errors.propertyType && (
            <span className="error-message">{state.errors.propertyType}</span>
          )}
        </div>

        {/* Property Details with Visual Feedback */}
        <div className="property-details-section">
          <label>Property Size: <strong>{sizeLabel}</strong></label>
          <div className="property-details">
            <div className="detail-input">
              <label>🛏️ Bedrooms</label>
              <div className="number-selector">
                <button 
                  className="number-btn"
                  onClick={() => handleNumberChange('bedrooms', state.location.bedrooms - 1)}
                  disabled={state.location.bedrooms <= 1}
                >
                  -
                </button>
                <div className="number-display">{state.location.bedrooms}</div>
                <button 
                  className="number-btn"
                  onClick={() => handleNumberChange('bedrooms', state.location.bedrooms + 1)}
                  disabled={state.location.bedrooms >= 10}
                >
                  +
                </button>
              </div>
            </div>

            <div className="detail-input">
              <label>🚽 Bathrooms</label>
              <div className="number-selector">
                <button 
                  className="number-btn"
                  onClick={() => handleNumberChange('bathrooms', state.location.bathrooms - 1)}
                  disabled={state.location.bathrooms <= 1}
                >
                  -
                </button>
                <div className="number-display">{state.location.bathrooms}</div>
                <button 
                  className="number-btn"
                  onClick={() => handleNumberChange('bathrooms', state.location.bathrooms + 1)}
                  disabled={state.location.bathrooms >= 10}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        <div className="form-section">
          <label htmlFor="specialInstructions">
            🔑 Special Instructions
            <span className="optional">(Optional)</span>
          </label>
          <textarea
            id="specialInstructions"
            value={state.location.specialInstructions}
            onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
            className="form-textarea"
            placeholder="Access codes, gate instructions, pet information, specific areas to focus on..."
            rows="3"
          />
          <div className="character-count">
            {state.location.specialInstructions.length}/500 characters
          </div>
        </div>

        {/* Price Preview */}
        <div className="price-preview">
          <div className="preview-label">Estimated Price</div>
          <div className="preview-amount">KSh {state.totalPrice?.toLocaleString()}</div>
          <div className="preview-duration">{state.estimatedDuration}</div>
        </div>
      </div>

      <div className="step-actions">
        <button 
          className="btn-secondary"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
        >
          ← Back
        </button>
        <button 
          className="btn-primary"
          onClick={handleContinue}
          disabled={!state.location.address || !state.location.city || !state.location.propertyType}
        >
          Continue to Extras →
        </button>
      </div>
    </div>
  );
};

export default LocationStep;