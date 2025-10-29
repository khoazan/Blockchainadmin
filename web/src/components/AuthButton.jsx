// src/components/AuthButton.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthButton = () => {
  const navigate = useNavigate();
  const handleAuthClick = () => {
    navigate('/login'); 
  };

  return (
    <button
      onClick={handleAuthClick}
      className="
        flex items-center space-x-2 
        bg-white text-blue-800 
        font-semibold py-2 px-4 
        rounded-full shadow-lg 
        border border-gray-200 
        hover:bg-blue-50 
        transition duration-200
      "
    >
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
      <span>Đăng nhập/ Đăng ký</span>
    </button>
  );
};

export default AuthButton;