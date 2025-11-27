import express from 'express';
import {
  sendInvitation,
  getInvitationStatus,
  acceptInvitation,
  declineInvitation,
  getCleanerInvitations
} from '../controllers/invitationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`📥 INVITATIONS API: ${req.method} ${req.originalUrl}`);
  console.log('🔑 User ID:', req.userId);
  next();
});

// All routes are protected
router.use(protect);

// Client routes
router.post('/send', sendInvitation);
router.get('/status/:invitationId', getInvitationStatus);

// Cleaner routes
router.get('/cleaner/pending', getCleanerInvitations);
router.patch('/:invitationId/accept', acceptInvitation);
router.patch('/:invitationId/decline', declineInvitation);

export default router;