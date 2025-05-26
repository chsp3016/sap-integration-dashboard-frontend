import React, { useState } from 'react';

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && content && (
        <div className={`
          absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded-md shadow-lg
          whitespace-nowrap transition-opacity duration-200 ${positions[position]}
        `}>
          {content}
          
          {/* Arrow */}
          <div className={`
            absolute w-2 h-2 bg-gray-900 transform rotate-45
            ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' : ''}
            ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' : ''}
            ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' : ''}
            ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-1' : ''}
          `} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;