import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './components/Landing';
import NewResearch from './components/NewResearch';
import ResearchWorkspace from './components/ResearchWorkspace';
import SessionList from './components/SessionList';
import Footer from './components/Footer';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading...</h2>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/new-research" element={<ProtectedRoute><NewResearch /></ProtectedRoute>} />
      <Route path="/research/:chatId" element={<ProtectedRoute><ResearchWorkspace /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><SessionList /></ProtectedRoute>} />
    </Routes>
  );
}

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith('/research/');

  return (
    <div className="App">
      <AppRoutes />
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
