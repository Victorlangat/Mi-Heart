import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './cleanerPages.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('madEasy_token');
      // FIXED: Using correct endpoint
      const response = await fetch('http://localhost:5000/api/bookings/available/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Filter jobs where this cleaner has applied
        const myApplications = data.data.jobs.filter(job => 
          job.applications && job.applications.some(app => app.cleanerId && app.cleanerId._id === user._id)
        );
        setApplications(myApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApplicationStatus = (job) => {
    if (!job.applications) return 'unknown';
    
    const myApplication = job.applications.find(app => app.cleanerId && app.cleanerId._id === user._id);
    if (!myApplication) return 'unknown';
    
    if (job.assignedCleaner) {
      if (job.assignedCleaner._id === user._id) {
        return 'accepted';
      } else {
        return 'rejected';
      }
    }
    
    return myApplication.status || 'pending';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'accepted': '#10b981',
      'rejected': '#ef4444',
      'unknown': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Pending Review',
      'accepted': 'Accepted 🎉',
      'rejected': 'Not Selected',
      'unknown': 'Unknown'
    };
    return texts[status] || status;
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
      <div className="cleaner-loading">
        <div className="loading-spinner"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="cleaner-page">
      <div className="cleaner-container">
        {/* Header */}
        <div className="cleaner-header">
          <h1>My Applications</h1>
          <p>Track your job applications and their status</p>
        </div>

        {/* Applications Stats */}
        <div className="applications-stats">
          <div className="stat-card">
            <div className="stat-number">
              {applications.length}
            </div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {applications.filter(app => getApplicationStatus(app) === 'accepted').length}
            </div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {applications.filter(app => getApplicationStatus(app) === 'pending').length}
            </div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        {/* Applications List */}
        <div className="applications-list">
          {applications.length === 0 ? (
            <div className="no-applications">
              <div className="no-applications-icon">📝</div>
              <h3>No applications yet</h3>
              <p>Start applying for jobs to see them here</p>
              <a href="/cleaner/jobs" className="btn-primary">
                Browse Available Jobs
              </a>
            </div>
          ) : (
            applications.map(job => {
              const status = getApplicationStatus(job);
              const myApplication = job.applications.find(app => app.cleanerId && app.cleanerId._id === user._id);
              
              return (
                <div key={job._id} className="application-card">
                  <div className="application-header">
                    <div className="application-info">
                      <span className="service-icon">
                        {getServiceIcon(job.serviceType)}
                      </span>
                      <div>
                        <h3 className="service-type">
                          {job.serviceType?.charAt(0)?.toUpperCase() + job.serviceType?.slice(1)} Cleaning
                        </h3>
                        <p className="application-date">
                          {formatDate(job.schedule?.date)} at {job.schedule?.time}
                        </p>
                      </div>
                    </div>
                    <div className="application-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(status) }}
                      >
                        {getStatusText(status)}
                      </span>
                      <span className="application-price">
                        KSh {job.totalPrice?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="application-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">📍 Location</span>
                        <span className="detail-value">{job.location?.address}, {job.location?.city}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">🏠 Property</span>
                        <span className="detail-value">
                          {job.location?.propertyType} • {job.location?.bedrooms} bed • {job.location?.bathrooms} bath
                        </span>
                      </div>
                    </div>

                    <div className="application-meta">
                      <div className="meta-item">
                        <span className="meta-label">Applied On</span>
                        <span className="meta-value">
                          {myApplication?.appliedAt ? new Date(myApplication.appliedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Proposed Price</span>
                        <span className="meta-value">
                          KSh {myApplication?.proposedPrice?.toLocaleString() || job.totalPrice?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {myApplication?.message && (
                      <div className="application-message">
                        <span className="message-label">Your Message:</span>
                        <span className="message-value">"{myApplication.message}"</span>
                      </div>
                    )}

                    <div className="client-info">
                      <span className="client-label">👤 Client:</span>
                      <span className="client-name">
                        {job.userId?.firstName} {job.userId?.lastName}
                        {job.userId?.rating && (
                          <span className="client-rating">⭐ {job.userId.rating}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {status === 'accepted' && (
                    <div className="accepted-actions">
                      <button className="btn-primary">
                        📞 Contact Client
                      </button>
                      <button className="btn-outline">
                        View Job Details
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;