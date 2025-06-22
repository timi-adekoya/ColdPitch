
import React from 'react';

interface IconProps {
  className?: string;
}

export const BotIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      aria-hidden="true"
    >
      <path fillRule="evenodd" d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3.375a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75zm0 3.75a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75zm0 3.75a.75.75 0 000 1.5h3.75a.75.75 0 000-1.5h-3.75z" clipRule="evenodd" />
      <path d="M21.75 12a9.716 9.716 0 01-3.065 7.097A9.716 9.716 0 0112 21.75a9.716 9.716 0 01-6.685-2.653A9.723 9.723 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75z" opacity="0" /> {/* This is to match UserIcon structure slightly if needed, but primarily using the robot shape */}
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="14" cy="10" r="1.5" />
      <path d="M9.5 14.5 h5 q0 1 -2.5 1 t-2.5 -1 z" fill="currentColor" transform="translate(0, 0.5)"/>
    </svg>
  );
};
