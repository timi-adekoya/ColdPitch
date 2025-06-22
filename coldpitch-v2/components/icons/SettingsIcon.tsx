import React from 'react';

interface IconProps {
  className?: string;
}

export const SettingsIcon: React.FC<IconProps> = ({ className }) => {
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.116-1.003h2.58c.556 0 1.026.461 1.116 1.003l.07.452c.28.14.547.31.798.51l.404-.19a1.125 1.125 0 011.37.493l1.29 2.234c.345.597.106 1.33-.416 1.666l-.37.226c.03.16.048.324.048.49s-.018.33-.048.49l.37.226c.522.336.76.07.416-1.666l-1.29-2.234a1.125 1.125 0 01-1.37-.493l-.404-.19c-.25.198-.517.368-.798.509l-.07.453c-.09.542-.56 1.003-1.116 1.003h-2.58c-.556 0-1.026-.461-1.116-1.003l-.07-.453c-.28-.14-.547-.31-.798-.51l-.404.19a1.125 1.125 0 01-1.37-.493l-1.29-2.234c-.345-.597-.106-1.33.416-1.666l.37-.226c-.03-.16-.048-.324-.048-.49s.018-.33.048-.49l-.37-.226c-.522-.336-.76-.07-.416 1.666l1.29 2.234a1.125 1.125 0 011.37.493l.404.19c.25-.198.517-.368.798-.509l.07-.453z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
};
