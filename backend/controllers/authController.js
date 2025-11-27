// backend/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register user - FIXED TO MATCH USER MODEL
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType, phone } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user - FIXED: Use correct field names for your User model
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(), 
      email: email.toLowerCase().trim(),
      password,
      userType, // This should match your User model
      phone: phone?.trim() || '',
      avatar: userType === 'client' ? '👨' : '👩',
      // Add any other fields your User model expects
      isAvailable: userType === 'cleaner' ? true : undefined,
      rating: userType === 'cleaner' ? 5.0 : undefined
    });

    const token = generateToken(user._id);

    // Return user data in correct format
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: { 
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          phone: user.phone,
          avatar: user.avatar,
          isAvailable: user.isAvailable,
          rating: user.rating,
          bookings: user.bookings || 0,
          completedJobs: user.completedJobs || 0
        }, 
        token 
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Login user - FIXED TO MATCH USER MODEL
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    // Return user data in correct format
    res.json({
      success: true,
      message: 'Login successful!',
      data: { 
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          phone: user.phone,
          avatar: user.avatar,
          isAvailable: user.isAvailable,
          rating: user.rating,
          bookings: user.bookings || 0,
          completedJobs: user.completedJobs || 0
        }, 
        token 
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Get user profile - FIXED
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { 
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          phone: user.phone,
          avatar: user.avatar,
          isAvailable: user.isAvailable,
          rating: user.rating,
          bookings: user.bookings || 0,
          completedJobs: user.completedJobs || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};