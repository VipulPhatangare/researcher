import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionStatus, getSessionDetails, retryPhase } from '../services/api';
import PhaseContent from './PhaseContent';
import Modal from './Modal';
import './ResearchWorkspace.css';

const ResearchWorkspace = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [retryingPhase, setRetryingPhase] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumePhase, setResumePhase] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, phaseNumber: null });

  useEffect(() => {
    if (!chatId) {
      navigate('/');
      return;
    }

    fetchSessionData();
    const interval = setInterval(fetchSessionData, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // Check for incomplete phases and show resume modal (only once per session)
  useEffect(() => {
    if (sessionData && sessionData.details && sessionData.details.phases && !loading) {
      const modalShownKey = `resume_modal_shown_${chatId}`;
      const alreadyShown = sessionStorage.getItem(modalShownKey);
      
      if (!alreadyShown) {
        const failedPhase = findFirstFailedPhase();
        if (failedPhase) {
          setResumePhase(failedPhase);
          setShowResumeModal(true);
          sessionStorage.setItem(modalShownKey, 'true');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData, loading]);

  const fetchSessionData = async () => {
    try {
      const [statusRes, detailsRes] = await Promise.all([
        getSessionStatus(chatId),
        getSessionDetails(chatId)
      ]);

      if (statusRes.success && detailsRes.success) {
        setSessionData({
          status: statusRes.data,
          details: detailsRes.data
        });
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const findFirstFailedPhase = () => {
    if (!sessionData?.details?.phases) {
      return null;
    }
    
    const phases = sessionData.details.phases;
    
    for (let i = 1; i <= 6; i++) {
      const phaseKey = `phase${i}`;
      const phaseData = phases[phaseKey];
      const phaseStatus = phaseData?.status;
      const startedAt = phaseData?.startedAt;
      
      // If phase explicitly failed
      if (phaseStatus === 'failed') {
        return i;
      }
      
      // If phase is stuck in "processing" for too long (more than 20 minutes)
      if (phaseStatus === 'processing' && startedAt) {
        const startTime = new Date(startedAt).getTime();
        const currentTime = new Date().getTime();
        const minutesElapsed = (currentTime - startTime) / (1000 * 60);
        
        // Phase stuck for more than 20 minutes
        if (minutesElapsed > 20) {
          return i;
        }
      }
      
      // If previous phase completed but current phase never started (stuck)
      if (i > 1) {
        const prevPhaseKey = `phase${i - 1}`;
        const prevPhaseStatus = phases[prevPhaseKey]?.status;
        if (prevPhaseStatus === 'completed' && phaseStatus === 'pending') {
          return i;
        }
      }
    }
    
    return null;
  };

  const handleResumeFromPhase = async () => {
    if (!resumePhase) return;
    
    setShowResumeModal(false);
    setRetryingPhase(resumePhase);
    setSelectedPhase(resumePhase);

    // First, mark stale processing phase as failed in backend
    const phaseData = sessionData?.details?.phases?.[`phase${resumePhase}`];
    if (phaseData?.status === 'processing') {
      // The retry will handle marking it properly
    }

    try {
      await retryPhase(chatId, resumePhase, false); // Don't delete existing data
      fetchSessionData();
    } catch (err) {
      setError(`Failed to resume Phase ${resumePhase}: ${err.message}`);
    } finally {
      setRetryingPhase(null);
    }
  };

  const handleDismissModal = () => {
    setShowResumeModal(false);
    setResumePhase(null);
  };

  // Expose function to manually check for failed phases (for testing)
  window.checkFailedPhases = () => {
    const modalShownKey = `resume_modal_shown_${chatId}`;
    sessionStorage.removeItem(modalShownKey);
    const failedPhase = findFirstFailedPhase();
    if (failedPhase) {
      setResumePhase(failedPhase);
      setShowResumeModal(true);
      sessionStorage.setItem(modalShownKey, 'true');
    }
    return failedPhase;
  };

  if (loading) {
    return (
      <div className="workspace-loading">
        <div className="loading-spinner"></div>
        <p>Loading research session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workspace-error">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  if (!sessionData) {
    return null;
  }

  const { status, details } = sessionData;

  const getPhaseStatus = (phaseNum) => {
    const phaseKey = `phase${phaseNum}`;
    return details?.phases?.[phaseKey]?.status || 'pending';
  };

  const canOpenPhase = (phaseNum) => {
    // Phase 7 (Chat) is always clickable
    if (phaseNum === 7) {
      return true;
    }
    
    const phaseStatus = getPhaseStatus(phaseNum);
    return phaseStatus === 'completed' || phaseStatus === 'processing';
  };

  const handlePhaseClick = (phaseNum) => {
    // Phase 7 (Chat) should always open directly without any modal
    if (phaseNum === 7) {
      setSelectedPhase(phaseNum);
      setSidebarOpen(false);
      return;
    }

    const phaseStatus = getPhaseStatus(phaseNum);
    const isAnyPhaseProcessing = [1, 2, 3, 4, 5, 6].some(i => getPhaseStatus(i) === 'processing');
    
    // If phase is failed and no phases are currently processing, offer to restart
    if (phaseStatus === 'failed' && !isAnyPhaseProcessing) {
      setResumePhase(phaseNum);
      setShowResumeModal(true);
      return;
    }
    
    // If phase is pending/failed but previous phase is completed, offer to start it
    if ((phaseStatus === 'pending' || phaseStatus === 'failed') && phaseNum > 1 && !isAnyPhaseProcessing) {
      const prevPhaseStatus = getPhaseStatus(phaseNum - 1);
      if (prevPhaseStatus === 'completed') {
        setResumePhase(phaseNum);
        setShowResumeModal(true);
        return;
      }
    }
    
    if (canOpenPhase(phaseNum)) {
      setSelectedPhase(phaseNum);
      setSidebarOpen(false); // Close sidebar on mobile after selection
    }
  };

  const handleRetryPhase = async (phaseNumber) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Existing Data?',
      message: `Do you want to DELETE existing data for Phase ${phaseNumber}?\n\n• Click "Delete & Restart" to DELETE existing data and start fresh\n• Click "Keep & Merge" to KEEP existing data and merge with new results`,
      onConfirm: (shouldDelete) => executeRetryPhase(phaseNumber, shouldDelete),
      phaseNumber
    });
  };

  const executeRetryPhase = async (phaseNumber, shouldDelete) => {
    setRetryingPhase(phaseNumber);

    try {
      await retryPhase(chatId, phaseNumber, shouldDelete);
      setAlertModal({
        isOpen: true,
        title: 'Retry Initiated',
        message: `Phase ${phaseNumber} retry initiated! The page will update automatically.`,
        type: 'success'
      });
      fetchSessionData(); // Refresh data
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: 'Retry Failed',
        message: `Failed to retry Phase ${phaseNumber}: ${err.message}`,
        type: 'error'
      });
    } finally {
      setRetryingPhase(null);
    }
  };

  const phases = [
    { number: 1, title: 'Prompt Enhancement', icon: '✨', estimatedTime: '30-60s' },
    { number: 2, title: 'Research Discovery', icon: '🔍', estimatedTime: '2-3 min' },
    { number: 3, title: 'Analysis & Synthesis', icon: '📊', estimatedTime: '7-8 min' },
    { number: 4, title: 'Research Analysis', icon: '🧪', estimatedTime: '2-3 min' },
    { number: 5, title: 'Existing Solutions', icon: '🔧', estimatedTime: '2-3 min' },
    { number: 6, title: 'Best Solution', icon: '🏆', estimatedTime: '4-5 min' },
    { number: 7, title: 'Research Chat', icon: '💬', estimatedTime: 'Always Available' }
  ];

  return (
    <div className="research-workspace">
      {/* Resume Modal */}
      {showResumeModal && resumePhase && (
        <div className="modal-overlay">
          <div className="modal-card resume-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {sessionData?.details?.phases?.[`phase${resumePhase}`]?.status === 'processing' 
                  ? '⚠️ Stale Process Detected' 
                  : '⚠️ Incomplete Phase Detected'}
              </h2>
            </div>
            <div className="modal-body">
              <p className="resume-message">
                Phase {resumePhase} ({phases[resumePhase - 1]?.title}) 
                {sessionData?.details?.phases?.[`phase${resumePhase}`]?.status === 'processing' 
                  ? ' was interrupted and is stuck in processing state.'
                  : ' did not complete successfully.'}
              </p>
              <p className="resume-question">
                Would you like to resume from Phase {resumePhase} and continue the research process?
              </p>
              <div className="resume-info">
                <p><strong>What will happen:</strong></p>
                <ul>
                  {sessionData?.details?.phases?.[`phase${resumePhase}`]?.status === 'processing' && (
                    <li>The stale process will be terminated</li>
                  )}
                  <li>Phase {resumePhase} will restart automatically</li>
                  <li>Existing data will be preserved</li>
                  <li>Subsequent phases will be triggered automatically</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="form-button form-button-secondary"
                onClick={handleDismissModal}
              >
                Dismiss
              </button>
              <button 
                className="form-button form-button-primary"
                onClick={handleResumeFromPhase}
              >
                {sessionData?.details?.phases?.[`phase${resumePhase}`]?.status === 'processing'
                  ? 'Terminate & Restart'
                  : 'Resume from Phase ' + resumePhase}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Toggle Button */}
      <button 
        className="sidebar-toggle-btn" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle Sidebar"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Left Sidebar - Phase Navigation */}
      <div className={`workspace-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="home-button" onClick={() => navigate('/')}>
            ← Home
          </button>
        </div>
        <div className="sidebar-title-section">
          <h2>Research Phases</h2>
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${status.progress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">{status.progress}%</text>
            </svg>
          </div>
        </div>

        <div className="phases-list">
          {phases.map((phase) => {
            const phaseStatus = getPhaseStatus(phase.number);
            const isClickable = canOpenPhase(phase.number);
            const isActive = selectedPhase === phase.number;
            
            // Make failed phases clickable if no other phase is processing
            const isAnyPhaseProcessing = [1, 2, 3, 4, 5, 6].some(i => getPhaseStatus(i) === 'processing');
            const isFailedAndClickable = phaseStatus === 'failed' && !isAnyPhaseProcessing;
            const canRetryPhase = isFailedAndClickable || (phase.number > 1 && getPhaseStatus(phase.number - 1) === 'completed' && phaseStatus === 'pending' && !isAnyPhaseProcessing);

            return (
              <div
                key={phase.number}
                className={`phase-item ${phaseStatus} ${isActive ? 'active' : ''} ${!isClickable && !canRetryPhase ? 'locked' : ''}`}
                onClick={() => handlePhaseClick(phase.number)}
                style={{ cursor: (isClickable || canRetryPhase) ? 'pointer' : 'not-allowed' }}
              >
                <div className="phase-item-icon">{phase.icon}</div>
                <div className="phase-item-content">
                  <div className="phase-item-header">
                    <span className="phase-item-number">Phase {phase.number}</span>
                    <span className={`phase-status-badge ${phaseStatus}`}>
                      {phaseStatus === 'completed' && '✓'}
                      {phaseStatus === 'processing' && '⟳'}
                      {phaseStatus === 'failed' && '✗'}
                      {phaseStatus === 'pending' && '🔒'}
                    </span>
                  </div>
                  <h4>{phase.title}</h4>
                  {phaseStatus === 'processing' && (
                    <p className="phase-time-estimate">⏱️ {phase.estimatedTime}</p>
                  )}
                  {isFailedAndClickable && (
                    <p className="phase-retry-hint" style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem' }}>
                      Click to retry
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="workspace-main">
        <div className="workspace-header">
          <div className="session-info">
            <h1>{phases[selectedPhase - 1].title}</h1>
            <div className="session-meta">
              <span className="meta-item">
                <strong>Session ID:</strong> {chatId.slice(0, 8)}...
              </span>
              <span className="meta-item">
                <strong>Status:</strong> <span className={`status-badge ${status.overallStatus}`}>
                  {status.overallStatus}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="workspace-content">
          <PhaseContent
            phaseNumber={selectedPhase}
            sessionData={sessionData}
            chatId={chatId}
            onRetry={handleRetryPhase}
            isRetrying={retryingPhase === selectedPhase}
          />
        </div>
      </div>

      {/* Alert Modal */}
      <Modal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText="OK"
      />

      {/* Confirm Modal for Delete/Keep */}
      {confirmModal.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header modal-confirm">
              <span className="modal-icon">?</span>
              <h3 className="modal-title">{confirmModal.title}</h3>
            </div>
            
            <div className="modal-body">
              <p className="modal-message">{confirmModal.message}</p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-button modal-button-cancel"
                onClick={() => {
                  confirmModal.onConfirm(false);
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
              >
                Keep & Merge
              </button>
              <button 
                className="modal-button modal-button-confirm modal-button-error"
                onClick={() => {
                  confirmModal.onConfirm(true);
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
              >
                Delete & Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchWorkspace;
