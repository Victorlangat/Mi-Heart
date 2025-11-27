// src/App.js - UPDATED WITH CLEANER ROUTES
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Header from './components/header';
import Footer from './components/footer';
import Homepage from './Pages/homepage';
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Auth/SignIn';
import BookingPage from './Pages/BookingPage';
import FindClient from './Pages/FindClients';
import ProtectedRoute from './components/ProtectedRoutes'; // Fixed import name
import UserProfile from './Pages/UserProfile';
import MyBookings from './Pages/MyBookings';
import './utils/globalFix'; 

// Cleaner Pages
import AvailableJobs from './Pages/cleaner/AvailableJobs';
import MyApplications from './Pages/cleaner/MyApllications'; // FIXED: Correct spelling
import MyJobs from './Pages/cleaner/MyJobs';

// Client Pages
import JobApplications from './Pages/client/JobApplications';

import './App.css';

// Layout component that wraps all pages with Header and Footer
const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Auth Layout without Header/Footer
const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Homepage Route */}
              <Route 
                path="/" 
                element={
                  <Layout>
                    <Homepage />
                  </Layout>
                } 
              />
              
              {/* Auth Routes - Redirect if already authenticated */}
              <Route 
                path="/signup" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <AuthLayout>
                      <SignUp />
                    </AuthLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/signin" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <AuthLayout>
                      <SignIn />
                    </AuthLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Client Routes - PROTECTED: Client only */}
              <Route 
                path="/booking" 
                element={
                  <ProtectedRoute requireAuth={true} requiredRole="client">
                    <Layout>
                      <BookingPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute requireAuth={true} requiredRole="client">
                    <Layout>
                      <MyBookings />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/job-applications/:bookingId" 
                element={
                  <ProtectedRoute requireAuth={true} requiredRole="client">
                    <Layout>
                      <JobApplications />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Cleaner Routes - PROTECTED: Cleaner only */}
              <Route 
                path="/cleaner/jobs" 
                element={
                  <ProtectedRoute requireAuth={true} requiredRole="cleaner">
                    <Layout>
                      <AvailableJobs />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/cleaner/applications" 
                element={
                  <ProtectedRoute requireAuth={true} requiredRole="cleaner">
                    <Layout>
                      <MyApplications />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/cleaner/my-jobs" 
                element={
                  <ProtectedRoute requireAuth={true} requiredRole="cleaner">
                    <Layout>
                      <MyJobs />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* FindClient Route - PROTECTED: Cleaner only */}
              <Route 
                path="/find-client" 
                element={
                  <ProtectedRoute requireAuth={true} requiredRole="cleaner">
                    <Layout>
                      <FindClient />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* User Profile Route - PROTECTED */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <Layout>
                      <UserProfile />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* 404 Not Found Route */}
              <Route 
                path="*" 
                element={
                  <Layout>
                    <div className="not-found-page">
                      <div className="not-found-content">
                        <h1>404</h1>
                        <h2>Page Not Found</h2>
                        <p>The page you're looking for doesn't exist.</p>
                        <a href="/" className="home-link">Go Back Home</a>
                      </div>
                    </div>
                  </Layout>
                } 
              />
            </Routes>
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;