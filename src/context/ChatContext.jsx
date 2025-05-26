import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { useDashboard } from './DashboardContext';

const ChatContext = createContext();

// Initial state
const initialState = {
  isVisible: false,
  messages: [],
  isLoading: false,
  error: null,
  suggestions: [
    "Show me all iFlows with OAuth authentication",
    "Which iFlows have error handling issues?",
    "What is the average message processing time?",
    "List all iFlows with SAP2SAP system composition",
    "How many iFlows are using the HTTP adapter?"
  ]
};

// Action types
const CHAT_ACTIONS = {
  TOGGLE_VISIBILITY: 'TOGGLE_VISIBILITY',
  SET_VISIBILITY: 'SET_VISIBILITY',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
function chatReducer(state, action) {
  switch (action.type) {
    case CHAT_ACTIONS.TOGGLE_VISIBILITY:
      return {
        ...state,
        isVisible: !state.isVisible
      };

    case CHAT_ACTIONS.SET_VISIBILITY:
      return {
        ...state,
        isVisible: action.payload
      };

    case CHAT_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };

    case CHAT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case CHAT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case CHAT_ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        messages: []
      };

    case CHAT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Provider component
export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const toggleVisibility = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.TOGGLE_VISIBILITY });
  }, []);

  const setVisibility = useCallback((visible) => {
    dispatch({ 
      type: CHAT_ACTIONS.SET_VISIBILITY, 
      payload: visible 
    });
  }, []);

  const addMessage = useCallback((message) => {
    const newMessage = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...message
    };
    dispatch({
      type: CHAT_ACTIONS.ADD_MESSAGE,
      payload: newMessage
    });
  }, []);

  const sendMessage = useCallback(async (query, currentView) => {
    if (!query.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: query.trim()
    });

    dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });

    try {
      const response = await chatService.sendQuery(query, currentView);
      
      // Add bot response
      addMessage({
        type: 'bot',
        content: response.message || 'I processed your request.',
        data: response.data,
        responseType: response.type
      });

      return response;
    } catch (error) {
      console.error('Chat error:', error);
      
      addMessage({
        type: 'bot',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        error: true
      });

      dispatch({
        type: CHAT_ACTIONS.SET_ERROR,
        payload: error.message
      });
      
      throw error;
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_MESSAGES });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    toggleVisibility,
    setVisibility,
    addMessage,
    sendMessage,
    clearMessages,
    clearError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export { CHAT_ACTIONS };