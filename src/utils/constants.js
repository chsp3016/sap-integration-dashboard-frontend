// src/utils/constants.js
export const APP_CONFIG = {
  NAME: 'SAP Integration Suite Dashboard',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',  
  BUILD_DATE: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
  ENVIRONMENT: process.env.NODE_ENV || 'development',
};

export const FEATURE_FLAGS = {
  ENABLE_CHAT: process.env.REACT_APP_ENABLE_CHAT === 'true',
  ENABLE_EXPORT: process.env.REACT_APP_ENABLE_EXPORT === 'true',
  ENABLE_PWA: process.env.REACT_APP_ENABLE_PWA === 'true',
  ENABLE_CUSTOM_TILES: process.env.REACT_APP_ENABLE_CUSTOM_TILES === 'true',
  ENABLE_DEBUG: process.env.REACT_APP_DEBUG === 'true',
  ENABLE_REALTIME: process.env.REACT_APP_ENABLE_REALTIME === 'true',
};

export const UI_CONFIG = {
  CHART_REFRESH_INTERVAL: parseInt(process.env.REACT_APP_CHART_REFRESH_INTERVAL) || 300000,
  MAX_CUSTOM_TILES: parseInt(process.env.REACT_APP_MAX_CUSTOM_TILES) || 10,
  DEFAULT_PAGE_SIZE: parseInt(process.env.REACT_APP_DEFAULT_PAGE_SIZE) || 25,
  SESSION_TIMEOUT: parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 60,
};

export const CHART_TYPES = {
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  BAR: 'bar',
  LINE: 'line',
  AREA: 'area',
};

export const DEPLOYMENT_STATUSES = {
  STARTED: 'STARTED',
  STOPPED: 'STOPPED',
  STARTING: 'STARTING',
  STOPPING: 'STOPPING',
  ERROR: 'ERROR',
  DEPLOYED: 'DEPLOYED',
  UNDEPLOYED: 'UNDEPLOYED',
};

export const SECURITY_MECHANISMS = {
  OAUTH: 'OAuth',
  BASIC_AUTH: 'Basic Authentication',
  CLIENT_CERT: 'Client Certificate',
  CSRF_TOKEN: 'CSRF Token',
  SAML: 'SAML',
  JWT: 'JWT Token',
};