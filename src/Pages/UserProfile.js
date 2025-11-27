// src/Pages/UserProfile.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setMessage(result.error?.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
    setMessage('');
  };

  const getMemberSince = () => {
    if (!user?.joinDate) return 'Recent member';
    const joinDate = new Date(user.joinDate);
    return `Member since ${joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account information and preferences</p>
        </div>

        <div className="profile-content">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="user-card">
              <div className="user-avatar-large">
                {user?.avatar || '👤'}
              </div>
              <div className="user-info-sidebar">
                <h3>{user?.firstName} {user?.lastName}</h3>
                <p className="user-email">{user?.email}</p>
                <div className={`user-badge ${user?.userType}`}>
                  {user?.userType === 'client' ? '🧹 Client' : '✨ Cleaner'}
                </div>
                <p className="member-since">{getMemberSince()}</p>
              </div>
            </div>

            <div className="profile-stats">
              {user?.userType === 'client' ? (
                <>
                  <div className="stat-item">
                    <div className="stat-number">{user?.bookings || 0}</div>
                    <div className="stat-label">Total Bookings</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">5.0</div>
                    <div className="stat-label">Avg. Rating</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="stat-item">
                    <div className="stat-number">{user?.completedJobs || 0}</div>
                    <div className="stat-label">Jobs Completed</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{user?.rating || '5.0'}</div>
                    <div className="stat-label">Rating</div>
                  </div>
                </>
              )}
            </div>

            <button 
              className="logout-btn-sidebar"
              onClick={logout}
            >
              🚪 Sign Out
            </button>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            {message && (
              <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <div className="profile-section">
              <div className="section-header">
                <h2>Personal Information</h2>
                {!isEditing && (
                  <button 
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="profile-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        disabled
                      />
                      <small className="field-note">Email cannot be changed</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="address">Address</label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your address"
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>First Name</label>
                      <p>{user?.firstName || 'Not set'}</p>
                    </div>
                    <div className="info-item">
                      <label>Last Name</label>
                      <p>{user?.lastName || 'Not set'}</p>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <p>{user?.email}</p>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <p>{user?.phone || 'Not set'}</p>
                    </div>
                    <div className="info-item full-width">
                      <label>Address</label>
                      <p>{user?.address || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Settings Section */}
            <div className="profile-section">
              <h2>Account Settings</h2>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Password</h4>
                    <p>Last changed 2 months ago</p>
                  </div>
                  <button className="btn-outline">
                    Change Password
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Email Notifications</h4>
                    <p>Receive updates about your bookings and promotions</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>SMS Notifications</h4>
                    <p>Get text messages about cleaning appointments</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="profile-section">
              <h2>Quick Actions</h2>
              <div className="action-grid">
                {user?.userType === 'client' ? (
                  <>
                    <button className="action-card" onClick={() => window.location.href = '/booking'}>
                      <span className="action-icon">📅</span>
                      <span className="action-text">Book a Cleaning</span>
                    </button>
                    <button className="action-card" onClick={() => window.location.href = '/my-bookings'}>
                      <span className="action-icon">📋</span>
                      <span className="action-text">View My Bookings</span>
                    </button>
                    <button className="action-card">
                      <span className="action-icon">⭐</span>
                      <span className="action-text">Leave a Review</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="action-card" onClick={() => window.location.href = '/find-client'}>
                      <span className="action-icon">💼</span>
                      <span className="action-text">Find New Jobs</span>
                    </button>
                    <button className="action-card" onClick={() => window.location.href = '/my-jobs'}>
                      <span className="action-icon">📋</span>
                      <span className="action-text">My Job Schedule</span>
                    </button>
                    <button className="action-card">
                      <span className="action-icon">📊</span>
                      <span className="action-text">View Earnings</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;