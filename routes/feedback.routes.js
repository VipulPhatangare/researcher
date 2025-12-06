import express from 'express';
import { submitFeedback, getAllFeedback } from '../controllers/feedback.controller.js';
import Feedback from '../models/feedback.model.js';

const router = express.Router();

router.post('/submit', submitFeedback);
router.get('/all', getAllFeedback);

// Check if user has already submitted feedback
router.get('/check/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    const existingFeedback = await Feedback.findOne({ userEmail });
    res.status(200).json({ hasSubmitted: !!existingFeedback });
  } catch (error) {
    console.error('Error checking feedback:', error);
    res.status(500).json({ message: 'Failed to check feedback status' });
  }
});

export default router;
