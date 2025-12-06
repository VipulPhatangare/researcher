import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initiateResearch } from '../services/api';
import './NewResearch.css';

const NewResearch = () => {
  const navigate = useNavigate();
  const [problemStatement, setProblemStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const text = e.target.value;
    setProblemStatement(text);
    const words = text.trim().split(/\s+/).filter(w => w).length;
    setWordCount(words);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (wordCount < 30) {
      setError(`Please enter at least 30 words. Current: ${wordCount} words`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await initiateResearch(problemStatement);
      if (response.success) {
        // Navigate to research workspace with chatId
        navigate(`/research/${response.data.chatId}`);
      } else {
        setError(response.error || 'Failed to initiate research');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-research-container">
      <nav className="simple-navbar">
        <div className="navbar-logo">Researcher</div>
        <button className="navbar-btn navbar-btn-back" onClick={() => navigate('/')}>
          Back
        </button>
      </nav>
      <div className="new-research-content">
        <div className="research-header">
          <h1>🎯 Start New Research</h1>
          <p className="research-subtitle">
            Describe your research problem in detail (minimum 30 words)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="research-form">
          <div className="form-group">
            <label htmlFor="problemStatement">
              Research Problem Statement
            </label>
            <textarea
              id="problemStatement"
              value={problemStatement}
              onChange={handleInputChange}
              placeholder="Enter your research problem or question here. Be as detailed as possible. For example: 'I want to build a recommendation system for an e-commerce platform that can suggest products based on user behavior, purchase history, and browsing patterns...'"
              rows="12"
              disabled={isSubmitting}
              className={error ? 'error' : ''}
            />
            
            <div className="form-meta">
              <span className={`word-count ${wordCount >= 30 ? 'valid' : 'invalid'}`}>
                {wordCount} / 30 words {wordCount >= 30 ? '✓' : ''}
              </span>
              {error && <span className="error-message">{error}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || wordCount < 30}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Initializing Research...
                </>
              ) : (
                <>
                  Start Research Journey →
                </>
              )}
            </button>
          </div>
        </form>

        <div className="research-info">
          <h3>📋 What happens next?</h3>
          <div className="info-steps">
            <div className="info-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Problem Enhancement</h4>
                <p>AI will refine and enhance your problem statement</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Research Discovery</h4>
                <p>Find relevant research papers and resources</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Deep Analysis</h4>
                <p>Comprehensive analysis of methodologies and approaches</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">4-6</span>
              <div className="step-content">
                <h4>Solution Development</h4>
                <p>Generate insights, recommendations, and final solution</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewResearch;
