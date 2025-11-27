import Invitation from '../models/Invitation.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

// Send invitation to cleaner
export const sendInvitation = async (req, res) => {
  try {
    const { cleanerId, bookingDetails } = req.body;
    const clientId = req.userId;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('📤 Sending invitation from client:', clientId, 'to cleaner:', cleanerId);

    // Check if cleaner exists and is available
    const cleaner = await User.findOne({
      _id: cleanerId,
      userType: 'cleaner',
      isAvailable: true
    });

    if (!cleaner) {
      return res.status(404).json({
        success: false,
        message: 'Cleaner not found or not available'
      });
    }

    // Create a temporary booking first
    const booking = await Booking.create({
      userId: clientId,
      serviceType: bookingDetails.serviceType,
      schedule: {
        date: bookingDetails.date,
        time: bookingDetails.time,
        frequency: 'once'
      },
      location: {
        address: bookingDetails.location,
        city: bookingDetails.location.split(', ')[1] || 'Nairobi',
        propertyType: 'house',
        bedrooms: bookingDetails.bedrooms,
        bathrooms: bookingDetails.bathrooms
      },
      totalPrice: bookingDetails.totalPrice,
      status: 'pending-cleaner'
    });

    // Create invitation
    const invitation = await Invitation.create({
      bookingId: booking._id,
      cleanerId,
      clientId,
      bookingDetails,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    // Populate for response
    await invitation.populate('cleanerId', 'firstName lastName avatar rating');

    res.status(201).json({
      success: true,
      message: 'Invitation sent to cleaner successfully',
      data: {
        invitationId: invitation._id,
        bookingId: booking._id,
        cleaner: invitation.cleanerId,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invitation',
      error: error.message
    });
  }
};

// Check invitation status
export const getInvitationStatus = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const clientId = req.userId;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('🔍 Checking invitation status:', invitationId, 'for client:', clientId);

    const invitation = await Invitation.findById(invitationId)
      .populate('cleanerId', 'firstName lastName avatar')
      .populate('clientId', 'firstName lastName');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if the client owns this invitation
    if (invitation.clientId._id.toString() !== clientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if invitation expired
    if (invitation.status === 'pending' && new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await invitation.save();

      // Also update booking status
      await Booking.findByIdAndUpdate(invitation.bookingId, {
        status: 'cancelled',
        cancellationReason: 'Cleaner response timeout'
      });
    }

    res.json({
      success: true,
      data: {
        status: invitation.status,
        cleaner: invitation.cleanerId,
        respondedAt: invitation.respondedAt,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (error) {
    console.error('Get invitation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking invitation status',
      error: error.message
    });
  }
};

// Cleaner accepts invitation
export const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const cleanerId = req.userId;

    if (!cleanerId) {
      return res.status(401).json({
        success: false,
        message: 'Cleaner not authenticated'
      });
    }

    console.log('✅ Cleaner accepting invitation:', invitationId, 'cleaner:', cleanerId);

    const invitation = await Invitation.findOne({
      _id: invitationId,
      cleanerId,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or already processed'
      });
    }

    // Update invitation
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    await invitation.save();

    // Update booking with cleaner assignment
    await Booking.findByIdAndUpdate(invitation.bookingId, {
      assignedCleaner: cleanerId,
      status: 'confirmed'
    });

    // Update cleaner's completed jobs count
    await User.findByIdAndUpdate(cleanerId, {
      $inc: { completedJobs: 1 }
    });

    res.json({
      success: true,
      message: 'Booking accepted successfully!',
      data: { invitation }
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting invitation',
      error: error.message
    });
  }
};

// Cleaner declines invitation
export const declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const cleanerId = req.userId;
    const { reason } = req.body;

    if (!cleanerId) {
      return res.status(401).json({
        success: false,
        message: 'Cleaner not authenticated'
      });
    }

    console.log('❌ Cleaner declining invitation:', invitationId, 'cleaner:', cleanerId);

    const invitation = await Invitation.findOne({
      _id: invitationId,
      cleanerId,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or already processed'
      });
    }

    // Update invitation
    invitation.status = 'declined';
    invitation.respondedAt = new Date();
    await invitation.save();

    // Update booking status
    await Booking.findByIdAndUpdate(invitation.bookingId, {
      status: 'cancelled',
      cancellationReason: reason || 'Cleaner declined'
    });

    res.json({
      success: true,
      message: 'Booking declined',
      data: { invitation }
    });

  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error declining invitation',
      error: error.message
    });
  }
};

// Get cleaner's pending invitations
export const getCleanerInvitations = async (req, res) => {
  try {
    const cleanerId = req.userId;

    if (!cleanerId) {
      return res.status(401).json({
        success: false,
        message: 'Cleaner not authenticated'
      });
    }

    console.log('📥 Fetching pending invitations for cleaner:', cleanerId);

    const invitations = await Invitation.find({
      cleanerId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
      .populate('clientId', 'firstName lastName avatar rating phone')
      .populate('bookingId', 'totalPrice schedule location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { invitations },
      count: invitations.length
    });

  } catch (error) {
    console.error('Get cleaner invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invitations',
      error: error.message
    });
  }
};