import React from 'react';
import { Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
  size = 'default', 
  message = 'Loading...', 
  className = '',
  showMessage = true 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} text-blue-600 animate-spin`} 
      />
      {showMessage && (
        <p className={`mt-3 text-gray-600 ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  );
};

// PropTypes definition - placed after the component definition
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large']),
  message: PropTypes.string,
  className: PropTypes.string,
  showMessage: PropTypes.bool,
};

export default LoadingSpinner;