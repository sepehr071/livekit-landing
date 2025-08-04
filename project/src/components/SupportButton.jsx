import React, { useEffect, useState } from 'react';
import RiveAvatarButton from './RiveAvatarButton';
import { useNavigate } from 'react-router-dom';

const SupportButton = () => {

 
  
  return (
    <RiveAvatarButton
      className={`animated-border fixed bottom-6 right-6 w-28 h-28 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-[400ms] z-50`}
    />
  );
};

export default SupportButton;
