import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSessions, deleteSession } from '../services/api';
import Modal from './Modal';
import './SessionList.css';

const SessionList = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSessions: 0
  });
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, chatId: null });

  useEffect(() => {
    fetchSessions(1);
  }, []);

  const fetchSessions = async (page) => {
    setLoading(true);
    try {
      const response = await getAllSessions(page, 10);
      
      if (response.success) {
        setSessions(response.data.sessions);
        setPagination(response.data.pagination);
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchSessions(newPage);
  };

  const handleDeleteSession = async (chatId, e) => {
    e.stopPropagation(); // Prevent card click
    setConfirmModal({ isOpen: true, chatId });
  };

  const executeDelete = async () => {
    const chatId = confirmModal.chatId;
    setConfirmModal({ isOpen: false, chatId: null });
    
    try {
      await deleteSession(chatId);
      // Refresh the current page
      fetchSessions(pagination.currentPage);
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: 'Delete Failed',
        message: `Failed to delete session: ${err.message}`,
        type: 'error'
      });
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="session-list-loading">
        <div className="spinner-large"></div>
        <p>Loading sessions...</p>
      </div>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <div className="session-list-error">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={() => fetchSessions(1)}>Retry</button>
      </div>
    );
  }

  return (
    <div className="session-list-container">
      <nav className="simple-navbar">
        <div className="navbar-logo">Researcher</div>
        <button className="navbar-btn navbar-btn-back" onClick={() => navigate('/')}>
          Back
        </button>
      </nav>
      <div className="session-list-header">
        <h2>📚 All Research Sessions</h2>
        <div className="session-count">
          Total: {pagination.totalSessions} sessions
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="no-sessions">
          <h3>No sessions found</h3>
          <p>Start a new research session to get started!</p>
        </div>
      ) : (
        <>
          <div className="sessions-grid">
            {sessions.map((session) => (
              <SessionCard
                key={session.chatId}
                session={session}
                onSelect={(chatId) => navigate(`/research/${chatId}`)}
                onDelete={(chatId, e) => handleDeleteSession(chatId, e)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="pagination-button"
              >
                ← Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="pagination-button"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Alert Modal */}
      <Modal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText="OK"
      />

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, chatId: null })}
        title="Delete Research Session"
        message="Are you sure you want to delete this research session? This action cannot be undone."
        type="confirm"
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={executeDelete}
      />
    </div>
  );
};

const SessionCard = ({ session, onSelect, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#38a169';
      case 'processing': return '#3182ce';
      case 'failed': return '#e53e3e';
      default: return '#718096';
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="session-card" onClick={() => onSelect(session.chatId)}>
      <div className="session-card-header">
        <span 
          className="session-status-dot"
          style={{ backgroundColor: getStatusColor(session.overallStatus) }}
        ></span>
        <span className="session-phase">Phase {session.currentPhase}</span>
        <button
          className="delete-session-button"
          onClick={(e) => onDelete(session.chatId, e)}
          title="Delete session"
        >
          🗑️
        </button>
      </div>

      <div className="session-content">
        <p className="session-input">
          {truncateText(session.originalInput, 150)}
        </p>
      </div>

      <div className="session-footer">
        <div className="session-meta">
          <span>🕒 {new Date(session.createdAt).toLocaleDateString()}</span>
          <span className="session-progress">{session.progress}%</span>
        </div>
        <button className="view-button">
          View Details →
        </button>
      </div>
    </div>
  );
};

export default SessionList;
