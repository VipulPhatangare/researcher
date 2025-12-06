import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';
import Navbar from './Navbar';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <div className="landing-container">
        <div className="landing-content">
          {!isAuthenticated ? (
            <div className="landing-header">
              <h1>Researcher</h1>
              <p className="landing-subtitle">
                Your intelligent companion for comprehensive research and solution discovery
              </p>
              <p className="landing-subtitle-secondary">
                Please login or sign up to start your research journey
              </p>
            </div>
          ) : (
            <>
              <div className="landing-header">
                <h1>Researcher</h1>
                <p className="landing-subtitle">
                  Your intelligent companion for comprehensive research and solution discovery
                </p>
              </div>

              <div className="landing-options">
                <div 
                  className="landing-card new-research"
                  onClick={() => navigate('/new-research')}
                >
                  <div className="card-icon">✨</div>
                  <h2>Start New Research</h2>
                  <p>Begin a fresh research journey with AI-powered analysis</p>
                  <button className="card-button primary">Get Started</button>
                </div>

                <div 
                  className="landing-card previous-research"
                  onClick={() => navigate('/sessions')}
                >
                  <div className="card-icon">📚</div>
                  <h2>Previous Research</h2>
                  <p>View and continue your past research sessions</p>
                  <button className="card-button secondary">View Sessions</button>
                </div>
              </div>
            </>
          )}

          <div className="landing-features">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>6-Phase Analysis</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span>AI-Powered Insights</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Comprehensive Reports</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
