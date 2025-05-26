// Storage utility that works in both browser and artifact environments
// Note: In Claude.ai artifacts, localStorage is not available, so we use in-memory storage

// In-memory storage fallback for environments where localStorage is not available
let memoryStorage = {};

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// Get the appropriate storage mechanism
const getStorage = () => {
  if (isLocalStorageAvailable()) {
    return {
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => window.localStorage.setItem(key, value),
      removeItem: (key) => window.localStorage.removeItem(key),
      clear: () => window.localStorage.clear(),
      get length() { return window.localStorage.length; },
      key: (index) => window.localStorage.key(index),
      getAllKeys: () => Object.keys(window.localStorage)
    };
  }
  
  // Fallback to in-memory storage
  return {
    getItem: (key) => memoryStorage[key] || null,
    setItem: (key, value) => { memoryStorage[key] = value; },
    removeItem: (key) => { delete memoryStorage[key]; },
    clear: () => { memoryStorage = {}; },
    get length() { return Object.keys(memoryStorage).length; },
    key: (index) => Object.keys(memoryStorage)[index] || null,
    getAllKeys: () => Object.keys(memoryStorage)
  };
};

export const storage = {
  // Get item from storage with JSON parsing
  get: (key, defaultValue = null) => {
    try {
      const storageImpl = getStorage();
      const item = storageImpl.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      return defaultValue;
    }
  },

  // Set item to storage with JSON stringification
  set: (key, value) => {
    try {
      const storageImpl = getStorage();
      storageImpl.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error);
      return false;
    }
  },

  // Remove item from storage
  remove: (key) => {
    try {
      const storageImpl = getStorage();
      storageImpl.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from storage (${key}):`, error);
      return false;
    }
  },

  // Clear all storage
  clear: () => {
    try {
      const storageImpl = getStorage();
      storageImpl.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  // Get available storage size
  getStorageSize: () => {
    try {
      const storageImpl = getStorage();
      let total = 0;
      
      // Use Object.prototype.hasOwnProperty.call() to avoid ESLint error
      const keys = storageImpl.getAllKeys();
      for (const key of keys) {
        const value = storageImpl.getItem(key);
        if (value !== null) {
          total += value.length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  },

  // Check if a key exists in storage
  has: (key) => {
    try {
      const storageImpl = getStorage();
      return storageImpl.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking storage key (${key}):`, error);
      return false;
    }
  },

  // Get all keys from storage
  keys: () => {
    try {
      const storageImpl = getStorage();
      return storageImpl.getAllKeys();
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  },

  // Get all items from storage
  getAll: () => {
    try {
      const storageImpl = getStorage();
      const result = {};
      const keys = storageImpl.getAllKeys();
      
      for (const key of keys) {
        result[key] = storage.get(key);
      }
      return result;
    } catch (error) {
      console.error('Error getting all storage items:', error);
      return {};
    }
  },

  // Set multiple items at once
  setMultiple: (items) => {
    try {
      let success = true;
      for (const [key, value] of Object.entries(items)) {
        if (!storage.set(key, value)) {
          success = false;
        }
      }
      return success;
    } catch (error) {
      console.error('Error setting multiple storage items:', error);
      return false;
    }
  },

  // Get storage type being used
  getStorageType: () => {
    return isLocalStorageAvailable() ? 'localStorage' : 'memory';
  },

  // Check if storage is available
  isAvailable: () => {
    return isLocalStorageAvailable() || true; // Memory storage is always available
  },

  // Get storage quota information (for localStorage only)
  getQuota: async () => {
    if (!isLocalStorageAvailable()) {
      return { total: Infinity, used: 0, available: Infinity };
    }

    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          total: estimate.quota || 0,
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0)
        };
      }
    } catch (error) {
      console.error('Error getting storage quota:', error);
    }

    // Fallback estimation
    const used = storage.getStorageSize();
    return {
      total: 5 * 1024 * 1024, // Assume 5MB default localStorage limit
      used,
      available: (5 * 1024 * 1024) - used
    };
  },

  // Backup storage to JSON
  backup: () => {
    try {
      const data = storage.getAll();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error creating storage backup:', error);
      return null;
    }
  },

  // Restore storage from JSON backup
  restore: (backupData) => {
    try {
      const data = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
      return storage.setMultiple(data);
    } catch (error) {
      console.error('Error restoring storage backup:', error);
      return false;
    }
  }
};

// Export storage type info
export const storageInfo = {
  type: storage.getStorageType(),
  isAvailable: storage.isAvailable(),
  isPersistent: isLocalStorageAvailable()
};