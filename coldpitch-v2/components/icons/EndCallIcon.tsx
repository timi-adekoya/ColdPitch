import React from 'react';

interface IconProps {
  className?: string;
}

export const EndCallIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="currentColor" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="white" // Assuming white stroke on solid fill
        className={className}
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.276 5.392A1 1 0 0112.25 6.366V9.75a.75.75 0 001.5 0V6.366a1 1 0 01.974-.974h.023a1 1 0 01.83 1.54l-1.996 4.793a1 1 0 01-.83 1.54h-.023a1 1 0 01-.974-.974V9.332a1 1 0 00-1.664-.75l-2.775 1.604a1 1 0 01-1.226 0l-2.775-1.604a1 1 0 00-1.664.75v3.026a1 1 0 01-.974.974h-.023a1 1 0 01-.83-1.54l1.996-4.793A1 1 0 018.977 5.392h.023a1 1 0 01.974.974v.001c0 .414.218.79.558.974l1.744.954zM12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z" />
    </svg>
  );
};
