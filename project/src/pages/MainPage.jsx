import React from 'react';
import { useNavigate } from 'react-router-dom';
import SupportButton from '../components/SupportButton';

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screenflex items-center justify-center">
      
      <SupportButton />
    </div>
  );
};

export default MainPage;