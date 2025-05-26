import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { Home, ArrowLeft } from 'lucide-react';
import PropTypes from 'prop-types';


const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hideDetailsPanel } = useDashboard();

  const isOverviewPage = location.pathname === '/';
  const isChartPage = location.pathname.startsWith('/chart/');

  const handleBackToOverview = () => {
    hideDetailsPanel();
    navigate('/');
  };

  // Don't show navigation on overview page
  if (isOverviewPage) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-4">
      {isChartPage && (
        <button
          onClick={handleBackToOverview}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Overview
        </button>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500">
        <button
          onClick={handleBackToOverview}
          className="hover:text-gray-700 transition-colors flex items-center"
        >
          <Home className="w-4 h-4 mr-1" />
          Dashboard
        </button>
        
        {isChartPage && (
          <>
            <span className="mx-2">/</span>
            <span className="text-gray-900 capitalize">
              {location.pathname.split('/').pop()?.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;