import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

const DashboardContext = createContext();

// Initial state
const initialState = {
  currentView: 'overview',
  selectedChart: null,
  showDetailsPanel: false,
  detailsData: null,
  customTiles: [],
  dashboardData: {
    integrationStatus: null,
    securityMechanisms: null,
    adapters: null,
    errorHandling: null,
    runtimeInfo: null
  },
  loading: false,
  error: null
};

// Action types
const DASHBOARD_ACTIONS = {
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  SET_SELECTED_CHART: 'SET_SELECTED_CHART',
  SHOW_DETAILS_PANEL: 'SHOW_DETAILS_PANEL',
  HIDE_DETAILS_PANEL: 'HIDE_DETAILS_PANEL',
  SET_DETAILS_DATA: 'SET_DETAILS_DATA',
  ADD_CUSTOM_TILE: 'ADD_CUSTOM_TILE',
  REMOVE_CUSTOM_TILE: 'REMOVE_CUSTOM_TILE',
  SET_DASHBOARD_DATA: 'SET_DASHBOARD_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
function dashboardReducer(state, action) {
  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_CURRENT_VIEW:
      return {
        ...state,
        currentView: action.payload,
        showDetailsPanel: false,
        detailsData: null
      };

    case DASHBOARD_ACTIONS.SET_SELECTED_CHART:
      return {
        ...state,
        selectedChart: action.payload
      };

    case DASHBOARD_ACTIONS.SHOW_DETAILS_PANEL:
      return {
        ...state,
        showDetailsPanel: true,
        detailsData: action.payload
      };

    case DASHBOARD_ACTIONS.HIDE_DETAILS_PANEL:
      return {
        ...state,
        showDetailsPanel: false,
        detailsData: null
      };

    case DASHBOARD_ACTIONS.SET_DETAILS_DATA:
      return {
        ...state,
        detailsData: action.payload
      };

    case DASHBOARD_ACTIONS.ADD_CUSTOM_TILE:
      const newCustomTiles = [...state.customTiles, action.payload];
      // Use sessionStorage instead of localStorage for compatibility
      try {
        sessionStorage.setItem('customTiles', JSON.stringify(newCustomTiles));
      } catch (error) {
        console.warn('Failed to save custom tiles to storage:', error);
      }
      return {
        ...state,
        customTiles: newCustomTiles
      };

    case DASHBOARD_ACTIONS.REMOVE_CUSTOM_TILE:
      const filteredTiles = state.customTiles.filter(tile => tile.id !== action.payload);
      try {
        sessionStorage.setItem('customTiles', JSON.stringify(filteredTiles));
      } catch (error) {
        console.warn('Failed to update custom tiles in storage:', error);
      }
      return {
        ...state,
        customTiles: filteredTiles
      };

    case DASHBOARD_ACTIONS.SET_DASHBOARD_DATA:
      return {
        ...state,
        dashboardData: {
          ...state.dashboardData,
          ...action.payload
        }
      };

    case DASHBOARD_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case DASHBOARD_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case DASHBOARD_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Provider component
export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Load custom tiles from sessionStorage on mount
  useEffect(() => {
    try {
      const savedTiles = sessionStorage.getItem('customTiles');
      if (savedTiles) {
        const tiles = JSON.parse(savedTiles);
        tiles.forEach(tile => {
          dispatch({
            type: DASHBOARD_ACTIONS.ADD_CUSTOM_TILE,
            payload: tile
          });
        });
      }
    } catch (error) {
      console.warn('Error loading custom tiles:', error);
    }
  }, []);

  // Load initial dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    dispatch({ type: DASHBOARD_ACTIONS.SET_LOADING, payload: true });
    try {
      const data = await dashboardService.getDashboardOverview();
      dispatch({
        type: DASHBOARD_ACTIONS.SET_DASHBOARD_DATA,
        payload: data
      });
    } catch (error) {
      dispatch({
        type: DASHBOARD_ACTIONS.SET_ERROR,
        payload: error.message
      });
    } finally {
      dispatch({ type: DASHBOARD_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Actions
  const actions = {
    setCurrentView: (view) => {
      dispatch({
        type: DASHBOARD_ACTIONS.SET_CURRENT_VIEW,
        payload: view
      });
    },

    setSelectedChart: (chart) => {
      dispatch({
        type: DASHBOARD_ACTIONS.SET_SELECTED_CHART,
        payload: chart
      });
    },

    showDetailsPanel: (data) => {
      dispatch({
        type: DASHBOARD_ACTIONS.SHOW_DETAILS_PANEL,
        payload: data
      });
    },

    hideDetailsPanel: () => {
      dispatch({
        type: DASHBOARD_ACTIONS.HIDE_DETAILS_PANEL
      });
    },

    addCustomTile: (tile) => {
      const newTile = {
        ...tile,
        id: Date.now().toString(),
        isCustom: true,
        createdAt: new Date().toISOString()
      };
      dispatch({
        type: DASHBOARD_ACTIONS.ADD_CUSTOM_TILE,
        payload: newTile
      });
    },

    removeCustomTile: (tileId) => {
      dispatch({
        type: DASHBOARD_ACTIONS.REMOVE_CUSTOM_TILE,
        payload: tileId
      });
    },

    refreshDashboardData: loadDashboardData,

    clearError: () => {
      dispatch({ type: DASHBOARD_ACTIONS.CLEAR_ERROR });
    }
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

export { DASHBOARD_ACTIONS };