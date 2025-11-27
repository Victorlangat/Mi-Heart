import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ClientPages.css';

const JobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const { user } = useAuth();
  const { bookingId } = useParams();

  useEffect(() => {
    fetchJobApplications();
  }, [bookingId]);

  const fetchJobApplications = async () => {
    try {
      const token = localStorage.getItem('madEasy_token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data.applications || []);
        // Also fetch booking details
        fetchBookingDetails();
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('madEasy_token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setBooking(data.data.booking);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    }
  };

  const assignCleaner = async (cleanerId, applicationId) => {
    try {
      const token = localStorage.getItem('madEasy_token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/assign-cleaner`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cleanerId,
          applicationId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Cleaner assigned successfully!');
        fetchJobApplications(); // Refresh data
        setSelectedCleaner(null);
      } else {
        alert(data.message || 'Failed to assign cleaner');
      }
    } catch (error) {
      console.error('Assign cleaner error:', error);
      alert('Error assigning cleaner');
    }
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      'standard': '🧹',
      'deep': '✨',
      'move-in': '🏠',
      'move-out': '🚚',
      'custom': '🎯'
    };
    return icons[serviceType] || '🧼';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="client-loading">
        <div className="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="client-page">
      <div className="client-container">
        {/* Header */}
        <div className="client-header">
          <h1>Job Applications</h1>
          <p>Review and select a cleaner for your booking</p>
        </div>

        {/* Booking Summary */}
        {booking && (
          <div className="booking-summary">
            <div className="summary-header">
              <span className="service-icon">
                {getServiceIcon(booking.serviceType)}
              </span>
              <div>
                <h3>{booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1)} Cleaning</h3>
                <p>{formatDate(booking.schedule.date)} at {booking.schedule.time}</p>
              </div>
              <span className="booking-price">KSh {booking.totalPrice?.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Applications List */}
        <div className="applications-container">
          <div className="applications-header">
            <h2>Cleaner Applications ({applications.length})</h2>
            <p>Choose the best cleaner for your needs</p>
          </div>

          {applications.length === 0 ? (
            <div className="no-applications">
              <div className="no-applications-icon">👥</div>
              <h3>No applications yet</h3>
              <p>Cleaners will start applying soon. Check back later!</p>
            </div>
          ) : (
            <div className="applications-grid">
              {applications.map((application) => (
                <div key={application._id} className="application-card">
                  <div className="cleaner-profile">
                    <div className="cleaner-avatar">
                      {application.cleanerId?.avatar || '👩'}
                    </div>
                    <div className="cleaner-info">
                      <h3>{application.cleanerId?.firstName} {application.cleanerId?.lastName}</h3>
                      <div className="cleaner-stats">
                        <span className="rating">⭐ {application.cleanerId?.rating || '5.0'}</span>
                        <span className="jobs-completed">
                          {application.cleanerId?.completedJobs || 0} jobs
                        </span>
                        {application.cleanerId?.phone && (
                          <span className="phone">📱 {application.cleanerId.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="application-details">
                    <div className="proposal">
                      <div className="proposed-price">
                        <span className="label">Proposed Price:</span>
                        <span className="price">KSh {application.proposedPrice?.toLocaleString()}</span>
                      </div>
                      {application.message && (
                        <div className="cleaner-message">
                          <span className="label">Message:</span>
                          <p>"{application.message}"</p>
                        </div>
                      )}
                      <div className="application-date">
                        Applied on {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="application-status">
                      {application.status === 'accepted' ? (
                        <div className="status-accepted">
                          ✅ You selected this cleaner
                        </div>
                      ) : application.status === 'rejected' ? (
                        <div className="status-rejected">
                          ❌ Not selected
                        </div>
                      ) : (
                        <div className="action-buttons">
                          {selectedCleaner === application._id ? (
                            <div className="confirmation-dialog">
                              <p>Assign {application.cleanerId?.firstName} to this job?</p>
                              <div className="confirmation-actions">
                                <button 
                                  className="btn-confirm"
                                  onClick={() => assignCleaner(application.cleanerId?._id, application._id)}
                                >
                                  Yes, Assign
                                </button>
                                <button 
                                  className="btn-cancel"
                                  onClick={() => setSelectedCleaner(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="btn-primary"
                              onClick={() => setSelectedCleaner(application._id)}
                            >
                              Select Cleaner
                            </button>
                          )}
                          <button className="btn-outline">
                            Message
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobApplications;