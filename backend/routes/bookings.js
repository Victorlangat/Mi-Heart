import express from 'express';
import {
  getUserBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  getAvailableJobs,
  applyForJob,
  getJobApplications,
  getAvailableCleaners,
  completePayment,
  getCleanerJobs,
  updateJobStatus,
  getBookingStats,
  acceptCleanerApplication
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`📥 BOOKINGS API: ${req.method} ${req.originalUrl}`);
  console.log('🔑 User ID:', req.userId);
  next();
});

// All routes are protected
router.use(protect);

// Client routes
router.get('/my-bookings', getUserBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.patch('/:id/cancel', cancelBooking);
router.get('/:id/applications', getJobApplications);
router.patch('/:id/accept-cleaner', acceptCleanerApplication);
router.patch('/:id/complete-payment', completePayment);

// Cleaner routes
router.get('/available/jobs', getAvailableJobs);
router.get('/available-jobs', getAvailableJobs); // Compatibility endpoint
router.post('/:id/apply', applyForJob);
router.get('/cleaner/my-jobs', getCleanerJobs);
router.patch('/:id/status', updateJobStatus);

// Shared routes
router.get('/cleaners/available', getAvailableCleaners);
router.get('/stats/dashboard', getBookingStats);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Bookings API is working!',
    timestamp: new Date().toISOString(),
    user: req.userId
  });
});

export default router;