import React, { useEffect, useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';

import { 
  X, 
  Info, 
  Clock, 
  Database, 
  ChevronRight,
  ExternalLink,
  Download,
  Copy,
  Search
} from 'lucide-react';
import PropTypes from 'prop-types';
import { Shield, Activity, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

const DetailsPanel = () => {
  const { 
    showDetailsPanel, 
    detailsData, 
    hideDetailsPanel 
  } = useDashboard();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Reset active tab when new details are shown
  useEffect(() => {
    if (detailsData) {
      setActiveTab('overview');
      setSearchTerm('');
    }
  }, [detailsData]);

  // Apply page split styling
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      if (showDetailsPanel) {
        mainContent.style.width = '40%';
        mainContent.style.transition = 'width 0.3s ease-in-out';
      } else {
        mainContent.style.width = '100%';
        mainContent.style.transition = 'width 0.3s ease-in-out';
      }
    }

    // Cleanup function
    return () => {
      if (mainContent) {
        mainContent.style.width = '100%';
      }
    };
  }, [showDetailsPanel]);

  const handleClose = () => {
    hideDetailsPanel();
  };

  const handleCopyData = () => {
    if (detailsData) {
      const textData = JSON.stringify(detailsData, null, 2);
      navigator.clipboard.writeText(textData).then(() => {
        // Could add a toast notification here
        console.log('Data copied to clipboard');
      });
    }
  };

  const handleExportData = () => {
    if (!detailsData) return;

    const exportData = {
      ...detailsData,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `details-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOverview = () => {
    if (!detailsData) return null;
  
    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Query Results
          </h3>
          
          <div className="space-y-3">
            {detailsData.query && (
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">Query:</span>
                <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 italic">
                  "{detailsData.query}"
                </div>
              </div>
            )}
            
            {detailsData.message && (
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">Response:</span>
                <div className="bg-blue-50 p-2 rounded text-sm text-gray-700">
                  {detailsData.message}
                </div>
              </div>
            )}
  
            {detailsData.context && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Context:</span>
                <span className="text-sm text-gray-900">{detailsData.context}</span>
              </div>
            )}
  
            {detailsData.type && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Response Type:</span>
                <span className="text-sm text-gray-900 capitalize">
                  {detailsData.type.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
  
        {/* Generic Summary Section for ALL response types with summary data */}
        {detailsData.data?.summary && Array.isArray(detailsData.data.summary) && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              {getIconForResponseType(detailsData.type)}
              {getSummaryTitle(detailsData.type)}
            </h3>
            
            {/* Aggregate and display summary data */}
            {(() => {
              const aggregated = aggregateSummaryData(detailsData.data.summary);
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(aggregated)
                    .sort(([,a], [,b]) => b - a) // Sort by count descending
                    .map(([key, count]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">
                          {formatSummaryKey(key, detailsData.type)}
                        </span>
                        <span className="text-sm font-bold text-blue-600">{count}</span>
                      </div>
                    ))
                  }
                </div>
              );
            })()}
            
            {/* Summary statistics */}
            {(() => {
              const totalCount = detailsData.data.summary.reduce((sum, item) => 
                sum + (parseInt(item.count) || 0), 0);
              const uniqueTypes = new Set(detailsData.data.summary.map(item => 
                getKeyFromSummaryItem(item, detailsData.type))).size;
              
              return (
                <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-600">{totalCount}</div>
                    <div className="text-xs text-gray-500">Total Count</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600">{uniqueTypes}</div>
                    <div className="text-xs text-gray-500">Unique Types</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        {detailsData.type === 'chart_interaction' && (
          <div className="space-y-6">
            {/* Loading State */}
            {detailsData.loading && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-sm text-gray-600">Loading detailed information...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {detailsData.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">Error: {detailsData.error}</span>
                </div>
              </div>
            )}

            {/* Chart Segment Summary */}
            {!detailsData.loading && !detailsData.error && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  {getChartTypeIcon(detailsData.chartType)}
                  {detailsData.metric} - {getChartTypeTitle(detailsData.chartType)}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{detailsData.value}</div>
                    <div className="text-xs text-gray-500">Chart Count</div>
                  </div>
                  
                  {detailsData.data?.summary?.[0]?.percentage && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{detailsData.data.summary[0].percentage}%</div>
                      <div className="text-xs text-gray-500">Percentage</div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{detailsData.data?.iflows?.length || 0}</div>
                    <div className="text-xs text-gray-500">Detailed iFlows</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${detailsData.data?.metadata?.apiDataAvailable ? 'text-green-600' : 'text-orange-600'}`}>
                      {detailsData.data?.metadata?.apiDataAvailable ? 'Available' : 'Limited'}
                    </div>
                    <div className="text-xs text-gray-500">Data Status</div>
                  </div>
                </div>
              </div>
            )}

            {/* No Data Available Message */}
            {!detailsData.loading && !detailsData.error && 
            (!detailsData.data?.iflows || detailsData.data.iflows.length === 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">No Detailed Data Available</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      No specific iFlow details could be retrieved for "{detailsData.metric}". 
                      This could be because:
                    </p>
                    <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                      <li>The API query didn't return detailed iFlow information</li>
                      <li>No iFlows match the specific criteria "{detailsData.metric}"</li>
                      <li>The data source doesn't have detailed information for this segment</li>
                    </ul>
                    <p className="text-sm text-yellow-700 mt-2">
                      The chart shows <strong>{detailsData.value}</strong> items for this category based on aggregated data.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed iFlows List */}
            {detailsData.data?.iflows && detailsData.data.iflows.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-600" />
                  Integration Flows ({detailsData.data.iflows.length})
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {detailsData.data.iflows.map((iflow, index) => (
                    <div key={iflow.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      {/* Basic Information Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{iflow.name || 'Unknown iFlow'}</h4>
                          <p className="text-sm text-gray-500">
                            {iflow.package || 'Unknown Package'}
                            {iflow.version && ` • v${iflow.version}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {iflow.status && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(iflow.status)}`}>
                              {iflow.status}
                            </span>
                          )}
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {iflow.matchedCriteria || detailsData.metric}
                          </span>
                        </div>
                      </div>

                      {/* Chart Type Specific Details */}
                      {renderRealDataSpecificDetails(iflow, detailsData.chartType)}

                      {/* Common Details */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {iflow.id && (
                            <div>
                              <span className="font-medium text-gray-600">ID:</span>
                              <span className="ml-1 text-gray-800 font-mono text-xs">{iflow.id}</span>
                            </div>
                          )}
                          {iflow.lastUpdated && (
                            <div>
                              <span className="font-medium text-gray-600">Last Updated:</span>
                              <span className="ml-1 text-gray-800">{new Date(iflow.lastUpdated).toLocaleDateString()}</span>
                            </div>
                          )}
                          {iflow.package_id && iflow.package_id !== iflow.package && (
                            <div>
                              <span className="font-medium text-gray-600">Package ID:</span>
                              <span className="ml-1 text-gray-800 font-mono text-xs">{iflow.package_id}</span>
                            </div>
                          )}
                        </div>
                        {iflow.description && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-600 text-sm">Description:</span>
                            <p className="text-sm text-gray-700 mt-1">{iflow.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
  
        {/* Generic iFlows Section for ALL response types with iflows data */}
        {detailsData.data?.iflows && Array.isArray(detailsData.data.iflows) && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-600" />
              Integration Flows ({detailsData.data.iflows.length})
            </h3>
            
            <div className="space-y-3">
              {detailsData.data.iflows.map((iflow, index) => (
                <div key={iflow.id || index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{iflow.name}</h4>
                      <p className="text-sm text-gray-500">Package: {iflow.package}</p>
                      {iflow.id && <p className="text-xs text-gray-400">ID: {iflow.id}</p>}
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {getIflowBadgeText(iflow, detailsData.type)}
                    </span>
                  </div>
                  
                  {/* Dynamic rendering based on response type */}
                  {renderIflowDetails(iflow, detailsData.type)}
                </div>
              ))}
            </div>
          </div>
        )}
  
        {/* Timestamp */}
        {detailsData.timestamp && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              Generated: {new Date(detailsData.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getIconForResponseType = (type) => {
    switch (type) {
      case 'security_info':
        return <Shield className="w-5 h-5 mr-2 text-green-600" />;
      case 'adapter_info':
        return <Activity className="w-5 h-5 mr-2 text-blue-600" />;
      case 'error_info':
      case 'failed_iflows':
        return <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />;
      case 'performance_info':
      case 'runtime_info':
        return <Clock className="w-5 h-5 mr-2 text-purple-600" />;
      default:
        return <Info className="w-5 h-5 mr-2 text-gray-600" />;
    }
  };
  
  // Helper function to get appropriate summary title
  const getSummaryTitle = (type) => {
    switch (type) {
      case 'security_info':
        return 'Security Mechanisms Summary';
      case 'adapter_info':
        return 'Adapter Types Summary';
      case 'error_info':
        return 'Error Types Summary';
      case 'performance_info':
        return 'Performance Metrics Summary';
      case 'runtime_info':
        return 'Runtime Information Summary';
      default:
        return 'Summary';
    }
  };
  
  // Helper function to aggregate summary data generically
  const aggregateSummaryData = (summary) => {
    return summary.reduce((acc, item) => {
      // Try different possible key names for the summary item
      const key = item.mechanism_type || item.adapter_type || item.error_type || 
                  item.type || item.name || item.category || 'Unknown';
      const count = parseInt(item.count) || 1;
      acc[key] = (acc[key] || 0) + count;
      return acc;
    }, {});
  };
  
  // Helper function to get the key from summary item based on type
  const getKeyFromSummaryItem = (item, type) => {
    switch (type) {
      case 'security_info':
        return item.mechanism_type || 'Unknown';
      case 'adapter_info':
        return item.adapter_type || 'Unknown';
      case 'error_info':
        return item.error_type || 'Unknown';
      default:
        return item.type || item.name || item.category || 'Unknown';
    }
  };
  
  // Helper function to format summary keys for display
  const formatSummaryKey = (key, type) => {
    // Clean up common patterns
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  };
  
  // Helper function to get badge text for iflows
  const getIflowBadgeText = (iflow, type) => {
    switch (type) {
      case 'security_info':
        return `${iflow.security_mechanisms?.length || 0} security mechanisms`;
      case 'adapter_info':
        return `${iflow.adapters?.length || iflow.iflow_adapters?.length || 0} adapters`;
      case 'error_info':
        return iflow.status || 'Status unknown';
      default:
        return 'Details available';
    }
  };
  
  // Helper function to render iflow-specific details
  const renderIflowDetails = (iflow, type) => {
    switch (type) {
      case 'security_info':
        return renderSecurityMechanisms(iflow.security_mechanisms);
      case 'adapter_info':
        return renderAdapters(iflow.adapters || iflow.iflow_adapters);
      case 'error_info':
        return renderErrorInfo(iflow);
      case 'performance_info':
      case 'runtime_info':
        return renderPerformanceInfo(iflow.runtime_info || iflow.performance);
      default:
        return renderGeneralDetails(iflow);
    }
  };
  
  const renderAdapters = (adapters) => {
    if (!adapters || !Array.isArray(adapters) || adapters.length === 0) {
      return <p className="text-xs text-gray-500 mt-2">No adapters found</p>;
    }
  
    return (
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-600 mb-2">Adapters:</p>
        <div className="space-y-1">
          {adapters.map((adapter, idx) => (
            <div key={idx} className="text-xs bg-blue-50 p-2 rounded">
              <div className="font-medium">{adapter.name || adapter.adapter_name || 'Unknown Adapter'}</div>
              <div className="flex space-x-2 mt-1">
                <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                  {adapter.type || adapter.adapter_type || 'Unknown Type'}
                </span>
                {adapter.direction && (
                  <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded">
                    {adapter.direction}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render error information
  const renderErrorInfo = (iflow) => {
    return (
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-600 mb-2">Error Details:</p>
        <div className="text-xs bg-red-50 p-2 rounded">
          <div>Status: <span className="font-medium">{iflow.status || 'Unknown'}</span></div>
          {iflow.error_message && (
            <div className="mt-1">Error: <span className="text-red-700">{iflow.error_message}</span></div>
          )}
          {iflow.last_error_time && (
            <div className="mt-1">Last Error: {new Date(iflow.last_error_time).toLocaleString()}</div>
          )}
        </div>
      </div>
    );
  };
  
  // Render performance information
  const renderPerformanceInfo = (perfInfo) => {
    if (!perfInfo) {
      return <p className="text-xs text-gray-500 mt-2">No performance data available</p>;
    }
  
    return (
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-600 mb-2">Performance Metrics:</p>
        <div className="text-xs bg-purple-50 p-2 rounded space-y-1">
          {perfInfo.avg_processing_time && (
            <div>Avg Processing Time: <span className="font-medium">{perfInfo.avg_processing_time}ms</span></div>
          )}
          {perfInfo.success_rate && (
            <div>Success Rate: <span className="font-medium">{perfInfo.success_rate}%</span></div>
          )}
          {perfInfo.total_messages && (
            <div>Total Messages: <span className="font-medium">{perfInfo.total_messages}</span></div>
          )}
        </div>
      </div>
    );
  };
  
  // Render general details for unknown types
  const renderGeneralDetails = (iflow) => {
    const details = Object.entries(iflow)
      .filter(([key, value]) => 
        key !== 'id' && key !== 'name' && key !== 'package' && 
        value !== null && value !== undefined && value !== ''
      )
      .slice(0, 5); // Limit to first 5 additional properties
  
    if (details.length === 0) {
      return <p className="text-xs text-gray-500 mt-2">No additional details available</p>;
    }
  
    return (
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-600 mb-2">Additional Details:</p>
        <div className="text-xs bg-gray-50 p-2 rounded space-y-1">
          {details.map(([key, value]) => (
            <div key={key}>
              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
              <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render security mechanisms
  const renderSecurityMechanisms = (mechanisms) => {
    if (!mechanisms || !Array.isArray(mechanisms) || mechanisms.length === 0) {
      return <p className="text-xs text-gray-500 mt-2">No security mechanisms found</p>;
    }
  
    return (
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-600 mb-2">Security Mechanisms:</p>
        <div className="space-y-1">
          {mechanisms.map((mechanism, idx) => (
            <div key={idx} className="text-xs bg-green-50 p-2 rounded">
              <div className="font-medium">{mechanism.name}</div>
              <div className="flex space-x-2 mt-1">
                <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded">
                  {mechanism.type}
                </span>
                <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                  {mechanism.direction}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderData = () => {
    if (!detailsData?.data) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No detailed data available</p>
        </div>
      );
    }
  
    const data = detailsData.data;
  
    return (
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
  
        {/* Generic Summary Data Table */}
        {data.summary && Array.isArray(data.summary) && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {getSummaryDataTitle(detailsData.type)}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {getSummaryColumnHeader(detailsData.type)}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.summary
                    .filter(item => {
                      if (searchTerm === '') return true;
                      const searchValue = getSummarySearchValue(item, detailsData.type);
                      return searchValue.toLowerCase().includes(searchTerm.toLowerCase());
                    })
                    .map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getSummaryDisplayValue(item, detailsData.type)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {item.count}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            
            {/* Summary statistics */}
            <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-600">
              Total entries: {data.summary.length} | 
              Total count: {data.summary.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0)}
            </div>
          </div>
        )}
  
        {/* Generic iFlows Data Table */}
        {data.iflows && Array.isArray(data.iflows) && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Integration Flows Details ({data.iflows.length})
            </h3>
            <div className="space-y-3">
              {data.iflows
                .filter(iflow => {
                  if (searchTerm === '') return true;
                  return (
                    iflow.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    iflow.package?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    iflow.id?.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                })
                .map((iflow, index) => (
                  <div key={iflow.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Basic iFlow Information */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{iflow.name}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          {iflow.id && <div><span className="font-medium">ID:</span> {iflow.id}</div>}
                          <div><span className="font-medium">Package:</span> {iflow.package}</div>
                          {iflow.status && <div><span className="font-medium">Status:</span> 
                            <span className={`ml-1 px-2 py-0.5 rounded text-xs ${getStatusColor(iflow.status)}`}>
                              {iflow.status}
                            </span>
                          </div>}
                        </div>
                      </div>
                      
                      {/* Dynamic Content Based on Response Type */}
                      <div>
                        {renderIflowDataDetails(iflow, detailsData.type)}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            
            {/* Results count */}
            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
              {searchTerm && (
                <>
                  {data.iflows.filter(iflow => 
                    iflow.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    iflow.package?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    iflow.id?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length} iFlows found matching "{searchTerm}"
                </>
              )}
              {!searchTerm && (
                <>Showing all {data.iflows.length} integration flows</>
              )}
            </div>
          </div>
        )}
  
        {/* Raw Data Viewer (for debugging or unknown data structures) */}
        {(!data.summary && !data.iflows) && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Raw Data</h3>
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };
  
  // Helper functions for generic data rendering
  
  const getSummaryDataTitle = (type) => {
    switch (type) {
      case 'security_info':
        return 'Security Mechanisms Data';
      case 'adapter_info':
        return 'Adapter Types Data';
      case 'error_info':
        return 'Error Information Data';
      case 'performance_info':
        return 'Performance Metrics Data';
      case 'runtime_info':
        return 'Runtime Information Data';
      default:
        return 'Summary Data';
    }
  };
  
  const getSummaryColumnHeader = (type) => {
    switch (type) {
      case 'security_info':
        return 'Mechanism Type';
      case 'adapter_info':
        return 'Adapter Type';
      case 'error_info':
        return 'Error Type';
      case 'performance_info':
        return 'Metric Type';
      default:
        return 'Type';
    }
  };
  
  const getSummarySearchValue = (item, type) => {
    switch (type) {
      case 'security_info':
        return item.mechanism_type || '';
      case 'adapter_info':
        return item.adapter_type || '';
      case 'error_info':
        return item.error_type || '';
      default:
        return item.type || item.name || item.category || '';
    }
  };
  
  const getSummaryDisplayValue = (item, type) => {
    switch (type) {
      case 'security_info':
        return item.mechanism_type || 'Unknown';
      case 'adapter_info':
        return item.adapter_type || 'Unknown';
      case 'error_info':
        return item.error_type || 'Unknown';
      default:
        return item.type || item.name || item.category || 'Unknown';
    }
  };
  
  const renderIflowDataDetails = (iflow, type) => {
    switch (type) {
      case 'security_info':
        return renderSecurityDataDetails(iflow);
      case 'adapter_info':
        return renderAdapterDataDetails(iflow);
      case 'error_info':
        return renderErrorDataDetails(iflow);
      case 'performance_info':
      case 'runtime_info':
        return renderPerformanceDataDetails(iflow);
      default:
        return renderGenericDataDetails(iflow);
    }
  };
  
  const renderSecurityDataDetails = (iflow) => (
    <div>
      <h5 className="text-sm font-medium text-gray-700 mb-2">Security Mechanisms:</h5>
      {iflow.security_mechanisms && iflow.security_mechanisms.length > 0 ? (
        <div className="space-y-1">
          {iflow.security_mechanisms.map((mechanism, idx) => (
            <div key={idx} className="text-xs bg-green-50 p-2 rounded">
              <div className="font-medium">{mechanism.name}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded">
                  {mechanism.type}
                </span>
                <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                  {mechanism.direction}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No security mechanisms found</p>
      )}
    </div>
  );
  
  const renderAdapterDataDetails = (iflow) => (
    <div>
      <h5 className="text-sm font-medium text-gray-700 mb-2">Adapters:</h5>
      {(iflow.adapters || iflow.iflow_adapters) && (iflow.adapters || iflow.iflow_adapters).length > 0 ? (
        <div className="space-y-1">
          {(iflow.adapters || iflow.iflow_adapters).map((adapter, idx) => (
            <div key={idx} className="text-xs bg-blue-50 p-2 rounded">
              <div className="font-medium">
                {adapter.name || adapter.adapter_name || 'Unknown Adapter'}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                  {adapter.type || adapter.adapter_type || 'Unknown Type'}
                </span>
                {adapter.direction && (
                  <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded">
                    {adapter.direction}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No adapters found</p>
      )}
    </div>
  );
  
  const renderErrorDataDetails = (iflow) => (
    <div>
      <h5 className="text-sm font-medium text-gray-700 mb-2">Error Information:</h5>
      <div className="text-xs bg-red-50 p-2 rounded space-y-1">
        {iflow.error_message && (
          <div><span className="font-medium">Error:</span> {iflow.error_message}</div>
        )}
        {iflow.last_error_time && (
          <div><span className="font-medium">Last Error:</span> {new Date(iflow.last_error_time).toLocaleString()}</div>
        )}
        {iflow.error_count && (
          <div><span className="font-medium">Error Count:</span> {iflow.error_count}</div>
        )}
      </div>
    </div>
  );
  
  const renderPerformanceDataDetails = (iflow) => (
    <div>
      <h5 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics:</h5>
      {iflow.runtime_info || iflow.performance ? (
        <div className="text-xs bg-purple-50 p-2 rounded space-y-1">
          {(iflow.runtime_info?.avg_processing_time || iflow.performance?.avg_time) && (
            <div><span className="font-medium">Avg Processing Time:</span> {iflow.runtime_info?.avg_processing_time || iflow.performance?.avg_time}ms</div>
          )}
          {(iflow.runtime_info?.success_rate || iflow.performance?.success_rate) && (
            <div><span className="font-medium">Success Rate:</span> {iflow.runtime_info?.success_rate || iflow.performance?.success_rate}%</div>
          )}
          {(iflow.runtime_info?.total_messages || iflow.performance?.total_messages) && (
            <div><span className="font-medium">Total Messages:</span> {iflow.runtime_info?.total_messages || iflow.performance?.total_messages}</div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No performance data available</p>
      )}
    </div>
  );
  
  const renderGenericDataDetails = (iflow) => {
    // Show any additional properties that aren't basic info
    const additionalProps = Object.entries(iflow)
      .filter(([key, value]) => 
        !['id', 'name', 'package', 'status'].includes(key) &&
        value !== null && value !== undefined && value !== ''
      )
      .slice(0, 5);
  
    return (
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-2">Additional Properties:</h5>
        {additionalProps.length > 0 ? (
          <div className="text-xs bg-gray-50 p-2 rounded space-y-1">
            {additionalProps.map(([key, value]) => (
              <div key={key}>
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No additional data available</p>
        )}
      </div>
    );
  };

  const renderRealDataSpecificDetails = (iflow, chartType) => {
    switch (chartType) {
      case 'integrationStatus':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {iflow.deployment_model && (
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Deployment: </span>
                <span className="font-medium ml-1">{iflow.deployment_model}</span>
              </div>
            )}
            {iflow.runtime_node && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Runtime: </span>
                <span className="font-medium ml-1">{iflow.runtime_node}</span>
              </div>
            )}
            {iflow.system_composition && (
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">System: </span>
                <span className="font-medium ml-1">{iflow.system_composition}</span>
              </div>
            )}
          </div>
        );
  
      case 'securityMechanisms':
        return (
          <div className="space-y-2">
            {iflow.security_mechanisms && iflow.security_mechanisms.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Security Mechanisms:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {iflow.security_mechanisms.map((mechanism, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {mechanism.type || mechanism.mechanism_type || 'Unknown'}
                      {mechanism.direction && ` (${mechanism.direction})`}
                    </span>
                  ))}
                </div>
                {iflow.security_mechanisms.some(m => m.name) && (
                  <div className="mt-2 text-xs text-gray-600">
                    <strong>Details:</strong>
                    <ul className="mt-1 ml-4 list-disc">
                      {iflow.security_mechanisms.filter(m => m.name).map((mechanism, idx) => (
                        <li key={idx}>{mechanism.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
  
      case 'adapters': {
        const adapters = iflow.adapters || iflow.iflow_adapters || [];
        return (
          <div className="space-y-2">
            {adapters.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Adapters:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {adapters.map((adapter, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {adapter.type || adapter.adapter_type || 'Unknown'}
                      {adapter.direction && ` (${adapter.direction})`}
                    </span>
                  ))}
                </div>
                {adapters.some(a => a.name || a.adapter_name) && (
                  <div className="mt-2 text-xs text-gray-600">
                    <strong>Adapter Names:</strong>
                    <ul className="mt-1 ml-4 list-disc">
                      {adapters.filter(a => a.name || a.adapter_name).map((adapter, idx) => (
                        <li key={idx}>{adapter.name || adapter.adapter_name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
  
      case 'errorHandling':
        return (
          <div className="space-y-2">
            {iflow.error_message && (
              <div className="text-sm bg-red-50 p-2 rounded border border-red-200">
                <span className="font-medium text-red-800">Error Message:</span>
                <p className="text-red-700 mt-1">{iflow.error_message}</p>
              </div>
            )}
            {iflow.error_type && (
              <div className="flex items-center text-sm">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-gray-600">Error Type: </span>
                <span className="font-medium ml-1 text-red-600">{iflow.error_type}</span>
              </div>
            )}
            {iflow.error_count && (
              <div className="flex items-center text-sm">
                <Activity className="w-4 h-4 text-orange-500 mr-2" />
                <span className="text-gray-600">Error Count: </span>
                <span className="font-medium ml-1">{iflow.error_count}</span>
              </div>
            )}
            {iflow.last_error_time && (
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Last Error: </span>
                <span className="font-medium ml-1">{new Date(iflow.last_error_time).toLocaleString()}</span>
              </div>
            )}
          </div>
        );
  
      case 'runtimeInfo': {
        const runtimeInfo = iflow.runtime_info || iflow.performance || {};
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {runtimeInfo.avg_processing_time && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-blue-500 mr-2" />
                <div>
                  <div className="text-gray-600">Avg Time</div>
                  <div className="font-medium">{runtimeInfo.avg_processing_time}ms</div>
                </div>
              </div>
            )}
            {runtimeInfo.success_rate !== undefined && (
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <div>
                  <div className="text-gray-600">Success Rate</div>
                  <div className="font-medium text-green-600">{runtimeInfo.success_rate}%</div>
                </div>
              </div>
            )}
            {runtimeInfo.total_messages && (
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-purple-500 mr-2" />
                <div>
                  <div className="text-gray-600">Messages</div>
                  <div className="font-medium">{runtimeInfo.total_messages.toLocaleString()}</div>
                </div>
              </div>
            )}
            {runtimeInfo.failure_count && (
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                <div>
                  <div className="text-gray-600">Failures</div>
                  <div className="font-medium text-red-600">{runtimeInfo.failure_count}</div>
                </div>
              </div>
            )}
          </div>
        );
      }
  
      default: {
        // For unknown chart types, display any additional properties that might be relevant
        const additionalProps = Object.entries(iflow)
          .filter(([key, value]) => 
            !['id', 'name', 'package', 'status', 'version', 'lastUpdated', 'description', 'segmentReason', 'matchedCriteria', 'chartType'].includes(key) &&
            value !== null && value !== undefined && value !== ''
          )
          .slice(0, 6); // Limit to first 6 properties
  
        if (additionalProps.length === 0) return null;
  
        return (
          <div className="text-sm">
            <span className="font-medium text-gray-600">Additional Properties:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {additionalProps.map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="font-medium text-gray-500 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="ml-1 text-gray-700">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
  };
  
  // Helper functions remain the same
  const getChartTypeIcon = (chartType) => {
    const icons = {
      integrationStatus: <Activity className="w-5 h-5 mr-2 text-blue-600" />,
      securityMechanisms: <Shield className="w-5 h-5 mr-2 text-green-600" />,
      adapters: <Activity className="w-5 h-5 mr-2 text-purple-600" />,
      errorHandling: <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />,
      runtimeInfo: <Clock className="w-5 h-5 mr-2 text-orange-600" />
    };
    
    return icons[chartType] || <Info className="w-5 h-5 mr-2 text-gray-600" />;
  };
  
  const getChartTypeTitle = (chartType) => {
    const titles = {
      integrationStatus: 'Integration Status Details',
      securityMechanisms: 'Security Mechanism Details',
      adapters: 'Adapter Configuration Details',
      errorHandling: 'Error Analysis Details',
      runtimeInfo: 'Runtime Performance Details'
    };
    
    return titles[chartType] || 'Chart Details';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'started':
      case 'deployed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'not deployed':
      case 'stopped':
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'starting':
      case 'deploying':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: Info }
    ];

    if (detailsData?.data) {
      tabs.push({ id: 'data', label: 'Data', icon: Database });
    }

    return tabs;
  };

  if (!showDetailsPanel || !detailsData) {
    return null;
  }

  const tabs = getTabs();

  return (
    <div className="fixed top-0 right-0 w-3/5 h-full bg-gray-50 border-l border-gray-200 shadow-xl z-20 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChevronRight className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {detailsData.title || 'Details'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyData}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Copy data"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleExportData}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Export data"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message */}
        {detailsData.message && (
          <p className="text-sm text-gray-600 mt-2">
            {detailsData.message}
          </p>
        )}
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="bg-white border-b border-gray-200">
          <nav className="flex space-x-8 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Content */}
      <div className="p-4 h-full overflow-y-auto pb-20">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'data' && renderData()}
      </div>
    </div>
  );
};

export default DetailsPanel;