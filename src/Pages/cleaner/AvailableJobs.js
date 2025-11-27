import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './cleanerPages.css';

const AvailableJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    serviceType: '',
    maxPrice: ''
  });
  const [applyingJob, setApplyingJob] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  const fetchAvailableJobs = async () => {
    try {
      console.log('🔄 Fetching available jobs...');
      const token = localStorage.getItem('madEasy_token');
      console.log('📝 Token exists:', !!token);
      
      const queryParams = new URLSearchParams();
      
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.serviceType) queryParams.append('serviceType', filters.serviceType);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

      // FIXED: Changed endpoint from /available-jobs to /available/jobs
      const apiUrl = `http://localhost:5000/api/bookings/available/jobs?${queryParams}`;
      console.log('🌐 API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 API Response status:', response.status);
      const data = await response.json();
      console.log('📦 API Response data:', data);
      
      if (data.success) {
        console.log('✅ Jobs fetched successfully:', data.data.jobs.length);
        console.log('📋 Jobs details:', data.data.jobs);
        setJobs(data.data.jobs);
      } else {
        console.log('❌ API error:', data.message);
      }
    } catch (error) {
      console.error('🚨 Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId, proposedPrice) => {
    try {
      console.log('📨 Applying for job:', jobId);
      const token = localStorage.getItem('madEasy_token');
      
      // FIXED: Using the correct apply endpoint
      const response = await fetch(`http://localhost:5000/api/bookings/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposedPrice: proposedPrice || 0,
          message: `I'd love to help with this ${jobs.find(j => j._id === jobId)?.serviceType} cleaning!`
        })
      });

      console.log('📡 Apply API Response status:', response.status);
      const data = await response.json();
      console.log('📦 Apply API Response data:', data);

      if (data.success) {
        alert('Application submitted successfully!');
        setApplyingJob(null);
        fetchAvailableJobs(); // Refresh list
      } else {
        alert(data.message || 'Failed to apply for job');
      }
    } catch (error) {
      console.error('Apply error:', error);
      alert('Error applying for job');
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
      <div className="cleaner-loading">
        <div className="loading-spinner"></div>
        <p>Loading available jobs...</p>
      </div>
    );
  }

  return (
    <div className="cleaner-page">
      <div className="cleaner-container">
        {/* Header */}
        <div className="cleaner-header">
          <h1>Available Jobs</h1>
          <p>Find and apply for cleaning jobs in your area</p>
          <div className="debug-info">
            <small>Found {jobs.length} jobs • User: {user?.userType}</small>
          </div>
        </div>

        {/* Filters */}
        <div className="jobs-filters">
          <div className="filter-group">
            <label>City</label>
            <input
              type="text"
              placeholder="e.g. Nairobi"
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="standard">Standard Cleaning</option>
              <option value="deep">Deep Cleaning</option>
              <option value="move-in">Move-In Cleaning</option>
              <option value="move-out">Move-Out Cleaning</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Max Price (KSh)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
            />
          </div>
          <button className="btn-primary" onClick={fetchAvailableJobs}>
            Apply Filters
          </button>
          <button className="btn-outline" onClick={fetchAvailableJobs}>
            Refresh
          </button>
        </div>

        {/* Jobs List */}
        <div className="jobs-list">
          {jobs.length === 0 ? (
            <div className="no-jobs">
              <div className="no-jobs-icon">🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your filters or check back later for new jobs</p>
              <div className="debug-tips">
                <h4>Debugging Tips:</h4>
                <ul>
                  <li>Check if bookings are created with status: 'pending'</li>
                  <li>Verify backend API is running on port 5000</li>
                  <li>Check browser console for API response details</li>
                  <li>Ensure user is logged in as a cleaner</li>
                  <li>Verify the API endpoint: /api/bookings/available/jobs</li>
                </ul>
              </div>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job._id} className="job-card">
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
                      </p>
                      <small className="job-id">ID: {job._id}</small>
                    </div>
                  </div>
                  <div className="job-meta">
                    <span className="job-price">
                      KSh {job.totalPrice?.toLocaleString()}
                    </span>
                    <span className="job-frequency">
                      {job.schedule?.frequency === 'once' ? 'One Time' : 
                       job.schedule?.frequency === 'weekly' ? 'Weekly' :
                       job.schedule?.frequency === 'biweekly' ? 'Bi-Weekly' : 'Monthly'}
                    </span>
                    <span className="job-status">
                      Status: {job.status}
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
                      <span className="instructions-label">📝 Instructions:</span>
                      <span className="instructions-value">{job.location.specialInstructions}</span>
                    </div>
                  )}

                  {job.extras && Object.values(job.extras).some(Boolean) && (
                    <div className="extras-section">
                      <span className="extras-label">✨ Extras:</span>
                      <div className="extras-list">
                        {Object.entries(job.extras).map(([key, value]) => 
                          value && (
                            <span key={key} className="extra-tag">
                              {key.replace('Cleaning', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="client-info">
                    <span className="client-label">👤 Posted by:</span>
                    <span className="client-name">
                      {job.userId?.firstName} {job.userId?.lastName}
                      {job.userId?.rating && (
                        <span className="client-rating">⭐ {job.userId.rating}</span>
                      )}
                    </span>
                  </div>

                  {/* Debug Info */}
                  <div className="debug-info">
                    <small>
                      Applications: {job.applications?.length || 0} • 
                      Assigned Cleaner: {job.assignedCleaner ? 'Yes' : 'No'}
                    </small>
                  </div>
                </div>

                <div className="job-actions">
                  {applyingJob === job._id ? (
                    <div className="apply-form">
                      <button 
                        className="btn-primary"
                        onClick={() => handleApply(job._id, job.totalPrice)}
                      >
                        Confirm Apply
                      </button>
                      <button 
                        className="btn-outline"
                        onClick={() => setApplyingJob(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn-primary"
                      onClick={() => setApplyingJob(job._id)}
                    >
                      Apply for Job
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableJobs;