import React, { useState } from 'react';
import { useBooking } from '../../../context/BookingContext';
import './BookingSteps.css';

const ScheduleStep = () => {
  const { state, dispatch } = useBooking();
  const [selectedDate, setSelectedDate] = useState(state.schedule.date);

  // Generate next 30 days for scheduling
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      // Skip Sundays
      if (date.getDay() !== 0) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const frequencyOptions = [
    { id: 'once', label: 'One Time', description: 'Single cleaning session' },
    { id: 'weekly', label: 'Weekly', description: 'Every week - Save 10%' },
    { id: 'biweekly', label: 'Bi-Weekly', description: 'Every 2 weeks - Save 15%' },
    { id: 'monthly', label: 'Monthly', description: 'Every month - Save 20%' }
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    dispatch({ 
      type: 'SET_SCHEDULE', 
      payload: { date: date.toISOString().split('T')[0] } 
    });
  };

  const handleTimeSelect = (time) => {
    dispatch({ type: 'SET_SCHEDULE', payload: { time } });
  };

  const handleFrequencySelect = (frequency) => {
    dispatch({ type: 'SET_SCHEDULE', payload: { frequency } });
  };

  const handleContinue = () => {
    if (state.schedule.date && state.schedule.time) {
      dispatch({ type: 'SET_STEP', payload: 3 });
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="booking-step">
      <div className="step-header">
        <h2>Schedule Your Cleaning</h2>
        <p>Choose when you'd like us to clean your space</p>
      </div>

      <div className="schedule-content">
        {/* Frequency Selection */}
        <div className="schedule-section">
          <h3>How often?</h3>
          <div className="frequency-options">
            {frequencyOptions.map((option) => (
              <div
                key={option.id}
                className={`frequency-option ${state.schedule.frequency === option.id ? 'selected' : ''}`}
                onClick={() => handleFrequencySelect(option.id)}
              >
                <div className="frequency-content">
                  <h4>{option.label}</h4>
                  <p>{option.description}</p>
                </div>
                <div className="selection-indicator">
                  <div className="indicator-circle"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div className="schedule-section">
          <h3>Select Date</h3>
          <div className="date-picker">
            {generateDates().map((date, index) => (
              <button
                key={index}
                className={`date-option ${selectedDate === date.toISOString().split('T')[0] ? 'selected' : ''}`}
                onClick={() => handleDateSelect(date)}
              >
                <div className="date-day">{formatDate(date).split(' ')[0]}</div>
                <div className="date-month">{formatDate(date).split(' ')[1]}</div>
                <div className="date-number">{date.getDate()}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="schedule-section">
          <h3>Select Time</h3>
          <div className="time-slots">
            {timeSlots.map((time) => (
              <button
                key={time}
                className={`time-slot ${state.schedule.time === time ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(time)}
                disabled={!selectedDate}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button 
          className="btn-secondary"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
        >
          Back
        </button>
        <button 
          className="btn-primary"
          onClick={handleContinue}
          disabled={!state.schedule.date || !state.schedule.time}
        >
          Continue to Location
        </button>
      </div>
    </div>
  );
};

export default ScheduleStep;