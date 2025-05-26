// SAP Integration Suite deployment statuses
const DEPLOYMENT_STATUSES = {
  STARTED: 'STARTED',
  DEPLOYED: 'DEPLOYED',
  STOPPED: 'STOPPED',
  UNDEPLOYED: 'UNDEPLOYED',
  STARTING: 'STARTING',
  STOPPING: 'STOPPING',
  ERROR: 'ERROR',
  FAILED: 'FAILED',
  UNKNOWN: 'UNKNOWN'
};

export const helpers = {
  // Deep clone object
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Generate unique ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Get nested object property safely
  get: (obj, path, defaultValue = undefined) => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  },

  // Download file
  downloadFile: (data, filename, type = 'application/json') => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Copy to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  },

  // Get color for status
  getStatusColor: (status) => {
    const statusColors = {
      [DEPLOYMENT_STATUSES.STARTED]: 'green',
      [DEPLOYMENT_STATUSES.DEPLOYED]: 'green',
      [DEPLOYMENT_STATUSES.STOPPED]: 'gray',
      [DEPLOYMENT_STATUSES.UNDEPLOYED]: 'gray',
      [DEPLOYMENT_STATUSES.STARTING]: 'yellow',
      [DEPLOYMENT_STATUSES.STOPPING]: 'yellow',
      [DEPLOYMENT_STATUSES.ERROR]: 'red',
      [DEPLOYMENT_STATUSES.FAILED]: 'red',
      [DEPLOYMENT_STATUSES.UNKNOWN]: 'gray',
    };
    return statusColors[status] || 'gray';
  },

  // Sort array of objects by property
  sortBy: (array, property, direction = 'asc') => {
    return [...array].sort((a, b) => {
      const valueA = helpers.get(a, property);
      const valueB = helpers.get(b, property);
      
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Group array by property
  groupBy: (array, property) => {
    return array.reduce((groups, item) => {
      const key = helpers.get(item, property);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  },

  // Format bytes to human readable format
  formatBytes: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  // Format duration in milliseconds to human readable format
  formatDuration: (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate URL format
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime: (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  },

  // Truncate text with ellipsis
  truncate: (text, maxLength, suffix = '...') => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
  },

  // Check if object is empty
  isEmpty: (obj) => {
    if (obj == null) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    if (typeof obj === 'string') return obj.trim().length === 0;
    return false;
  },

  // Retry function with exponential backoff
  retry: async (fn, maxAttempts = 3, baseDelay = 1000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  // Create URL with query parameters
  createUrl: (baseUrl, params = {}) => {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });
    return url.toString();
  },

  // Parse query string to object
  parseQueryString: (queryString) => {
    const params = {};
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams) {
      params[key] = value;
    }
    return params;
  }
};

// Export constants as well
export { DEPLOYMENT_STATUSES };