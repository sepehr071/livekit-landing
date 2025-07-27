import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ChatPage1 from './pages/ChatPage1';
import ChatPage2 from './pages/ChatPage2';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/chat1" element={<ChatPage1 />} />
        <Route path="/chat2" element={<ChatPage2 />} />
      </Routes>
    </Router>
  );
}

export default App;