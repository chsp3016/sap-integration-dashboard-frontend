import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import DashboardTile from './DashboardTile';
import CustomTileModal from './CustomTileModal';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import PropTypes from 'prop-types';

import { 
  Activity, 
  Shield, 
  Zap, 
  AlertTriangle, 
  Clock,
  Plus,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    dashboardData,
    customTiles,
    loading,
    error,
    addCustomTile,
    removeCustomTile,
    refreshDashboardData,
    setCurrentView,
    clearError
  } = useDashboard();

  const [showCustomTileModal, setShowCustomTileModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setCurrentView('overview');
  }, []);

  const handleTileClick = (tileType) => {
    if (tileType !== 'custom') {
      navigate(`/chart/${tileType}`);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddCustomTile = (tileData) => {
    addCustomTile(tileData);
    setShowCustomTileModal(false);
  };

  // Default tiles configuration
  const getDefaultTiles = () => {
    const integrationMetrics = dashboardData.integrationStatus;
    
    return [
      {
        id: 'integrationStatus',
        title: 'Integration Status',
        value: integrationMetrics?.successRate 
          ? `Success: ${integrationMetrics.successRate}%`
          : 'Loading...',
        subtext: integrationMetrics?.totalIflows 
          ? `${integrationMetrics.totalIflows} total iFlows`
          : '',
        icon: Activity,
        color: 'blue',
        trend: integrationMetrics?.successRate >= 90 ? 'up' : 'down',
        isDefault: true,
        clickable: true
      },
      {
        id: 'securityMechanisms',
        title: 'Security Mechanisms',
        value: 'Compliance: 95%', // This will be calculated from actual data
        subtext: 'Security analysis',
        icon: Shield,
        color: 'green',
        trend: 'up',
        isDefault: true,
        clickable: true
      },
      {
        id: 'adapters',
        title: 'Adapters',
        value: 'Avg Response: 200ms',
        subtext: 'Performance metrics',
        icon: Zap,
        color: 'yellow',
        trend: 'stable',
        isDefault: true,
        clickable: true
      },
      {
        id: 'errorHandling',
        title: 'Error Handling',
        value: 'Total Errors: 15',
        subtext: 'Error management',
        icon: AlertTriangle,
        color: 'red',
        trend: 'down',
        isDefault: true,
        clickable: true
      },
      {
        id: 'runtimeInfo',
        title: 'Runtime Information',
        value: 'Success Rate: 98%',
        subtext: 'Runtime performance',
        icon: Clock,
        color: 'indigo',
        trend: 'up',
        isDefault: true,
        clickable: true
      }
    ];
  };

  // Update default tiles with actual data
  const updateTilesWithData = (defaultTiles) => {
    return defaultTiles.map(tile => {
      switch (tile.id) {
        case 'integrationStatus': {
          const integrationData = dashboardData.integrationStatus;
          if (integrationData) {
            return {
              ...tile,
              value: `Success: ${integrationData.successRate}%`,
              subtext: `${integrationData.totalIflows} total iFlows`,
              trend: integrationData.successRate >= 90 ? 'up' : integrationData.successRate >= 70 ? 'stable' : 'down'
            };
          }
          break;
        }

        case 'securityMechanisms': {
          // This would be updated with actual security data
          return {
            ...tile,
            value: 'Compliance: 95%',
            subtext: 'Authentication active'
          };
        }

        case 'adapters': {
          // This would be updated with actual adapter data
          return {
            ...tile,
            value: 'Avg Response: 200ms',
            subtext: 'Performance optimal'
          };
        }

        case 'errorHandling': {
          // This would be updated with actual error data
          return {
            ...tile,
            value: 'Total Errors: 15',
            subtext: 'Last 24 hours'
          };
        }

        case 'runtimeInfo': {
          const runtimeData = dashboardData.integrationStatus?.runtimeMetrics;
          if (runtimeData) {
            return {
              ...tile,
              value: 'Success Rate: 98%',
              subtext: 'Runtime performance'
            };
          }
          break;
        }

        default:
          return tile;
      }
      return tile;
    });
  };

  const defaultTiles = updateTilesWithData(getDefaultTiles());
  const allTiles = [...defaultTiles, ...customTiles];

  if (loading && !dashboardData.integrationStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            {dashboardData.timestamp && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(dashboardData.timestamp).toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <button
              onClick={() => setShowCustomTileModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Tile
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage 
              message={error} 
              onDismiss={clearError}
            />
          </div>
        )}

        {/* Dashboard Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTiles.map((tile) => (
            <DashboardTile
              key={tile.id}
              tile={tile}
              onClick={() => handleTileClick(tile.type || tile.id)}
              onDelete={tile.isCustom ? () => removeCustomTile(tile.id) : undefined}
            />
          ))}
        </div>

        {/* Statistics Summary */}
        {dashboardData.integrationStatus && (
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Integration Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.integrationStatus.totalIflows || 0}
                </div>
                <div className="text-sm text-gray-500">Total iFlows</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData.integrationStatus.successRate || 0}%
                </div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.integrationStatus.deploymentStatuses?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Deployment Types</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData.integrationStatus.systemsCompositions?.reduce((sum, comp) => sum + parseInt(comp.count || 0), 0) || 0}
                </div>
                <div className="text-sm text-gray-500">Total Integrations</div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Tile Modal */}
        {showCustomTileModal && (
          <CustomTileModal
            onClose={() => setShowCustomTileModal(false)}
            onSubmit={handleAddCustomTile}
          />
        )}
      </div>
    </div>
  );
};

// PropTypes definition (optional - remove if not needed)
Dashboard.propTypes = {
  // Add PropTypes here if the component receives props
};

export default Dashboard;