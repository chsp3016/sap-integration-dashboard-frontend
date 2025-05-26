import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { dashboardService } from '../../services/dashboardService';
import { chatService } from '../../services/chatService';
import InteractiveChart from './InteractiveChart';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import { ArrowLeft, RefreshCw, Download, Filter } from 'lucide-react';
import PropTypes from 'prop-types';

const ChartView = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { 
    setCurrentView, 
    showDetailsPanel, 
    hideDetailsPanel,
    clearError
  } = useDashboard();

  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Simple refs to prevent multiple clicks
  const isProcessingClick = useRef(false);

  // Chart configuration
  const chartConfigs = {
    integrationStatus: {
      title: 'Integration Status Overview',
      description: 'Current status distribution of all integration flows',
      chartType: 'doughnut',
      colorScheme: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    },
    securityMechanisms: {
      title: 'Security Mechanisms',
      description: 'Authentication and security mechanisms usage across iFlows',
      chartType: 'pie',
      colorScheme: ['#059669', '#0D9488', '#0891B2', '#3B82F6', '#6366F1']
    },
    adapters: {
      title: 'Adapter Usage',
      description: 'Distribution of adapter types used in integration flows',
      chartType: 'bar',
      colorScheme: ['#F59E0B', '#F97316', '#EF4444', '#EC4899', '#8B5CF6']
    },
    errorHandling: {
      title: 'Error Handling',
      description: 'Error handling mechanisms and failure statistics',
      chartType: 'pie',
      colorScheme: ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E']
    },
    runtimeInfo: {
      title: 'Runtime Performance',
      description: 'Performance metrics and execution statistics',
      chartType: 'bar',
      colorScheme: ['#6366F1', '#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE']
    }
  };

  const currentConfig = chartConfigs[type] || {
    title: 'Unknown Chart',
    description: 'Chart configuration not found',
    chartType: 'pie',
    colorScheme: ['#6B7280']
  };

  // Fix the infinite loop by removing problematic useEffect
  useEffect(() => {
    setCurrentView(type);
  }, [type]); // Remove setCurrentView from dependencies
  
  useEffect(() => {
    loadChartData();
  }, [type]); // Only depend on type

  const loadChartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getChartData(type, filters);
      setChartData(processChartData(data));
    } catch (err) {
      console.error('Error loading chart data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (rawData) => {
    if (!rawData) return null;

    switch (type) {
      case 'integrationStatus':
        return {
          labels: rawData.deploymentStatuses?.map(status => status.status) || [],
          datasets: [{
            data: rawData.deploymentStatuses?.map(status => parseInt(status.count)) || [],
            backgroundColor: currentConfig.colorScheme,
            borderColor: currentConfig.colorScheme.map(color => color + '80'),
            borderWidth: 2
          }],
          summary: {
            total: rawData.totalIflows || 0,
            successRate: rawData.successRate || 0
          }
        };

      case 'securityMechanisms':
        return {
          labels: rawData.mechanisms?.map(mech => mech.type) || [],
          datasets: [{
            data: rawData.mechanisms?.map(mech => mech.count) || [],
            backgroundColor: currentConfig.colorScheme,
            borderColor: currentConfig.colorScheme.map(color => color + '80'),
            borderWidth: 2
          }],
          summary: {
            complianceRate: rawData.complianceRate || 0,
            totalWithSecurity: rawData.totalWithSecurity || 0
          }
        };

      case 'adapters':
        return {
          labels: rawData.adapterTypes?.map(adapter => adapter.type) || [],
          datasets: [{
            label: 'Usage Count',
            data: rawData.adapterTypes?.map(adapter => adapter.count) || [],
            backgroundColor: currentConfig.colorScheme,
            borderColor: currentConfig.colorScheme.map(color => color + '80'),
            borderWidth: 2
          }],
          summary: {
            avgResponseTime: rawData.avgResponseTime || 0,
            totalAdapters: rawData.totalAdapters || 0
          }
        };

      case 'errorHandling':
        return {
          labels: rawData.errorTypes?.map(error => error.type) || ['No Errors'],
          datasets: [{
            data: rawData.errorTypes?.map(error => error.count) || [1],
            backgroundColor: currentConfig.colorScheme,
            borderColor: currentConfig.colorScheme.map(color => color + '80'),
            borderWidth: 2
          }],
          summary: {
            totalErrors: rawData.totalErrors || 0,
            errorHandlingRate: rawData.errorHandlingRate || 0
          }
        };

      case 'runtimeInfo':
        return {
          labels: ['Success Rate', 'Avg Processing Time (ms)', 'Total Messages'],
          datasets: [{
            label: 'Runtime Metrics',
            data: [
              parseFloat(rawData.successRate) || 0,
              rawData.avgProcessingTime || 0,
              rawData.totalMessages || 0
            ],
            backgroundColor: currentConfig.colorScheme,
            borderColor: currentConfig.colorScheme.map(color => color + '80'),
            borderWidth: 2
          }],
          summary: {
            successRate: rawData.successRate || 0,
            totalMessages: rawData.totalMessages || 0
          }
        };

      default:
        return null;
    }
  };

  // Fixed chart click handler with proper details panel
  const handleChartClick = (elementIndex, chartElement) => {
    // Prevent multiple clicks completely
    if (isProcessingClick.current || !chartData?.labels) {
      console.log('Chart click ignored - already processing or no data');
      return;
    }

    // Set processing flag immediately
    isProcessingClick.current = true;

    const clickedLabel = chartData.labels[elementIndex];
    const clickedValue = chartData.datasets[0].data[elementIndex];

    console.log(`✅ Chart clicked successfully: ${clickedLabel} (${clickedValue})`);
    
    // Create simple details data without complex calculations
    const detailsData = {
      type: 'chart_interaction',
      title: `${currentConfig.title} - ${clickedLabel}`,
      message: `Selected: ${clickedLabel} with ${clickedValue} items`,
      metric: clickedLabel,
      value: clickedValue,
      chartType: type,
      timestamp: new Date().toISOString(),
      data: {
        summary: [{
          type: clickedLabel,
          count: clickedValue
        }]
      }
    };

    // Use setTimeout to prevent immediate re-render issues
    setTimeout(() => {
      try {
        showDetailsPanel(detailsData);
        console.log('Details panel shown successfully');
      } catch (error) {
        console.error('Error showing details panel:', error);
      }
    }, 100);

    // Reset processing flag after 2 seconds
    setTimeout(() => {
      isProcessingClick.current = false;
      console.log('Chart click processing reset');
    }, 2000);
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      await loadChartData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    if (!chartData) return;

    const exportData = {
      title: currentConfig.title,
      data: chartData,
      timestamp: new Date().toISOString(),
      type: type
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-chart-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackToOverview = () => {
    hideDetailsPanel();
    navigate('/');
  };

  if (loading && !chartData) {
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
          <div className="flex items-center">
            <button
              onClick={handleBackToOverview}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentConfig.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentConfig.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>

            <button
              onClick={handleExport}
              disabled={!chartData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
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

        {/* Chart Container */}
        {chartData ? (
          <div className="bg-white rounded-lg shadow p-6">
            {/* Chart Summary */}
            {chartData.summary && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(chartData.summary).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {typeof value === 'number' && key.includes('Rate') ? `${value}%` : value}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Interactive Chart */}
            <div className="h-96">
              <InteractiveChart
                data={chartData}
                type={currentConfig.chartType}
                onClick={handleChartClick}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.parsed || context.raw;
                          return `${label}: ${value}`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>

            {/* Data Table */}
            {chartData.labels && chartData.datasets[0].data && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {chartData.labels.map((label, index) => {
                        const value = chartData.datasets[0].data[index];
                        const total = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        
                        return (
                          <tr key={label} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {label}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {value}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {percentage}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No data available for this chart</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartView;