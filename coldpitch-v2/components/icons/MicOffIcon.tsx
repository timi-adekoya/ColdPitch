import React from 'react';

interface IconProps {
  className?: string;
}

export const MicOffIcon: React.FC<IconProps> = ({ className }) => {
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5V21m-3.75 0h7.5M12 15c.621 0 1.17-.038 1.703-.107V6.75A4.505 4.505 0 0012 4.5c-2.485 0-4.5 2.015-4.5 4.5v3.643c.533.07 1.082.107 1.703.107zm0 0L9.25 9.75M12 15l2.75-2.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
  );
};
