export const API_ENDPOINTS = {
    // Health check
    HEALTH: '/api/health',
    
    // Dashboard endpoints
    DASHBOARD: {
      OVERVIEW: '/api/dashboard/overview',
      METRICS: '/api/dashboard/metrics',
      SYNC_STATUS: '/api/sync/status',
      TRIGGER_SYNC: '/api/sync',
    },
    
    // iFlow endpoints
    IFLOWS: {
      LIST: '/api/iflows',
      DETAILS: (id) => `/api/iflows/${id}`,
      METRICS: '/api/iflows/metrics/summary',
      SEARCH: '/api/iflows/search',
    },
    
    // Package endpoints
    PACKAGES: {
      LIST: '/api/packages',
      DETAILS: (id) => `/api/packages/${id}`,
      METRICS: (id) => `/api/packages/${id}/metrics`,
    },
    
    // Chat/NLP endpoints
    CHAT: {
      QUERY: '/api/nlp/query',
      CAPABILITIES: '/api/nlp/capabilities',
      FALLBACK: '/api/chat/query',
    },
    
    // Authentication endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      PROFILE: '/api/auth/profile',
    },
  };