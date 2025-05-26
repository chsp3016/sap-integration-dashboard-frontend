export const validators = {
    // Email validation
    email: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
  
    // URL validation
    url: (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
  
    // Required field validation
    required: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== null && value !== undefined;
    },
  
    // Minimum length validation
    minLength: (value, min) => {
      if (typeof value !== 'string') return false;
      return value.length >= min;
    },
  
    // Maximum length validation
    maxLength: (value, max) => {
      if (typeof value !== 'string') return false;
      return value.length <= max;
    },
  
    // Number range validation
    numberRange: (value, min, max) => {
      const num = parseFloat(value);
      return !isNaN(num) && num >= min && num <= max;
    },
  
    // JSON validation
    json: (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
  };