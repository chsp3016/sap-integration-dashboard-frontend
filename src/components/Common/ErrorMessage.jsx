import React from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import PropTypes from 'prop-types';


const ErrorMessage = ({ 
  message, 
  onDismiss, 
  onRetry,
  type = 'error',
  title,
  className = '' 
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'text-yellow-600 hover:text-yellow-800'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'text-blue-600 hover:text-blue-800'
        };
      default: // error
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'text-red-600 hover:text-red-800'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`rounded-md border p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          <div className={`${title ? 'mt-2' : ''} text-sm ${styles.message}`}>
            {message}
          </div>
          
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className={`inline-flex items-center text-sm font-medium ${styles.button} transition-colors`}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Try Again
              </button>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 ${styles.button} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onDismiss: PropTypes.func,
  onRetry: PropTypes.func,
  type: PropTypes.oneOf(['error', 'warning', 'info']),
  title: PropTypes.string,
  className: PropTypes.string,
};
export default ErrorMessage;