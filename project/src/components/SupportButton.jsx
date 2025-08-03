import React, { useEffect, useState } from 'react';
import RiveAvatarButton from './RiveAvatarButton';
import { useNavigate } from 'react-router-dom';

const SupportButton = () => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsHidden(false);
    }, 150);
    
  }, []);

  const handleClick = () => {
    setIsHidden(true);
    // Give a small delay for the animation to play before navigating
    setTimeout(() => {
      navigate('/chat1');
    }, 400); // Adjust delay as needed, should be less than or equal to CSS transition duration
  };
  
  return (
    <RiveAvatarButton
      onClick={handleClick}
      style={isHidden ? { transform: 'translateX(6rem)' } : {}}
      className={`animated-border fixed bottom-6 right-6 w-28 h-28 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-[400ms] z-50`}
    />
  );
};

export default SupportButton;
