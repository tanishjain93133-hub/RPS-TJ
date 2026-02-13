
import React from 'react';
import { Choice } from '../types';

interface HandIconProps {
  choice: Choice;
  isAnimating: boolean;
  side: 'left' | 'right';
  className?: string;
}

const HandIcon: React.FC<HandIconProps> = ({ choice, isAnimating, side, className = "" }) => {
  // During animation, always show "rock" (closed fist) as it shakes
  const activeChoice = isAnimating ? 'rock' : (choice || 'rock');
  
  const getIcon = () => {
    switch (activeChoice) {
      case 'rock':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M18 11V6a2 2 0 00-2-2v0a2 2 0 00-2 2v0M14 10V4a2 2 0 00-2-2v0a2 2 0 00-2 2v0M10 10.5V6a2 2 0 00-2-2v0a2 2 0 00-2 2v0M18 8a2 2 0 114 0v6a8 8 0 01-8 8h-2c-2.8 0-4.5-1.2-5-3l-1.4-5" />
          </svg>
        );
      case 'paper':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M18 11V6a2 2 0 00-2-2v0a2 2 0 00-2 2v0M14 10V4a2 2 0 00-2-2v0a2 2 0 00-2 2v0M10 10.5V6a2 2 0 00-2-2v0a2 2 0 00-2 2v0M6 10V8a2 2 0 10-4 0v10a7 7 0 007 7h1a8 8 0 008-8v-2a2 2 0 00-2-2v0a2 2 0 00-2 2" />
          </svg>
        );
      case 'scissors':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M6 15L18 9M6 9L18 15M8 6h2v2H8V6zm6 10h2v2h-2v-2z" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="6" cy="6" r="3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`
      relative w-32 h-32 md:w-48 md:h-48 transition-all duration-500
      ${side === 'right' ? '-scale-x-100' : ''}
      ${isAnimating ? 'animate-shake' : ''}
      ${className}
    `}>
      {getIcon()}
    </div>
  );
};

export default HandIcon;
