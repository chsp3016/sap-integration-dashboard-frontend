export const formatters = {
    // Number formatting
    number: (value, decimals = 0) => {
      if (value === null || value === undefined) return 'N/A';
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    },
  
    // Percentage formatting
    percentage: (value, decimals = 1) => {
      if (value === null || value === undefined) return 'N/A';
      return `${formatters.number(value, decimals)}%`;
    },
  
    // Currency formatting
    currency: (value, currency = 'USD') => {
      if (value === null || value === undefined) return 'N/A';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(value);
    },
  
    // Date formatting
    date: (date, options = {}) => {
      if (!date) return 'N/A';
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
    },
  
    // Relative time formatting
    relativeTime: (date) => {
      if (!date) return 'N/A';
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diff = now - dateObj;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
  
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      return 'Just now';
    },
  
    // File size formatting
    fileSize: (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
  
    // Duration formatting (milliseconds to human readable)
    duration: (milliseconds) => {
      if (!milliseconds) return 'N/A';
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
  
      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
      return `${seconds}s`;
    },
  
    // Truncate text
    truncate: (text, maxLength = 50) => {
      if (!text || text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
  
    // Capitalize first letter
    capitalize: (text) => {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
  
    // Convert camelCase to Title Case
    camelToTitle: (text) => {
      if (!text) return '';
      return text
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    },
  };