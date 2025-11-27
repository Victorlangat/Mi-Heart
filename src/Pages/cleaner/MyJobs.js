import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './cleanerPages.css';

const MyJobs = () => {
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem('madEasy_token');
      // FIXED: Using correct endpoint for cleaner jobs
      const response = await fetch('http://localhost:5000/api/bookings/cleaner/my-jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setAssignedJobs(data.data.jobs || []);
      } else {
        console.error('Failed to fetch jobs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem('madEasy_token');
      const response = await fetch(`http://localhost:5000/api/bookings/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Job status updated successfully!');
        fetchMyJobs(); // Refresh the list
      } else {
        alert(data.message || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Error updating job status');
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

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const jobDate = new Date(dateString);
    const diffTime = jobDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < 0) return 'Past date';
    return 'Soon';
  };

  if (loading) {
    return (
      <div className="cleaner-loading">
        <div className="loading-spinner"></div>
        <p>Loading your jobs...</p>
      </div>
    );
  }

  return (
    <div className="cleaner-page">
      <div className="cleaner-container">
        {/* Header */}
        <div className="cleaner-header">
          <h1>My Jobs</h1>
          <p>Manage your assigned cleaning jobs</p>
        </div>

        {/* Jobs Stats */}
        <div className="jobs-stats">
          <div className="stat-card">
            <div className="stat-number">
              {assignedJobs.length}
            </div>
            <div className="stat-label">Total Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {assignedJobs.filter(job => job.status === 'confirmed').length}
            </div>
            <div className="stat-label">Upcoming</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {assignedJobs.filter(job => job.status === 'in-progress').length}
            </div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {assignedJobs.filter(job => job.status === 'completed').length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="assigned-jobs-list">
          {assignedJobs.length === 0 ? (
            <div className="no-jobs">
              <div className="no-jobs-icon">💼</div>
              <h3>No assigned jobs yet</h3>
              <p>Keep applying for jobs - clients will start assigning you soon!</p>
              <div className="action-buttons">
                <a href="/cleaner/jobs" className="btn-primary">
                  Browse Available Jobs
                </a>
                <a href="/cleaner/applications" className="btn-outline">
                  View My Applications
                </a>
              </div>
            </div>
          ) : (
            assignedJobs.map(job => (
              <div key={job._id} className="assigned-job-card">
                <div className="job-header">
                  <div className="service-info">
                    <span className="service-icon">
                      {getServiceIcon(job.serviceType)}
                    </span>
                    <div>
                      <h3 className="service-type">
                        {job.serviceType?.charAt(0)?.toUpperCase() + job.serviceType?.slice(1)} Cleaning
                      </h3>
                      <p className="job-date">
                        {formatDate(job.schedule?.date)} at {job.schedule?.time}
                        <span className="days-until"> ({getDaysUntil(job.schedule?.date)})</span>
                      </p>
                    </div>
                  </div>
                  <div className="job-meta">
                    <span className="job-price">
                      KSh {job.totalPrice?.toLocaleString()}
                    </span>
                    <span className={`job-status ${job.status}`}>
                      {job.status?.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <div className="job-details">
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

                  {job.location?.specialInstructions && (
                    <div className="special-instructions">
                      <span className="instructions-label">📝 Client Instructions:</span>
                      <span className="instructions-value">{job.location.specialInstructions}</span>
                    </div>
                  )}

                  <div className="client-contact">
                    <span className="contact-label">📞 Client Contact:</span>
                    <div className="contact-info">
                      <span className="client-name">
                        {job.userId?.firstName} {job.userId?.lastName}
                      </span>
                      {job.userId?.phone && (
                        <span className="client-phone">📱 {job.userId.phone}</span>
                      )}
                      <span className="client-rating">⭐ {job.userId?.rating || '5.0'}</span>
                    </div>
                  </div>
                </div>

                <div className="job-management">
                  <div className="status-actions">
                    {job.status === 'confirmed' && (
                      <>
                        <button 
                          className="btn-primary"
                          onClick={() => updateJobStatus(job._id, 'in-progress')}
                        >
                          Start Job
                        </button>
                        <button className="btn-outline">
                          Reschedule
                        </button>
                      </>
                    )}
                    {job.status === 'in-progress' && (
                      <button 
                        className="btn-primary"
                        onClick={() => updateJobStatus(job._id, 'completed')}
                      >
                        Mark Complete
                      </button>
                    )}
                    {job.status === 'completed' && (
                      <span className="completed-badge">✅ Job Completed</span>
                    )}
                  </div>
                  
                  <div className="job-utilities">
                    <button className="utility-btn">
                      📍 Get Directions
                    </button>
                    <button className="utility-btn">
                      💬 Message Client
                    </button>
                    <button className="utility-btn">
                      📋 Job Checklist
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyJobs;