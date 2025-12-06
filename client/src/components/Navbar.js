import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import InfoModal from './InfoModal';
import FeedbackModal from './FeedbackModal';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const showBackButton = location.pathname !== '/';

  const closeSidebar = () => setShowSidebar(false);

  const handleHamburgerClick = () => {
    setShowSidebar(true);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">Researcher</div>
        
        <div className="navbar-buttons navbar-desktop">
          {showBackButton && (
            <button className="navbar-btn navbar-btn-back" onClick={() => navigate('/')}>
              Back
            </button>
          )}
          <button className="navbar-btn navbar-btn-info" onClick={() => setShowInfo(true)}>
            Info
          </button>
          {isAuthenticated && (
            <button className="navbar-btn navbar-btn-feedback" onClick={() => setShowFeedback(true)}>
              Feedback
            </button>
          )}

          {isAuthenticated ? (
            <>
              <div className="navbar-user-info">
                <span className="navbar-username">
                  {user?.firstName} {user?.surname}
                </span>
              </div>
              <button className="navbar-btn navbar-btn-logout" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="navbar-btn navbar-btn-secondary" onClick={() => setShowLogin(true)}>
                Login
              </button>
              <button className="navbar-btn navbar-btn-primary" onClick={() => setShowSignup(true)}>
                Sign Up
              </button>
            </>
          )}
        </div>

        <button className="hamburger-menu" onClick={handleHamburgerClick}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Sidebar Overlay */}
      {showSidebar && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${showSidebar ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button className="sidebar-close" onClick={closeSidebar}>×</button>
        </div>
        <div className="sidebar-content">
          {showBackButton && (
            <button className="sidebar-btn" onClick={() => { navigate('/'); closeSidebar(); }}>
              <span>🏠</span> Back to Home
            </button>
          )}
          <button className="sidebar-btn" onClick={() => { setShowInfo(true); closeSidebar(); }}>
            <span>ℹ️</span> Info
          </button>
          {isAuthenticated && (
            <button className="sidebar-btn" onClick={() => { setShowFeedback(true); closeSidebar(); }}>
              <span>💬</span> Feedback
            </button>
          )}
          {isAuthenticated ? (
            <>
              <div className="sidebar-user-info">
                <span>👤</span>
                <span>{user?.firstName} {user?.surname}</span>
              </div>
              <button className="sidebar-btn sidebar-logout" onClick={() => { logout(); closeSidebar(); }}>
                <span>🚪</span> Logout
              </button>
            </>
          ) : (
            <>
              <button className="sidebar-btn" onClick={() => { setShowLogin(true); closeSidebar(); }}>
                <span>🔑</span> Login
              </button>
              <button className="sidebar-btn" onClick={() => { setShowSignup(true); closeSidebar(); }}>
                <span>✨</span> Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }} />}
      {showSignup && <SignupModal onClose={() => setShowSignup(false)} onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }} />}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
      {showFeedback && <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />}
    </>
  );
};

export default Navbar;
