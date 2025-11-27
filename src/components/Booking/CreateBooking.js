import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateBooking.css';

const CreateBooking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceType: '',
    date: '',
    time: '',
    duration: 2,
    address: '',
    specialInstructions: ''
  });
  const [cleaners, setCleaners] = useState([]);
  const [selectedCleaner, setSelectedCleaner] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is logged in and is a client
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'client') {
      setError('Only clients can create bookings');
      return;
    }
    fetchAvailableCleaners();
  }, [navigate]);

  const fetchAvailableCleaners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cleaners/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCleaners(data);
      }
    } catch (error) {
      console.error('Error fetching cleaners:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || user.role !== 'client') {
        setError('Please log in as a client to create bookings');
        return;
      }

      const bookingData = {
        ...formData,
        cleanerId: selectedCleaner,
        clientId: user.id,
        status: 'pending'
      };

      console.log('Sending booking data:', bookingData);

      // FIXED: Correct booking creation endpoint
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      console.log('Booking created successfully:', result);
      
      // Redirect to My Bookings page
      navigate('/my-bookings');

    } catch (error) {
      console.error('Booking creation error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-booking-container">
      <div className="booking-header">
        <h1>Book a Cleaning Service</h1>
        <p>Fill out the form below to schedule your cleaning</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="serviceType">Service Type</label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a service</option>
            <option value="standard">Standard Cleaning</option>
            <option value="deep">Deep Cleaning</option>
            <option value="move_in">Move-in/Move-out Cleaning</option>
            <option value="commercial">Commercial Cleaning</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Preferred Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Preferred Time</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (hours)</label>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            required
          >
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
            <option value={4}>4 hours</option>
            <option value={5}>5+ hours</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="cleaner">Select Cleaner (Optional)</label>
          <select
            id="cleaner"
            value={selectedCleaner}
            onChange={(e) => setSelectedCleaner(e.target.value)}
          >
            <option value="">Any available cleaner</option>
            {cleaners.map(cleaner => (
              <option key={cleaner.id} value={cleaner.id}>
                {cleaner.name} - ${cleaner.hourlyRate}/hour
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="address">Service Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter full address for cleaning service"
            required
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="specialInstructions">Special Instructions</label>
          <textarea
            id="specialInstructions"
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleInputChange}
            placeholder="Any special requirements or instructions..."
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="submit-booking-btn"
          disabled={loading}
        >
          {loading ? 'Creating Booking...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
};

export default CreateBooking;