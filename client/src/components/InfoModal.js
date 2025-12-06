import React from 'react';
import './Modal.css';

const InfoModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">About Researcher</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="info-content">
            <p>
              <strong>Researcher</strong> is an intelligent AI-powered research platform designed to streamline 
              and enhance your academic research journey. Our system guides you through a comprehensive 
              6-phase research process, transforming your initial problem statement into actionable insights.
            </p>

            <h3>Research Phases</h3>
            <ul className="phase-list">
              <li>
                <strong>Phase 1: Problem Understanding & Subtopics (10% Complete)</strong>
                Analyzes your problem statement and generates relevant subtopics to explore, helping you 
                understand the scope and dimensions of your research area.
              </li>

              <li>
                <strong>Phase 2: Problem Refinement (25% Complete)</strong>
                Refines your problem statement with expert-level clarity, creates a vector embedding for 
                semantic search, and provides structured research direction.
              </li>

              <li>
                <strong>Phase 3: Literature Discovery (55% Complete)</strong>
                Searches and retrieves relevant research papers from academic databases, providing you 
                with a curated collection of scholarly resources directly related to your refined problem.
              </li>

              <li>
                <strong>Phase 4: Research Gap Analysis (70% Complete)</strong>
                Identifies gaps in existing research by analyzing methodologies, technologies, and datasets. 
                Highlights opportunities for novel contributions in your field.
              </li>

              <li>
                <strong>Phase 5: Existing Solutions (85% Complete)</strong>
                Explores current solutions and approaches in your research domain, helping you understand 
                what has been tried and what remains unexplored.
              </li>

              <li>
                <strong>Phase 6: Future Scope & Recommendations (100% Complete)</strong>
                Provides strategic recommendations for future research directions, potential applications, 
                and areas that warrant further investigation based on identified gaps.
              </li>
            </ul>

            <h3>Research Chat Assistant</h3>
            <p>
              After completing the 6 phases, you can use our <strong>Research Chat</strong> feature to:
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '2rem', marginBottom: '1rem' }}>
              <li>Ask follow-up questions about your research findings</li>
              <li>Request clarifications on specific methodologies or datasets</li>
              <li>Explore alternative approaches and perspectives</li>
              <li>Dive deeper into particular aspects of your research</li>
              <li>Maintain multiple chat sessions for different topics</li>
            </ul>

            <p>
              Each chat session is preserved in your browser, allowing you to revisit previous conversations 
              and continue your research exploration anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
