import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage';
import UnifiedChatPage from './pages/UnifiedChatPage';

// Component to handle redirects with parameter preservation
const RedirectWithParams = ({ to }) => {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/chat" element={<UnifiedChatPage />} />
        
        {/* Legacy route redirects with parameter preservation */}
        <Route path="/chat1" element={<RedirectWithParams to="/chat" />} />
        <Route path="/chat2" element={<RedirectWithParams to="/chat" />} />
        
        {/* Redirect any unknown routes to home with parameters */}
        <Route path="*" element={<RedirectWithParams to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;