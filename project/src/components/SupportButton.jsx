import React, { useEffect, useState } from 'react';
import { Headphones } from 'lucide-react';
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
    <button
  onClick={handleClick}
  style={isHidden ? { transform: 'translateX(6rem)' } : {}}
  className={`animated-border fixed bottom-6 right-6 w-16 h-16 bg-orange-400 hover:bg-orange-500 hover:scale-110 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-[400ms] z-50`}>
  <Headphones size={30} />
</button>
  );
};

export default SupportButton;
