import Feedback from '../models/feedback.model.js';

export const submitFeedback = async (req, res) => {
  try {
    const { userEmail, ratings, feedback, submittedAt } = req.body;

    // Check if user email is provided
    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

    // Check if user has already submitted feedback
    const existingFeedback = await Feedback.findOne({ userEmail });
    if (existingFeedback) {
      return res.status(409).json({ message: 'You have already submitted feedback' });
    }

    // Validate ratings
    if (!ratings || typeof ratings !== 'object') {
      return res.status(400).json({ message: 'Ratings are required' });
    }

    // Check all 10 questions are present
    for (let i = 1; i <= 10; i++) {
      const key = `q${i}`;
      if (!ratings[key] || ratings[key] < 1 || ratings[key] > 5) {
        return res.status(400).json({ message: `Rating for question ${i} must be between 1 and 5` });
      }
    }

    const newFeedback = new Feedback({
      userEmail,
      ratings,
      feedback: feedback || '',
      submittedAt: submittedAt || new Date()
    });

    await newFeedback.save();

    res.status(201).json({ 
      message: 'Feedback submitted successfully',
      feedbackId: newFeedback._id 
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ submittedAt: -1 });
    res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
};
