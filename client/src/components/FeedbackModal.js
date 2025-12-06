import React, { useState, useEffect } from 'react';
import './FeedbackModal.css';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [ratings, setRatings] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
    q6: 0,
    q7: 0,
    q8: 0,
    q9: 0,
    q10: 0
  });
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const questions = [
    {
      id: 'q1',
      text: 'How clearly did the system understand your research problem statement?',
      subtitle: '(1 = Not clear at all, 5 = Completely accurate)'
    },
    {
      id: 'q2',
      text: 'How useful were the generated keywords and subtopics in defining your research direction?',
      subtitle: '(1 = Not useful, 5 = Extremely useful)'
    },
    {
      id: 'q3',
      text: 'How relevant were the retrieved research papers to your topic?',
      subtitle: '(1 = Poor match, 5 = Highly relevant and on-topic)'
    },
    {
      id: 'q4',
      text: 'How satisfied are you with the organization and filtering of papers (relevance, recency, impact)?',
      subtitle: '(1 = Not satisfied, 5 = Very satisfied)'
    },
    {
      id: 'q5',
      text: 'How helpful was the methodology and pattern extraction in understanding research trends?',
      subtitle: '(1 = Not helpful, 5 = Very helpful)'
    },
    {
      id: 'q6',
      text: 'How effectively did the system synthesize insights into a final structured solution?',
      subtitle: '(1 = Not effective, 5 = Highly effective)'
    },
    {
      id: 'q7',
      text: 'How easy was it to interact with the chatbot for follow-up questions and clarifications?',
      subtitle: '(1 = Difficult/confusing, 5 = Very easy and intuitive)'
    },
    {
      id: 'q8',
      text: 'How would you rate the accuracy and honesty of system responses (avoiding hallucination)?',
      subtitle: '(1 = Inaccurate/Speculative responses, 5 = Highly accurate and grounded)'
    },
    {
      id: 'q9',
      text: 'How valuable do you think this system is for real research use (students, researchers, industry)?',
      subtitle: '(1 = Low value, 5 = High practical value)'
    },
    {
      id: 'q10',
      text: 'How likely are you to continue using this tool or recommend it to others?',
      subtitle: '(1 = Not likely, 5 = Definitely will)'
    }
  ];

  useEffect(() => {
    const checkFeedbackStatus = async () => {
      if (isOpen) {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/feedback/check/${encodeURIComponent(userEmail)}`);
            const data = await response.json();
            setAlreadySubmitted(data.hasSubmitted);
          } catch (error) {
            console.error('Error checking feedback status:', error);
          }
        }
      }
    };
    checkFeedbackStatus();
  }, [isOpen]);

  const handleRatingChange = (questionId, value) => {
    setRatings(prev => ({ ...prev, [questionId]: value }));
    setErrors(prev => ({ ...prev, [questionId]: false }));
  };

  const validateForm = () => {
    const newErrors = {};
    questions.forEach(q => {
      if (ratings[q.id] === 0) {
        newErrors[q.id] = true;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please rate all questions before submitting.');
      return;
    }

    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          ratings,
          feedback,
          submittedAt: new Date()
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else if (response.status === 409) {
        setAlreadySubmitted(true);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const handleClose = () => {
    setRatings({
      q1: 0, q2: 0, q3: 0, q4: 0, q5: 0,
      q6: 0, q7: 0, q8: 0, q9: 0, q10: 0
    });
    setFeedback('');
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  if (alreadySubmitted) {
    return (
      <div className="feedback-overlay" onClick={handleClose}>
        <div className="feedback-modal feedback-success" onClick={(e) => e.stopPropagation()}>
          <div className="success-content">
            <div className="success-icon">ℹ</div>
            <h2>Already Submitted</h2>
            <p>You have already submitted your feedback. Thank you!</p>
            <button onClick={handleClose} className="close-btn">Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="feedback-overlay" onClick={handleClose}>
        <div className="feedback-modal feedback-success" onClick={(e) => e.stopPropagation()}>
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h2>Thank You!</h2>
            <p>Your feedback has been submitted successfully.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-overlay" onClick={handleClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-header">
          <h2>Research System Feedback</h2>
          <button className="feedback-close" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-intro">
            <p>Please rate your experience with our research system. All questions are required.</p>
          </div>

          <div className="feedback-questions">
            {questions.map((question, index) => (
              <div key={question.id} className={`feedback-question ${errors[question.id] ? 'error' : ''}`}>
                <div className="question-number">{index + 1}</div>
                <div className="question-content">
                  <label className="question-text">{question.text}</label>
                  <p className="question-subtitle">{question.subtitle}</p>
                  
                  <div className="rating-options">
                    {[1, 2, 3, 4, 5].map(value => (
                      <label key={value} className={`rating-option ${ratings[question.id] === value ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name={question.id}
                          value={value}
                          checked={ratings[question.id] === value}
                          onChange={() => handleRatingChange(question.id, value)}
                        />
                        <span className="rating-circle">{value}</span>
                      </label>
                    ))}
                  </div>
                  {errors[question.id] && (
                    <span className="error-message">Please select a rating</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="feedback-textarea-section">
            <label className="textarea-label">
              Additional Comments or Suggestions (Optional)
            </label>
            <textarea
              className="feedback-textarea"
              placeholder="Share your thoughts, suggestions, or any specific issues you encountered..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
            />
          </div>

          <div className="feedback-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
