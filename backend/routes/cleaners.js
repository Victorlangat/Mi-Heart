import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/cleaners/available
// @desc    Get available cleaners
// @access  Private
router.get('/available', protect, async (req, res) => {
  try {
    const cleaners = await User.find({ 
      userType: 'cleaner',
      isAvailable: true 
    }).select('firstName lastName email phone rating completedJobs avatar');

    res.json({
      success: true,
      data: { cleaners },
      count: cleaners.length
    });
  } catch (error) {
    console.error('Error fetching cleaners:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching cleaners' 
    });
  }
});

// @route   GET /api/cleaners
// @desc    Get all cleaners
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const cleaners = await User.find({ userType: 'cleaner' })
      .select('firstName lastName email phone rating completedJobs avatar isAvailable');
    
    res.json({
      success: true,
      data: { cleaners },
      count: cleaners.length
    });
  } catch (error) {
    console.error('Error fetching cleaners:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching cleaners' 
    });
  }
});

// FIX: Change this line - remove the named export
export default router;  // CHANGE FROM: export { router as cleanerRoutes }