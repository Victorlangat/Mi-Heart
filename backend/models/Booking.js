import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['standard', 'deep', 'move-in', 'move-out', 'custom']
  },
  schedule: {
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      enum: ['once', 'weekly', 'biweekly', 'monthly'],
      default: 'once'
    }
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'townhouse', 'office'],
      required: true
    },
    bedrooms: {
      type: Number,
      required: true
    },
    bathrooms: {
      type: Number,
      required: true
    },
    squareFootage: {
      type: Number,
      default: 0
    },
    specialInstructions: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  extras: {
    deepCleaning: { type: Boolean, default: false },
    windowCleaning: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    fridgeCleaning: { type: Boolean, default: false },
    ovenCleaning: { type: Boolean, default: false },
    balconyCleaning: { type: Boolean, default: false },
    carpetCleaning: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: [
      'pending-cleaner',  // Waiting for cleaner to accept invitation
      'pending',          // Traditional pending status
      'accepted',         // ADDED: Cleaner accepted, waiting for payment
      'confirmed',        // Payment completed, booking confirmed
      'in-progress',      // Cleaning in progress
      'completed',        // Cleaning completed
      'cancelled'         // Booking cancelled
    ],
    default: 'pending-cleaner'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  cleanerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // ADDED: Assigned Cleaner (for accepted invitations)
  assignedCleaner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  clientNotes: String,  // ADDED: Notes from client
  cleanerNotes: String, // ADDED: Notes from cleaner
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'paypal', 'card', 'cash'],
    default: 'mpesa'
  },
  transactionId: String,
  paidAt: Date,
  
  // Timestamps for different stages
  acceptedAt: Date,    // ADDED: When cleaner accepted
  startedAt: Date,     // ADDED: When cleaning started
  completedAt: Date,   // ADDED: When cleaning completed
  cancelledAt: Date,   // ADDED: When booking cancelled
  cancellationReason: String, // ADDED: Reason for cancellation
  
  // Job Applications System
  applications: [{
    cleanerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    proposedPrice: Number,
    message: String,
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ADDED: Invitation tracking
  invitationSent: {
    type: Boolean,
    default: false
  },
  invitationAccepted: {
    type: Boolean,
    default: false
  },
  invitationDeclined: {
    type: Boolean,
    default: false
  },
  invitationExpiresAt: Date,

  // ADDED: Client contact information (for quick access)
  clientContact: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  }
}, {
  timestamps: true
});

// Add indexes for better performance
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, schedule: 1 });
bookingSchema.index({ 'applications.cleanerId': 1 });
bookingSchema.index({ assignedCleaner: 1, status: 1 }); // ADDED for cleaner assignments
bookingSchema.index({ invitationExpiresAt: 1 }); // ADDED for invitation expiration

// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function() {
  return ['pending-cleaner', 'pending', 'accepted', 'confirmed', 'in-progress'].includes(this.status); // UPDATED: Added 'accepted'
});

// Virtual for checking if booking can be cancelled
bookingSchema.virtual('canBeCancelled').get(function() {
  return ['pending-cleaner', 'pending', 'accepted', 'confirmed'].includes(this.status); // UPDATED: Added 'accepted'
});

// Virtual for formatted address
bookingSchema.virtual('formattedAddress').get(function() {
  return `${this.location.address}, ${this.location.city}`;
});

// Virtual for time until booking
bookingSchema.virtual('timeUntilBooking').get(function() {
  const now = new Date();
  const bookingDateTime = new Date(this.schedule.date);
  const timeParts = this.schedule.time.split(' ');
  const [hours, minutes] = timeParts[0].split(':');
  
  bookingDateTime.setHours(
    timeParts[1] === 'PM' && hours !== '12' ? parseInt(hours) + 12 : parseInt(hours),
    parseInt(minutes)
  );
  
  return bookingDateTime - now;
});

// Instance method to check if cleaner can be assigned
bookingSchema.methods.canAssignCleaner = function() {
  return this.status === 'pending-cleaner' && !this.assignedCleaner;
};

// Instance method to accept booking (for cleaner)
bookingSchema.methods.acceptBooking = function(cleanerId) {
  if (this.status !== 'pending-cleaner') {
    throw new Error('Booking is not available for acceptance');
  }
  
  this.assignedCleaner = cleanerId;
  this.status = 'accepted'; // CHANGED: from 'confirmed' to 'accepted'
  this.acceptedAt = new Date();
  this.invitationAccepted = true;
  
  return this.save();
};

// Instance method to decline booking (for cleaner)
bookingSchema.methods.declineBooking = function(reason) {
  if (this.status !== 'pending-cleaner') {
    throw new Error('Booking is not available for decline');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason || 'Cleaner declined';
  this.invitationDeclined = true;
  
  return this.save();
};

// Instance method to start cleaning
bookingSchema.methods.startCleaning = function() {
  if (this.status !== 'confirmed') { // CHANGED: Only confirmed bookings can start
    throw new Error('Booking must be confirmed before starting');
  }
  
  this.status = 'in-progress';
  this.startedAt = new Date();
  
  return this.save();
};

// Instance method to complete cleaning
bookingSchema.methods.completeCleaning = function(notes) {
  if (this.status !== 'in-progress') {
    throw new Error('Booking must be in progress before completing');
  }
  
  this.status = 'completed';
  this.completedAt = new Date();
  this.cleanerNotes = notes;
  
  return this.save();
};

// Static method to find expired pending-cleaner bookings
bookingSchema.statics.findExpiredPendingBookings = function() {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  return this.find({
    status: 'pending-cleaner',
    createdAt: { $lt: fifteenMinutesAgo }
  });
};

// Static method to get bookings by status and date range
bookingSchema.statics.getBookingsByStatusAndDate = function(status, startDate, endDate) {
  const query = {};
  
  if (status) query.status = status;
  if (startDate || endDate) {
    query['schedule.date'] = {};
    if (startDate) query['schedule.date'].$gte = new Date(startDate);
    if (endDate) query['schedule.date'].$lte = new Date(endDate);
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email phone')
    .populate('assignedCleaner', 'firstName lastName avatar rating')
    .sort({ 'schedule.date': 1, 'schedule.time': 1 });
};

// Middleware to update client contact info before save
bookingSchema.pre('save', function(next) {
  // If client contact is not set but we have user info, populate it
  if ((!this.clientContact || !this.clientContact.firstName) && this.userId) {
    // This would typically be populated from the User model
    // In a real app, you might want to populate this from the referenced User
  }
  next();
});

// Middleware to log status changes
bookingSchema.post('save', function(doc) {
  console.log(`Booking ${doc._id} status changed to: ${doc.status}`);
});

export default mongoose.model('Booking', bookingSchema);