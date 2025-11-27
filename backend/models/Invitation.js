import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  cleanerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  bookingDetails: {
    serviceType: String,
    date: Date,
    time: String,
    location: String,
    totalPrice: Number,
    bedrooms: Number,
    bathrooms: Number
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date
}, {
  timestamps: true
});

// Add index for faster queries
invitationSchema.index({ cleanerId: 1, status: 1 });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Invitation', invitationSchema);