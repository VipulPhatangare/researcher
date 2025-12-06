import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true
  },
  ratings: {
    q1: { type: Number, required: true, min: 1, max: 5 },
    q2: { type: Number, required: true, min: 1, max: 5 },
    q3: { type: Number, required: true, min: 1, max: 5 },
    q4: { type: Number, required: true, min: 1, max: 5 },
    q5: { type: Number, required: true, min: 1, max: 5 },
    q6: { type: Number, required: true, min: 1, max: 5 },
    q7: { type: Number, required: true, min: 1, max: 5 },
    q8: { type: Number, required: true, min: 1, max: 5 },
    q9: { type: Number, required: true, min: 1, max: 5 },
    q10: { type: Number, required: true, min: 1, max: 5 }
  },
  feedback: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
