import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './FindClient.css';

const FindClient = () => {
  const { user } = useAuth();

  return (
    <div className="cleaner-dashboard">
      <div className="dashboard-header">
        <h1>Cleaner Dashboard</h1>
        <p>Welcome back, {user?.firstName}! Manage your cleaning business</p>
      </div>

      <div className="dashboard-grid">
        {/* Quick Stats */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-info">
              <h3>Available Jobs</h3>
              <p>Find new cleaning opportunities</p>
            </div>
            <Link to="/cleaner/jobs" className="stat-action">
              Browse Jobs →
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <h3>My Applications</h3>
              <p>Track your job applications</p>
            </div>
            <Link to="/cleaner/applications" className="stat-action">
              View Applications →
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <h3>My Jobs</h3>
              <p>Manage assigned cleaning jobs</p>
            </div>
            <Link to="/cleaner/my-jobs" className="stat-action">
              Manage Jobs →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/cleaner/jobs" className="action-btn primary">
              <span className="icon">🔍</span>
              <span>Find New Jobs</span>
            </Link>
            <Link to="/cleaner/applications" className="action-btn">
              <span className="icon">📋</span>
              <span>View Applications</span>
            </Link>
            <Link to="/profile" className="action-btn">
              <span className="icon">👤</span>
              <span>Update Profile</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Getting Started</h2>
          <div className="activity-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Browse Available Jobs</h4>
                <p>Find cleaning jobs in your area that match your skills</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Apply for Jobs</h4>
                <p>Send applications to clients and showcase your expertise</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Get Hired</h4>
                <p>Clients will review your application and assign you jobs</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Complete & Earn</h4>
                <p>Finish cleaning jobs and get paid through our platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindClient;