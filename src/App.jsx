import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import ChartView from './components/Charts/ChartView';
import ChatInterface from './components/Chat/ChatInterface';
import DetailsPanel from './components/Details/DetailsPanel';
import Navigation from './components/Navigation/Navigation';
import ErrorBoundary from './components/Common/ErrorBoundary';
import LoadingSpinner from './components/Common/LoadingSpinner';
import { DashboardProvider } from './context/DashboardContext';
import { ChatProvider } from './context/ChatContext';
import './App.css';
import { PageLayout } from './components/Layout';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize application
    const initializeApp = async () => {
      try {
        // Check backend connection
        const response = await fetch('/api/health');
        if (!response.ok) {
          throw new Error('Backend service unavailable');
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            SAP Integration Suite Dashboard
          </h1>
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardProvider>
        <ChatProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                      <h1 className="text-2xl font-bold text-gray-900">
                        SAP Integration Suite Dashboard
                      </h1>
                    </div>
                    <Navigation />
                  </div>
                </div>
              </header>

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/chart/:type" element={<ChartView />} />
                </Routes>
              </main>

              <ChatInterface />
              <DetailsPanel />
            </div>
          </Router>
        </ChatProvider>
      </DashboardProvider>
    </ErrorBoundary>
  );
}

export default App;