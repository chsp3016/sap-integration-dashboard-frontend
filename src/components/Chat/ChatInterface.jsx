import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useDashboard } from '../../context/DashboardContext';
import PropTypes from 'prop-types';

import { 
  MessageCircle, 
  Send, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Bot,
  User,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

const ChatInterface = () => {
  const {
    isVisible,
    messages,
    isLoading,
    error,
    suggestions,
    toggleVisibility,
    setVisibility,
    sendMessage,
    clearMessages,
    clearError
  } = useChat();

  const { currentView, showDetailsPanel } = useDashboard();

  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
  
    const query = inputValue.trim();
    setInputValue('');
    setShowSuggestions(false);
  
    try {
      const response = await sendMessage(query, currentView);
      console.log('📥 Raw response from sendMessage:', response);
      console.log('📊 Response data:', response.data);
      // Show details panel with enhanced data structure
      if (response.data) {
        const detailsData = {
          type: response.type || 'chat_query', // Use the response type from API
          title: 'Query Results',
          query,
          context: currentView,
          message: response.message, // Use 'message' instead of 'response'
          data: response.data,
          timestamp: response.timestamp || new Date().toISOString(),
          // Add metadata for better display
          metadata: {
            queryType: response.type,
            hasChartData: !!(response.data.summary && Array.isArray(response.data.summary)),
            hasTableData: !!(response.data.iflows && Array.isArray(response.data.iflows)),
            totalItems: response.data.iflows ? response.data.iflows.length : 0
          }
        };
        
        console.log('Showing details panel with data:', detailsData); // Debug log
        showDetailsPanel(detailsData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatMessage = (message) => {
    if (typeof message === 'string') {
      return message;
    }
    
    // Handle structured messages
    if (message.content) {
      return message.content;
    }
    
    return JSON.stringify(message);
  };

  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    const isError = message.error;
  
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`
            max-w-xs lg:max-w-md px-4 py-2 rounded-lg
            ${isUser 
              ? 'bg-blue-600 text-white' 
              : isError 
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-800'
            }
          `}
        >
          {/* Message Header */}
          <div className="flex items-center mb-1">
            {isUser ? (
              <User className="w-4 h-4 mr-2 opacity-75" />
            ) : (
              <Bot className="w-4 h-4 mr-2 opacity-75" />
            )}
            <span className="text-xs opacity-75">
              {isUser ? 'You' : 'Assistant'}
            </span>
            <span className="text-xs opacity-50 ml-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
  
          {/* Message Content */}
          <div className="text-sm leading-relaxed">
            {formatMessage(message)}
          </div>
  
          {/* Response Type Badge */}
          {message.responseType && !isUser && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {message.responseType.replace(/_/g, ' ')}
              </span>
            </div>
          )}
  
          {/* Enhanced Data Summary */}
          {message.data && !isUser && (
            <div className="mt-2 text-xs opacity-75">
              {/* Show summary count if available */}
              {message.data.summary && Array.isArray(message.data.summary) && (
                <div>📊 {message.data.summary.length} security mechanisms found</div>
              )}
              {/* Show iFlows count if available */}
              {message.data.iflows && Array.isArray(message.data.iflows) && (
                <div>🔗 {message.data.iflows.length} iFlows with details</div>
              )}
              {/* Fallback for other data types */}
              {!message.data.summary && !message.data.iflows && (
                <div>📋 Detailed data available in panel</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleVisibility}
        className={`
          fixed bottom-4 right-4 z-40 p-3 rounded-full shadow-lg transition-all duration-200
          ${isVisible ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
          text-white
        `}
        title={isVisible ? 'Hide Chat' : 'Show Chat'}
      >
        {isVisible ? (
          <ChevronDown className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Panel */}
      <div className={`
        fixed bottom-0 right-0 w-full md:w-96 bg-white border-l border-gray-200 shadow-xl z-30
        transform transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      `}>
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <Bot className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-semibold text-gray-900">
              SAP Integration Assistant
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {/* Clear Messages */}
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={() => setVisibility(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Hide chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-64 md:h-80 overflow-y-auto p-4 space-y-2">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <div className="text-sm">
                <p className="font-medium mb-1">Welcome to SAP Integration Assistant!</p>
                <p>Ask me about your integration flows, security mechanisms, adapters, and more.</p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map(renderMessage)}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-red-800">
                  <strong>Error:</strong> {error}
                </div>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="border-t border-gray-200 p-2 max-h-32 overflow-y-auto">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-xs text-gray-600 font-medium">Suggestions:</span>
            </div>
            <div className="space-y-1">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                placeholder={`Ask about ${currentView} data...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isLoading}
              />
              
              {/* Suggestions Toggle */}
              {suggestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Lightbulb className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>

        {/* Current Context Indicator */}
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t border-gray-200">
          Current context: <span className="font-medium capitalize">{currentView}</span>
        </div>
      </div>

      {/* Backdrop */}
      {isVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-20 md:hidden"
          onClick={() => setVisibility(false)}
        />
      )}
    </>
  );
};

export default ChatInterface;