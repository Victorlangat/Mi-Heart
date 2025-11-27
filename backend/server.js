import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Debug environment variables
console.log('🔧 Environment Configuration:');
console.log('   PORT:', process.env.PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');

// Import routes
import bookingRoutes from './routes/bookings.js';
import cleanerRoutes from './routes/cleaners.js';
import authRoutes from './routes/auth.js';
import invitationRoutes from './routes/invitations.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/cleaners', cleanerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'MadEasy Backend Server is running!',
    timestamp: new Date().toISOString(),
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT
  });
});

// Test database endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ 
      message: 'Database connection successful',
      collections: collections.map(c => c.name),
      database: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message 
    });
  }
});

// Enhanced test signup endpoint for debugging
app.post('/api/debug/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType } = req.body;
    
    // Simple validation
    if (!firstName || !lastName || !email || !password || !userType) {
      return res.status(400).json({ 
        error: 'Please provide all required fields: firstName, lastName, email, password, userType' 
      });
    }

    // Check if user already exists
    const User = (await import('./models/User.js')).default;
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      userType,
      avatar: userType === 'client' ? '👨' : '👩'
    });

    // Generate token
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // Return user without password
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      avatar: user.avatar,
      bookings: user.bookings || 0,
      completedJobs: user.completedJobs || 0,
      rating: user.rating || 5.0
    };

    res.status(201).json({
      success: true,
      message: 'Debug user created successfully!',
      data: { user: userResponse, token }
    });
  } catch (error) {
    console.error('Debug signup error:', error);
    res.status(500).json({ 
      error: 'Debug signup failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// MongoDB connection with enhanced error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Atlas Connected Successfully!');
  console.log('   Host:', mongoose.connection.host);
  console.log('   Database:', mongoose.connection.name);
  console.log('   Ready State:', mongoose.connection.readyState);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB event: Connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB event: Connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB event: Disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed through app termination');
  process.exit(0);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global error handler:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 MadEasy Backend Server Started!');
  console.log('=================================');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📊 MongoDB: Connected ✅');
  console.log('=================================');
  console.log('🔗 Available Endpoints:');
  console.log('   GET  http://localhost:5000/api/health');
  console.log('   GET  http://localhost:5000/api/test-db');
  console.log('   POST http://localhost:5000/api/debug/signup');
  console.log('   POST http://localhost:5000/api/auth/register');
  console.log('   POST http://localhost:5000/api/auth/login');
  console.log('   POST http://localhost:5000/api/bookings');
  console.log('   GET  http://localhost:5000/api/bookings/my-bookings');
  console.log('   GET  http://localhost:5000/api/bookings/available-jobs');
  console.log('   GET  http://localhost:5000/api/cleaners/available');
  console.log('=================================');
});