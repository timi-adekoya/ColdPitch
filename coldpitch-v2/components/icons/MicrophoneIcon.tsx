import React from 'react';

interface IconProps {
  className?: string;
}

export const MicrophoneIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15c.621 0 1.17-.038 1.703-.107V6.75A4.505 4.505 0 0012 4.5c-2.485 0-4.5 2.015-4.5 4.5v3.643c.533.07 1.082.107 1.703.107z" />
    </svg>
  );
};
