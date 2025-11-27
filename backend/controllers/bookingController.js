import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';

// Get all bookings for a user
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('📖 Fetching bookings for user:', userId);

    let bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .populate('assignedCleaner', 'firstName lastName avatar rating phone')
      .populate('applications.cleanerId', 'firstName lastName avatar rating')
      .lean();

    if (!bookings || bookings.length === 0) {
      console.log('🔍 No bookings found with userId, trying alternative queries...');
      
      bookings = await Booking.find({ clientId: userId })
        .sort({ createdAt: -1 })
        .populate('assignedCleaner', 'firstName lastName avatar rating phone')
        .populate('applications.cleanerId', 'firstName lastName avatar rating')
        .lean();

      if (!bookings || bookings.length === 0) {
        console.log('📭 No bookings found for user');
        return res.json({
          success: true,
          data: { bookings: [] },
          count: 0,
          message: 'No bookings found'
        });
      }
    }

    console.log('✅ Found bookings:', bookings.length);

    res.json({
      success: true,
      data: { bookings },
      count: bookings.length
    });

  } catch (error) {
    console.error('❌ Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('🔍 Finding booking:', id, 'for user:', userId);

    let booking = await Booking.findOne({ _id: id, userId })
      .populate('assignedCleaner', 'firstName lastName avatar phone rating')
      .populate('applications.cleanerId', 'firstName lastName avatar rating phone completedJobs');

    if (!booking) {
      booking = await Booking.findOne({ _id: id, clientId: userId })
        .populate('assignedCleaner', 'firstName lastName avatar phone rating')
        .populate('applications.cleanerId', 'firstName lastName avatar rating phone completedJobs');
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// Create new booking
export const createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('📝 Creating booking for user:', userId);
    console.log('📦 Booking data received:', req.body);

    const bookingData = {
      ...req.body,
      userId,
      clientId: userId,
      status: 'pending-cleaner',
      assignedCleaner: null,
      paymentStatus: 'pending'
    };

    const booking = await Booking.create(bookingData);

    await User.findByIdAndUpdate(userId, { $inc: { bookings: 1 } });

    console.log('✅ Booking created successfully! ID:', booking._id);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully! Waiting for cleaner acceptance.',
      data: { booking }
    });

  } catch (error) {
    console.error('❌ Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('❌ Cancelling booking:', id, 'for user:', userId);

    let booking = await Booking.findOne({ _id: id, userId });
    if (!booking) {
      booking = await Booking.findOne({ _id: id, clientId: userId });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking`
      });
    }

    await Invitation.updateMany(
      { bookingId: id, status: 'pending' },
      { status: 'cancelled' }
    );

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// Get available jobs for cleaners
export const getAvailableJobs = async (req, res) => {
  try {
    const { city, serviceType, maxPrice } = req.query;
    const cleanerId = req.userId;
    
    let filter = {
      status: 'pending-cleaner',
      $or: [
        { assignedCleaner: { $exists: false } },
        { assignedCleaner: null }
      ]
    };

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (serviceType) filter.serviceType = serviceType;
    if (maxPrice) filter.totalPrice = { $lte: parseInt(maxPrice) };

    console.log('🔍 Fetching available jobs with filter:', filter);

    const jobs = await Booking.find(filter)
      .populate('userId', 'firstName lastName avatar rating')
      .populate('applications.cleanerId', 'firstName lastName avatar rating')
      .sort({ createdAt: -1 });

    console.log('✅ Found jobs:', jobs.length);

    res.json({
      success: true,
      data: { jobs },
      count: jobs.length
    });

  } catch (error) {
    console.error('Get available jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available jobs',
      error: error.message
    });
  }
};

// Get available cleaners
export const getAvailableCleaners = async (req, res) => {
  try {
    const { city, serviceType } = req.query;
    console.log('🔍 Finding cleaners for:', { city, serviceType });

    let filter = {
      userType: 'cleaner',
      isAvailable: true,
      status: 'active'
    };

    if (city) filter['location.city'] = new RegExp(city, 'i');

    const cleaners = await User.find(filter)
      .select('firstName lastName avatar rating completedJobs phone bio specialties isAvailable location')
      .limit(20)
      .sort({ rating: -1, completedJobs: -1 });

    console.log('✅ Found cleaners:', cleaners.length);

    res.json({
      success: true,
      message: 'Cleaners fetched successfully',
      data: { cleaners },
      count: cleaners.length
    });

  } catch (error) {
    console.error('Get cleaners error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cleaners',
      error: error.message
    });
  }
};

// Apply for job (cleaner)
export const applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanerId = req.userId;
    const { proposedPrice, message } = req.body;

    console.log('📨 Cleaner applying for job:', { cleanerId, jobId: id });

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (booking.status !== 'pending-cleaner') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer available for applications'
      });
    }

    const alreadyApplied = booking.applications.some(
      app => app.cleanerId && app.cleanerId.toString() === cleanerId
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    booking.applications.push({
      cleanerId,
      proposedPrice: proposedPrice || booking.totalPrice,
      message: message || 'I would love to help with this cleaning job!',
      appliedAt: new Date(),
      status: 'pending'
    });

    let autoAccepted = false;
    if (booking.applications.length === 1) {
      booking.assignedCleaner = cleanerId;
      booking.status = 'accepted';
      autoAccepted = true;
      console.log('✅ Auto-accepted first application for job:', id);
    }

    await booking.save();

    await booking.populate('assignedCleaner', 'firstName lastName avatar phone rating');
    await booking.populate('applications.cleanerId', 'firstName lastName avatar rating phone completedJobs');

    res.json({
      success: true,
      message: autoAccepted 
        ? 'Application submitted and accepted! Job is now assigned to you.' 
        : 'Application submitted successfully! Waiting for client approval.',
      data: { 
        booking,
        autoAccepted 
      }
    });

  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying for job',
      error: error.message
    });
  }
};

// Get job applications
export const getJobApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    let booking = await Booking.findOne({ _id: id, userId })
      .populate('applications.cleanerId', 'firstName lastName avatar rating phone completedJobs');

    if (!booking) {
      booking = await Booking.findOne({ _id: id, clientId: userId })
        .populate('applications.cleanerId', 'firstName lastName avatar rating phone completedJobs');
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: { applications: booking.applications }
    });

  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job applications',
      error: error.message
    });
  }
};

// Client accepts cleaner application - FIXED VERSION
export const acceptCleanerApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { cleanerId } = req.body;

    console.log('🤝 Client accepting cleaner application:', { 
      bookingId: id, 
      cleanerId, 
      clientId: userId 
    });

    // Find the booking
    let booking = await Booking.findOne({ _id: id, userId });
    if (!booking) {
      booking = await Booking.findOne({ _id: id, clientId: userId });
    }

    if (!booking) {
      console.log('❌ Booking not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log('📋 Booking found with status:', booking.status);

    if (booking.status !== 'pending-cleaner') {
      console.log('❌ Invalid booking status:', booking.status);
      return res.status(400).json({
        success: false,
        message: 'This booking is no longer accepting applications'
      });
    }

    // Check if applications exist
    if (!booking.applications || booking.applications.length === 0) {
      console.log('❌ No applications found for booking');
      return res.status(400).json({
        success: false,
        message: 'No applications found for this booking'
      });
    }

    // Find the specific application
    const application = booking.applications.find(app => 
      app.cleanerId && app.cleanerId.toString() === cleanerId
    );

    if (!application) {
      console.log('❌ Application not found for cleaner:', cleanerId);
      return res.status(404).json({
        success: false,
        message: 'Application not found for this cleaner'
      });
    }

    console.log('✅ Found application for cleaner:', application.cleanerId);

    // Update all applications status
    booking.applications.forEach(app => {
      if (app.cleanerId && app.cleanerId.toString() === cleanerId) {
        app.status = 'accepted';
        console.log('✅ Accepted application for cleaner:', cleanerId);
      } else {
        app.status = 'rejected';
        console.log('❌ Rejected application for cleaner:', app.cleanerId);
      }
    });

    // Assign cleaner and update booking status
    booking.assignedCleaner = cleanerId;
    booking.status = 'accepted';
    
    console.log('💾 Saving booking changes...');
    await booking.save();
    console.log('✅ Booking saved successfully');

    // Populate the response
    await booking.populate('assignedCleaner', 'firstName lastName avatar phone rating');
    await booking.populate('applications.cleanerId', 'firstName lastName avatar rating');

    console.log('✅ Cleaner accepted for booking:', id);

    res.json({
      success: true,
      message: 'Cleaner accepted successfully! You can now proceed with payment.',
      data: { booking }
    });

  } catch (error) {
    console.error('❌ Accept cleaner error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error accepting cleaner application: ' + error.message,
      error: error.message
    });
  }
};

// Complete payment
export const completePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { paymentMethod, transactionId } = req.body;

    console.log('💳 Processing payment for booking:', id);

    let booking = await Booking.findOne({ _id: id, userId });
    if (!booking) {
      booking = await Booking.findOne({ _id: id, clientId: userId });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be accepted by cleaner before payment'
      });
    }

    if (!booking.assignedCleaner) {
      return res.status(400).json({
        success: false,
        message: 'No cleaner assigned to this booking'
      });
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod;
    booking.transactionId = transactionId;
    booking.paidAt = new Date();
    booking.status = 'confirmed';
    await booking.save();

    console.log('✅ Payment completed for booking:', id);

    res.json({
      success: true,
      message: 'Payment completed successfully! Your booking is now confirmed.',
      data: { booking }
    });

  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing payment',
      error: error.message
    });
  }
};

// Get cleaner's jobs
export const getCleanerJobs = async (req, res) => {
  try {
    const cleanerId = req.userId;
    console.log('🔍 Fetching jobs for cleaner:', cleanerId);

    const jobs = await Booking.find({
      assignedCleaner: cleanerId,
      status: { $in: ['accepted', 'confirmed', 'in-progress', 'completed'] }
    })
      .populate('userId', 'firstName lastName avatar rating phone')
      .populate('applications.cleanerId', 'firstName lastName avatar rating')
      .sort({ 'schedule.date': 1 });

    console.log('✅ Found cleaner jobs:', jobs.length);

    res.json({
      success: true,
      data: { jobs },
      count: jobs.length
    });

  } catch (error) {
    console.error('Get cleaner jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cleaner jobs',
      error: error.message
    });
  }
};

// Update job status
export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanerId = req.userId;
    const { status, notes } = req.body;

    console.log('🔄 Updating job status:', { jobId: id, status, cleanerId });

    const booking = await Booking.findOne({
      _id: id,
      assignedCleaner: cleanerId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not assigned to you'
      });
    }

    const validTransitions = {
      'accepted': ['confirmed'],
      'confirmed': ['in-progress'],
      'in-progress': ['completed'],
      'completed': []
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    booking.status = status;
    if (notes) booking.cleanerNotes = notes;
    
    if (status === 'completed') {
      booking.completedAt = new Date();
      await User.findByIdAndUpdate(cleanerId, {
        $inc: { completedJobs: 1 }
      });
      console.log('🎉 Job marked as completed:', id);
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Job status updated successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job status',
      error: error.message
    });
  }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    const totalBookings = await Booking.countDocuments({ userId });
    const pendingBookings = await Booking.countDocuments({ 
      userId, 
      status: { $in: ['pending', 'pending-cleaner', 'accepted'] } 
    });
    const completedBookings = await Booking.countDocuments({ 
      userId, 
      status: 'completed' 
    });
    const totalSpent = await Booking.aggregate([
      { $match: { userId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalBookings,
        pending: pendingBookings,
        completed: completedBookings,
        totalSpent: totalSpent[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking statistics',
      error: error.message
    });
  }
};