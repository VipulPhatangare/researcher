import React, { useState } from 'react';
import { initiateResearch } from '../services/api';
import './ResearchForm.css';

const ResearchForm = ({ onResearchInitiated }) => {
  const [problemStatement, setProblemStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wordCount, setWordCount] = useState(0);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setProblemStatement(text);
    
    // Calculate word count
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate word count
    if (wordCount < 30) {
      setError(`Problem statement must be at least 30 words. Current: ${wordCount} words`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await initiateResearch(problemStatement);
      
      if (response.success) {
        onResearchInitiated(response.data.chatId);
        setProblemStatement('');
        setWordCount(0);
      } else {
        setError(response.error || 'Failed to initiate research');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while initiating research');
    } finally {
      setLoading(false);
    }
  };

  const isValid = wordCount >= 30;

  return (
    <div className="research-form-container">
      <div className="research-form-card">
        <h2>🚀 Start Your Research Journey</h2>
        <p className="form-description">
          Describe your research problem in detail. Our AI will enhance your prompt and 
          guide you through multiple research phases.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="problemStatement">
              Research Problem Statement
              <span className="required">*</span>
            </label>
            <textarea
              id="problemStatement"
              value={problemStatement}
              onChange={handleInputChange}
              placeholder="Example: I want to explore how artificial intelligence can be applied to improve early disease detection in healthcare settings, specifically focusing on machine learning algorithms that can analyze medical imaging data to identify patterns that human experts might miss..."
              rows="8"
              disabled={loading}
            />
            
            <div className="word-count-container">
              <span className={`word-count ${isValid ? 'valid' : 'invalid'}`}>
                {wordCount} / 30 words minimum
              </span>
              {isValid && <span className="checkmark">✓</span>}
            </div>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || !isValid}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              <>
                🔬 Initiate Research
              </>
            )}
          </button>
        </form>

        <div className="info-box">
          <h3>📋 Phase 1: Prompt Enhancement</h3>
          <ul>
            <li>Your problem statement will be analyzed by AI</li>
            <li>An enhanced, optimized prompt will be generated</li>
            <li>The system will prepare for subsequent research phases</li>
            <li>Estimated time: 30-60 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResearchForm;
