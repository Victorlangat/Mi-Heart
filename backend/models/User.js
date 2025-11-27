import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // Password won't be returned by default
  },
  userType: {
    type: String,
    enum: ['client', 'cleaner'],
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: '👤'
  },
  
  // Cleaner-specific fields
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  
  // Client-specific fields
  bookings: {
    type: Number,
    default: 0
  },
  
  // Common fields
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Password hashing middleware - FIXED
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method - FIXED
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Create and export the model
const User = mongoose.model('User', userSchema);

export default User;