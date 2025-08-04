import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import UnifiedChatPage from './pages/UnifiedChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/chat" element={<UnifiedChatPage />} />
        
        {/* Legacy route redirects for backward compatibility */}
        <Route path="/chat1" element={<Navigate to="/chat" replace />} />
        <Route path="/chat2" element={<Navigate to="/chat" replace />} />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;