import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [acceptingCleaner, setAcceptingCleaner] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const filterBookings = () => {
    if (!bookings || !Array.isArray(bookings)) {
      setFilteredBookings([]);
      return;
    }

    let filtered = [];
    
    switch (activeTab) {
      case 'pending':
        filtered = bookings.filter(booking => 
          booking.status === 'pending' || booking.status === 'pending-cleaner' || booking.status === 'accepted'
        );
        break;
      case 'confirmed':
        filtered = bookings.filter(booking => 
          booking.status === 'confirmed' || booking.status === 'in-progress'
        );
        break;
      case 'completed':
        filtered = bookings.filter(booking => booking.status === 'completed');
        break;
      case 'all':
      default:
        filtered = bookings;
        break;
    }
    
    setFilteredBookings(filtered);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    if (user?.userType !== 'client') {
      navigate('/');
      return;
    }
    fetchUserBookings();
  }, [isAuthenticated, user, authLoading, navigate]);

  useEffect(() => {
    filterBookings();
  }, [bookings, activeTab]);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('madEasy_token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          navigate('/signin');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const bookingsData = data.data?.bookings || data.data || data.bookings || [];
        setBookings(bookingsData);
      } else {
        throw new Error(data.message || 'Failed to fetch bookings');
      }

    } catch (error) {
      console.error('💥 Error fetching bookings:', error);
      setError('Failed to load bookings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobApplications = async (bookingId) => {
    try {
      const token = localStorage.getItem('madEasy_token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setApplications(data.data.applications || []);
          setShowApplicationsModal(true);
        } else {
          alert(data.message || 'Failed to load applications');
        }
      } else {
        throw new Error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Failed to load applications: ' + error.message);
    }
  };

  const handleAcceptCleaner = async (bookingId, cleanerId) => {
    try {
      setAcceptingCleaner(cleanerId);
      const token = localStorage.getItem('madEasy_token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/accept-cleaner`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cleanerId })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Cleaner accepted successfully! You can now proceed with payment.');
        setShowApplicationsModal(false);
        fetchUserBookings();
      } else {
        alert('❌ ' + (data.message || 'Failed to accept cleaner'));
      }
    } catch (error) {
      console.error('Error accepting cleaner:', error);
      alert('❌ Error accepting cleaner: ' + error.message);
    } finally {
      setAcceptingCleaner(null);
    }
  };

  const handlePayment = async (bookingId, paymentMethod) => {
    try {
      setProcessingPayment(true);
      const token = localStorage.getItem('madEasy_token');
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/complete-payment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod,
          transactionId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Payment completed successfully! Your booking is now confirmed.');
        setShowPaymentModal(false);
        fetchUserBookings();
      } else {
        alert('❌ ' + (data.message || 'Payment failed'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Payment processing failed: ' + error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('madEasy_token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchUserBookings();
        setShowModal(false);
        alert('✅ Booking cancelled successfully!');
      } else {
        const errorData = await response.json();
        alert('❌ ' + (errorData.message || 'Failed to cancel booking'));
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('❌ Error cancelling booking. Please try again.');
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const getStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => 
      b.status === 'pending' || b.status === 'pending-cleaner' || b.status === 'accepted'
    ).length;
    const confirmed = bookings.filter(b => 
      b.status === 'confirmed' || b.status === 'in-progress'
    ).length;
    const completed = bookings.filter(b => b.status === 'completed').length;

    return { total, pending, confirmed, completed };
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      'standard': '🧹',
      'deep': '✨',
      'move-in': '🏠',
      'move-out': '📦'
    };
    return icons[serviceType] || '🧼';
  };

  const getServiceName = (serviceType) => {
    const names = {
      'standard': 'Standard Cleaning',
      'deep': 'Deep Cleaning',
      'move-in': 'Move-In Cleaning',
      'move-out': 'Move-Out Cleaning'
    };
    return names[serviceType] || 'Cleaning Service';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    try {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'pending', text: 'Pending' },
      'pending-cleaner': { class: 'pending', text: 'Waiting for Cleaner' },
      'accepted': { class: 'accepted', text: 'Accepted - Ready for Payment' },
      'confirmed': { class: 'confirmed', text: 'Confirmed' },
      'in-progress': { class: 'confirmed', text: 'In Progress' },
      'completed': { class: 'completed', text: 'Completed' },
      'cancelled': { class: 'cancelled', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getExtrasList = (extras) => {
    if (!extras) return [];
    const extraNames = {
      'deepCleaning': 'Deep Cleaning',
      'windowCleaning': 'Window Cleaning',
      'laundry': 'Laundry Service',
      'fridgeCleaning': 'Fridge Cleaning',
      'ovenCleaning': 'Oven Cleaning',
      'balconyCleaning': 'Balcony Cleaning',
      'carpetCleaning': 'Carpet Cleaning'
    };
    return Object.entries(extras)
      .filter(([key, value]) => value === true)
      .map(([key]) => extraNames[key] || key);
  };

  if (authLoading) {
    return (
      <div className="my-bookings-page">
        <div className="bookings-container">
          <div className="bookings-loading">
            <div className="loading-spinner"></div>
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="bookings-container">
          <div className="bookings-loading">
            <div className="loading-spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-bookings-page">
        <div className="bookings-container">
          <div className="error-message">
            <h3>Unable to Load Bookings</h3>
            <p>{error}</p>
            <div style={{ marginTop: '1rem' }}>
              <button onClick={fetchUserBookings} className="btn-primary">
                Try Again
              </button>
              <button 
                onClick={() => navigate('/booking')} 
                className="btn-outline"
                style={{ marginLeft: '0.5rem' }}
              >
                Book New Service
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="my-bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <p>Manage and track your cleaning service appointments</p>
          <div className="bookings-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.confirmed}</div>
              <div className="stat-label">Confirmed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        <div className="bookings-tabs">
          <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Bookings</button>
          <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending</button>
          <button className={`tab ${activeTab === 'confirmed' ? 'active' : ''}`} onClick={() => setActiveTab('confirmed')}>Confirmed</button>
          <button className={`tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Completed</button>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📅</div>
            <h3>No bookings {activeTab !== 'all' ? `with ${activeTab} status` : 'yet'}</h3>
            <p>{activeTab === 'all' ? 'Schedule your first cleaning service to get started!' : `You don't have any ${activeTab} bookings at the moment.`}</p>
            {activeTab === 'all' && (
              <button className="btn-primary" onClick={() => navigate('/booking')}>Book Your First Cleaning</button>
            )}
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="service-info">
                    <div className="service-icon">{getServiceIcon(booking.serviceType)}</div>
                    <div>
                      <div className="service-type">{getServiceName(booking.serviceType)}</div>
                      <div className="booking-date">{formatDate(booking.schedule?.date || booking.date)} • {formatTime(booking.schedule?.time || booking.time)}</div>
                    </div>
                  </div>
                  <div className="booking-meta">
                    {getStatusBadge(booking.status)}
                    <div className="booking-price">KSh {booking.totalPrice?.toLocaleString() || '0'}</div>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{booking.estimatedDuration || booking.duration || '2-3 hours'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{booking.location?.address || booking.address || 'Not specified'}</span>
                    </div>
                  </div>

                  {booking.extras && getExtrasList(booking.extras).length > 0 && (
                    <div className="extras-section">
                      <div className="extras-label">Additional Services</div>
                      <div className="extras-list">
                        {getExtrasList(booking.extras).map((extra, index) => (
                          <span key={index} className="extra-tag">{extra}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.assignedCleaner && (
                    <div className="cleaner-info">
                      <div className="cleaner-label">Assigned Cleaner</div>
                      <div className="cleaner-details">
                        <div className="cleaner-avatar">{booking.assignedCleaner.avatar || '👩‍💼'}</div>
                        <div>
                          <div className="cleaner-name">{booking.assignedCleaner.firstName} {booking.assignedCleaner.lastName}</div>
                          {booking.assignedCleaner.rating && (
                            <div className="cleaner-rating">⭐ {booking.assignedCleaner.rating}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.applications && booking.applications.length > 0 && booking.status === 'pending-cleaner' && (
                    <div className="applications-count">
                      <span className="applications-label">📨 Applications:</span>
                      <span className="applications-value">{booking.applications.length} cleaner(s) applied</span>
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  <button className="btn-outline" onClick={() => handleViewDetails(booking)}>View Details</button>
                  
                  {booking.status === 'pending-cleaner' && booking.applications && booking.applications.length > 0 && (
                    <button className="btn-primary" onClick={() => fetchJobApplications(booking._id)}>View Applications ({booking.applications.length})</button>
                  )}
                  
                  {booking.status === 'accepted' && (
                    <button className="btn-success" onClick={() => { setSelectedBooking(booking); setShowPaymentModal(true); }}>💳 Proceed to Payment</button>
                  )}
                  
                  {(booking.status === 'pending' || booking.status === 'pending-cleaner') && (
                    <button className="btn-danger" onClick={() => handleCancelBooking(booking._id)}>Cancel Booking</button>
                  )}
                  
                  {booking.status === 'completed' && (
                    <button className="btn-primary">Leave Review</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Details Modal */}
        {showModal && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              
              <div className="booking-details-modal">
                <h2>Booking Details</h2>
                
                <div className="details-grid">
                  <div className="detail-section">
                    <h4>Service Information</h4>
                    <div className="detail-item">
                      <span>Service Type</span>
                      <span>{getServiceName(selectedBooking.serviceType)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Date & Time</span>
                      <span>{formatDate(selectedBooking.schedule?.date || selectedBooking.date)} at {formatTime(selectedBooking.schedule?.time || selectedBooking.time)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Duration</span>
                      <span>{selectedBooking.estimatedDuration || selectedBooking.duration || '2-3 hours'}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Location Details</h4>
                    <div className="detail-item">
                      <span>Address</span>
                      <span>{selectedBooking.location?.address || selectedBooking.address || 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <span>City</span>
                      <span>{selectedBooking.location?.city || 'Nairobi'}</span>
                    </div>
                    <div className="detail-item">
                      <span>Property Type</span>
                      <span>{selectedBooking.location?.propertyType || 'Not specified'}</span>
                    </div>
                    {selectedBooking.location?.bedrooms && (
                      <div className="detail-item">
                        <span>Bedrooms</span>
                        <span>{selectedBooking.location.bedrooms}</span>
                      </div>
                    )}
                    {selectedBooking.location?.bathrooms && (
                      <div className="detail-item">
                        <span>Bathrooms</span>
                        <span>{selectedBooking.location.bathrooms}</span>
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Pricing</h4>
                    <div className="detail-item">
                      <span>Total Amount</span>
                      <span className="price">KSh {selectedBooking.totalPrice?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="detail-item">
                      <span>Payment Status</span>
                      <span className={`payment ${selectedBooking.paymentStatus || 'pending'}`}>
                        {selectedBooking.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Status</h4>
                    <div className="detail-item">
                      <span>Booking Status</span>
                      <span className={`status ${selectedBooking.status}`}>{selectedBooking.status}</span>
                    </div>
                    {selectedBooking.assignedCleaner && (
                      <div className="detail-item">
                        <span>Assigned Cleaner</span>
                        <span>{selectedBooking.assignedCleaner.firstName} {selectedBooking.assignedCleaner.lastName}</span>
                      </div>
                    )}
                  </div>

                  {selectedBooking.contactInfo?.specialInstructions && (
                    <div className="detail-section">
                      <h4>Special Instructions</h4>
                      <div className="detail-item">
                        <span>Notes</span>
                        <span>{selectedBooking.contactInfo.specialInstructions}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="booking-actions" style={{ marginTop: '2rem' }}>
                  {(selectedBooking.status === 'pending' || selectedBooking.status === 'pending-cleaner') && (
                    <button className="btn-danger" onClick={() => handleCancelBooking(selectedBooking._id)}>Cancel Booking</button>
                  )}
                  {selectedBooking.status === 'accepted' && (
                    <button className="btn-success" onClick={() => { setShowModal(false); setShowPaymentModal(true); }}>💳 Proceed to Payment</button>
                  )}
                  <button className="btn-outline" onClick={() => setShowModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
              
              <div className="payment-content">
                <h2>Complete Payment</h2>
                <p>Pay for your cleaning service</p>
                
                <div className="payment-summary">
                  <h4>Order Summary</h4>
                  <div className="summary-item">
                    <span>Service:</span>
                    <span>{getServiceName(selectedBooking.serviceType)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Date:</span>
                    <span>{formatDate(selectedBooking.schedule?.date || selectedBooking.date)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Assigned Cleaner:</span>
                    <span>{selectedBooking.assignedCleaner?.firstName} {selectedBooking.assignedCleaner?.lastName}</span>
                  </div>
                  <div className="summary-total">
                    <span>Total Amount:</span>
                    <span>KSh {selectedBooking.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="payment-methods">
                  <h4>Select Payment Method</h4>
                  <button 
                    className="payment-method-btn"
                    onClick={() => handlePayment(selectedBooking._id, 'mpesa')}
                    disabled={processingPayment}
                  >
                    {processingPayment ? 'Processing...' : '📱 Pay with M-Pesa'}
                  </button>
                  <button 
                    className="payment-method-btn secondary"
                    onClick={() => handlePayment(selectedBooking._id, 'paypal')}
                    disabled={processingPayment}
                  >
                    {processingPayment ? 'Processing...' : '🌐 Pay with PayPal'}
                  </button>
                </div>

                <div className="payment-security">
                  <small>🔒 Your payment is secure and encrypted</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applications Modal */}
        {showApplicationsModal && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowApplicationsModal(false)}>
            <div className="modal-content applications-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowApplicationsModal(false)}>×</button>
              
              <div className="applications-content">
                <h2>Cleaner Applications</h2>
                <p>Select a cleaner for your booking</p>
                
                {applications.length === 0 ? (
                  <div className="no-applications">
                    <p>No applications yet. Check back later.</p>
                  </div>
                ) : (
                  <div className="applications-list">
                    {applications.map((application, index) => (
                      <div key={index} className="application-item">
                        <div className="cleaner-info">
                          <div className="cleaner-avatar">
                            {application.cleanerId?.avatar || '👩‍💼'}
                          </div>
                          <div className="cleaner-details">
                            <h4>{application.cleanerId?.firstName} {application.cleanerId?.lastName}</h4>
                            <p>⭐ {application.cleanerId?.rating || '5.0'} • {application.cleanerId?.completedJobs || 0} jobs completed</p>
                            {application.message && (
                              <p className="application-message">"{application.message}"</p>
                            )}
                            <p className="proposed-price">
                              Proposed: KSh {application.proposedPrice?.toLocaleString() || selectedBooking.totalPrice?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <button 
                          className="btn-primary"
                          onClick={() => handleAcceptCleaner(selectedBooking._id, application.cleanerId?._id)}
                          disabled={acceptingCleaner === application.cleanerId?._id}
                        >
                          {acceptingCleaner === application.cleanerId?._id ? 'Accepting...' : 'Accept Cleaner'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;