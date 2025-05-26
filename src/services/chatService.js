import axios from 'axios';

// Configure axios for chat API
const chatApi = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
  timeout: 45000, // Longer timeout for NLP processing
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for chat API
chatApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Chat API Error:', error);
    
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || error.message;
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to chat service');
    } else {
      throw new Error('Chat request failed: ' + error.message);
    }
  }
);

class ChatService {
  // Send query to NLP service
  async sendQuery(query, currentView = 'overview') {
    try {
      console.log('Sending query to NLP service:', { query, currentView });
      
      const response = await chatApi.post('/api/nlp/query', {
        query: query.trim(),
        context: {
          currentView,
          timestamp: new Date().toISOString()
        }
      });

      return this.processNLPResponse(response.data);
    } catch (error) {
      console.error('Error sending NLP query:', error);
      throw error;
    }
  }

  // Fallback to chat API if NLP service is unavailable
  async sendChatQuery(query, currentView = 'overview') {
    try {
      console.log('Sending query to chat service:', { query, currentView });
      
      const response = await chatApi.post('/api/chat/query', {
        query: query.trim(),
        context: currentView
      });

      return this.processChatResponse(response.data);
    } catch (error) {
      console.error('Error sending chat query:', error);
      throw error;
    }
  }

  // Get NLP service capabilities
  async getCapabilities() {
    try {
      const response = await chatApi.get('/api/nlp/capabilities');
      return response.data;
    } catch (error) {
      console.error('Error fetching NLP capabilities:', error);
      // Return default capabilities if service is unavailable
      return this.getDefaultCapabilities();
    }
  }

  // Process NLP service response with generic handling
  processNLPResponse(data) {
    if (!data) {
      throw new Error('Empty response from NLP service');
    }

    console.log('Processing NLP response:', data); // Debug log

    return {
      type: data.type || 'general',
      message: data.message || 'Query processed successfully',
      data: this.processResponseData(data.data, data.type),
      timestamp: new Date().toISOString(),
      source: 'nlp',
      // Preserve original response for debugging
      originalResponse: data
    };
  }

  // Process chat service response (fallback) with generic handling
  processChatResponse(data) {
    if (!data) {
      throw new Error('Empty response from chat service');
    }

    return {
      type: data.type || 'general',
      message: data.message || 'Query processed successfully',
      data: this.processResponseData(data.data, data.type),
      timestamp: new Date().toISOString(),
      source: 'chat',
      originalResponse: data
    };
  }

  // Enhanced generic response data processing
  processResponseData(data, responseType) {
    if (!data) {
      return null;
    }

    console.log('Processing response data:', { data, responseType }); // Debug log

    // Handle structured responses with summary and/or iflows
    if (data.summary || data.iflows) {
      return {
        summary: this.processSummaryData(data.summary, responseType),
        iflows: this.processIflowsData(data.iflows, responseType),
        // Create chart data for visualization
        chartData: this.createChartData(data.summary, responseType),
        // Add metadata
        metadata: {
          totalSummaryItems: data.summary ? data.summary.length : 0,
          totalIflows: data.iflows ? data.iflows.length : 0,
          responseType: responseType,
          hasChartData: !!(data.summary && Array.isArray(data.summary))
        }
      };
    }

    // Handle array data (list of items)
    if (Array.isArray(data)) {
      return this.processArrayData(data);
    }

    // Handle object data (metrics, single items, etc.)
    if (typeof data === 'object') {
      return this.processObjectData(data);
    }

    return data;
  }

  // Generic summary data processing
  processSummaryData(summary, responseType) {
    if (!summary || !Array.isArray(summary)) {
      return [];
    }

    // Process summary items based on response type
    return summary.map((item, index) => ({
      id: `${responseType || 'generic'}_${index}`,
      ...this.normalizeSummaryItem(item, responseType),
      // Add original data for reference
      _original: item
    }));
  }

  // Normalize summary item based on response type
  normalizeSummaryItem(item, responseType) {
    const count = parseInt(item.count) || 0;
    
    switch (responseType) {
      case 'security_info':
        return {
          type: 'security_mechanism',
          name: item.mechanism_type || 'Unknown',
          mechanism_type: item.mechanism_type,
          count
        };
      
      case 'adapter_info':
        return {
          type: 'adapter',
          name: item.adapter_type || 'Unknown',
          adapter_type: item.adapter_type,
          count
        };
      
      case 'error_info':
        return {
          type: 'error',
          name: item.error_type || item.type || 'Unknown',
          error_type: item.error_type || item.type,
          count
        };
      
      case 'performance_info':
      case 'runtime_info':
        return {
          type: 'metric',
          name: item.metric_type || item.type || 'Unknown',
          metric_type: item.metric_type || item.type,
          count,
          value: item.value || count
        };
      
      default:
        return {
          type: 'generic',
          name: item.type || item.name || item.category || 'Unknown',
          count,
          // Preserve all original fields
          ...item
        };
    }
  }

  // Generic iFlows data processing
  processIflowsData(iflows, responseType) {
    if (!iflows || !Array.isArray(iflows)) {
      return [];
    }

    return iflows.map(iflow => ({
      id: iflow.id || iflow.iflow_id || Math.random().toString(36).substr(2, 9),
      name: iflow.name || iflow.iflow_name || 'Unknown',
      package: iflow.package_name || iflow.package || 'Unknown Package',
      status: iflow.status || 'Unknown',
      
      // Process type-specific data
      ...this.processIflowTypeSpecificData(iflow, responseType),
      
      // Preserve all original fields
      ...iflow
    }));
  }

  // Process iFlow type-specific data
  processIflowTypeSpecificData(iflow, responseType) {
    switch (responseType) {
      case 'security_info':
        return {
          security_mechanisms: this.processSecurityMechanisms(iflow.security_mechanisms),
          hasOAuth: this.hasOAuthMechanism(iflow.security_mechanisms),
          securityCount: iflow.security_mechanisms ? iflow.security_mechanisms.length : 0
        };
      
      case 'adapter_info': {
        const adapters = iflow.adapters || iflow.iflow_adapters || [];
        return {
          adapters: this.processAdapters(adapters),
          iflow_adapters: adapters, // Preserve original field name
          adapterCount: adapters.length,
          hasODataAdapter: this.hasAdapterType(adapters, 'ODATA'),
          hasSOAPAdapter: this.hasAdapterType(adapters, 'SOAP'),
          hasHTTPAdapter: this.hasAdapterType(adapters, 'HTTP')
        };
      }
      
      case 'error_info':
        return {
          error_info: this.processErrorInfo(iflow),
          hasErrors: !!(iflow.error_message || iflow.last_error_time),
          errorCount: iflow.error_count || 0
        };
      
      case 'performance_info':
      case 'runtime_info':
        return {
          performance: this.processPerformanceInfo(iflow.runtime_info || iflow.performance),
          runtime_info: iflow.runtime_info,
          hasPerformanceData: !!(iflow.runtime_info || iflow.performance)
        };
      
      default:
        return {};
    }
  }

  // Process security mechanisms
  processSecurityMechanisms(mechanisms) {
    if (!mechanisms || !Array.isArray(mechanisms)) {
      return [];
    }

    return mechanisms.map(mechanism => ({
      name: mechanism.name || 'Unknown Mechanism',
      type: mechanism.type || 'Unknown Type',
      direction: mechanism.direction || 'Unknown Direction',
      normalizedType: this.normalizeSecurityType(mechanism.type)
    }));
  }

  // Process adapters
  processAdapters(adapters) {
    if (!adapters || !Array.isArray(adapters)) {
      return [];
    }

    return adapters.map(adapter => ({
      name: adapter.name || adapter.adapter_name || 'Unknown Adapter',
      type: adapter.type || adapter.adapter_type || 'Unknown Type',
      direction: adapter.direction || 'Unknown Direction',
      normalizedType: this.normalizeAdapterType(adapter.type || adapter.adapter_type),
      // Preserve original fields
      adapter_name: adapter.adapter_name || adapter.name,
      adapter_type: adapter.adapter_type || adapter.type
    }));
  }

  // Process error information
  processErrorInfo(iflow) {
    return {
      error_message: iflow.error_message,
      last_error_time: iflow.last_error_time,
      error_count: iflow.error_count || 0,
      error_type: iflow.error_type
    };
  }

  // Process performance information
  processPerformanceInfo(perfInfo) {
    if (!perfInfo) return null;

    return {
      avg_processing_time: perfInfo.avg_processing_time || perfInfo.avg_time,
      success_rate: perfInfo.success_rate,
      total_messages: perfInfo.total_messages || perfInfo.message_count,
      failure_count: perfInfo.failure_count || perfInfo.failures
    };
  }

  // Create chart data from summary
  createChartData(summary, responseType) {
    if (!summary || !Array.isArray(summary)) {
      return null;
    }

    // Aggregate counts by the appropriate key
    const aggregated = summary.reduce((acc, item) => {
      const key = this.getChartKey(item, responseType);
      const count = parseInt(item.count) || 0;
      acc[key] = (acc[key] || 0) + count;
      return acc;
    }, {});

    // Convert to chart format
    return Object.entries(aggregated)
      .map(([name, value]) => ({
        name: this.formatChartLabel(name, responseType),
        value: value,
        count: value
      }))
      .sort((a, b) => b.value - a.value); // Sort by count descending
  }

  // Get chart key based on response type
  getChartKey(item, responseType) {
    switch (responseType) {
      case 'security_info':
        return item.mechanism_type || 'Unknown';
      case 'adapter_info':
        return item.adapter_type || 'Unknown';
      case 'error_info':
        return item.error_type || item.type || 'Unknown';
      default:
        return item.type || item.name || item.category || 'Unknown';
    }
  }

  // Format chart label for display
  formatChartLabel(label, responseType) {
    // Clean up common patterns
    return label
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  // Helper methods
  hasOAuthMechanism(mechanisms) {
    if (!mechanisms || !Array.isArray(mechanisms)) return false;
    return mechanisms.some(mechanism => 
      mechanism.type && mechanism.type.toLowerCase().includes('oauth')
    );
  }

  hasAdapterType(adapters, adapterType) {
    if (!adapters || !Array.isArray(adapters)) return false;
    return adapters.some(adapter => 
      (adapter.type || adapter.adapter_type || '').toLowerCase().includes(adapterType.toLowerCase())
    );
  }

  normalizeSecurityType(type) {
    if (!type) return 'unknown';
    
    const normalized = type.toLowerCase();
    
    if (normalized.includes('oauth')) return 'oauth';
    if (normalized.includes('basic')) return 'basic_auth';
    if (normalized.includes('certificate') || normalized.includes('cert')) return 'certificate';
    if (normalized.includes('jwt')) return 'jwt';
    if (normalized.includes('saml')) return 'saml';
    if (normalized.includes('csrf') || normalized.includes('xsrf')) return 'csrf_protection';
    if (normalized.includes('role') || normalized.includes('authorization')) return 'role_based';
    if (normalized.includes('logging')) return 'security_logging';
    if (normalized.includes('debug')) return 'debug_security';
    if (normalized.includes('exception')) return 'exception_handling';
    
    return 'other';
  }

  normalizeAdapterType(type) {
    if (!type) return 'unknown';
    
    const normalized = type.toLowerCase();
    
    if (normalized.includes('odata')) return 'odata';
    if (normalized.includes('soap')) return 'soap';
    if (normalized.includes('http')) return 'http';
    if (normalized.includes('rest')) return 'rest';
    if (normalized.includes('file')) return 'file';
    if (normalized.includes('ftp')) return 'ftp';
    if (normalized.includes('sftp')) return 'sftp';
    if (normalized.includes('mail')) return 'mail';
    if (normalized.includes('jms')) return 'jms';
    if (normalized.includes('jdbc')) return 'jdbc';
    
    return 'other';
  }

  // Process array data (legacy support)
  processArrayData(data) {
    return data.map(item => {
      if (typeof item === 'object' && item !== null) {
        return {
          id: item.id || item.iflow_id || Math.random().toString(36).substr(2, 9),
          name: item.name || item.iflow_name || 'Unknown',
          package: item.package_name || item.package || 'Unknown Package',
          status: item.status || 'Unknown',
          ...item
        };
      }
      return item;
    });
  }

  // Process object data (legacy support)
  processObjectData(data) {
    const processed = { ...data };

    // Process summary data for charts
    if (data.summary && Array.isArray(data.summary)) {
      processed.chartData = data.summary.map(item => ({
        name: item.mechanism_type || item.adapter_type || item.status || item.type || 'Unknown',
        value: parseInt(item.count) || 0,
        count: item.count
      }));
    }

    // Process iFlows data
    if (data.iflows && Array.isArray(data.iflows)) {
      processed.iflows = this.processArrayData(data.iflows);
    }

    return processed;
  }

  // Enhanced format response for details panel
  formatDetailsResponse(response) {
    const details = {
      title: this.getResponseTitle(response.type),
      message: response.message,
      data: response.data,
      timestamp: response.timestamp,
      source: response.source,
      type: response.type
    };

    // Add type-specific formatting
    if (response.data?.summary) {
      const totalCount = response.data.summary.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0);
      const uniqueTypes = new Set(response.data.summary.map(item => 
        this.getChartKey(item, response.type))).size;
      
      details.summary = {
        totalCount,
        uniqueTypes,
        mostCommon: this.findMostCommonItem(response.data.summary, response.type)
      };
    }

    // Add chart data if available
    if (response.data?.chartData) {
      details.chartData = response.data.chartData;
    }

    // Format table data for iFlows
    if (response.data?.iflows) {
      details.tableData = response.data.iflows.map(iflow => ({
        'iFlow Name': iflow.name,
        'Package': iflow.package,
        'Status': iflow.status,
        ...this.getIflowTableData(iflow, response.type)
      }));
    }

    return details;
  }

  // Get iFlow table data based on response type
  getIflowTableData(iflow, responseType) {
    switch (responseType) {
      case 'security_info':
        return {
          'Security Mechanisms': iflow.securityCount || 0,
          'Has OAuth': iflow.hasOAuth ? 'Yes' : 'No'
        };
      case 'adapter_info':
        return {
          'Adapters': iflow.adapterCount || 0,
          'Has ODATA': iflow.hasODataAdapter ? 'Yes' : 'No'
        };
      case 'error_info':
        return {
          'Has Errors': iflow.hasErrors ? 'Yes' : 'No',
          'Error Count': iflow.errorCount || 0
        };
      case 'performance_info':
      case 'runtime_info':
        return {
          'Has Performance Data': iflow.hasPerformanceData ? 'Yes' : 'No'
        };
      default:
        return {};
    }
  }

  // Find most common item in summary
  findMostCommonItem(summary, responseType) {
    if (!summary || !Array.isArray(summary)) return null;

    const aggregated = summary.reduce((acc, item) => {
      const key = this.getChartKey(item, responseType);
      const count = parseInt(item.count) || 0;
      acc[key] = (acc[key] || 0) + count;
      return acc;
    }, {});

    const sortedEntries = Object.entries(aggregated).sort(([,a], [,b]) => b - a);
    return sortedEntries.length > 0 ? { 
      type: sortedEntries[0][0], 
      count: sortedEntries[0][1] 
    } : null;
  }

  // Enhanced title generation
  getResponseTitle(type) {
    const titles = {
      security_info: 'Security Mechanisms Analysis',
      adapter_info: 'Adapter Analysis',
      error_info: 'Error Information',
      failed_iflows: 'Failed Integration Flows',
      performance_info: 'Performance Metrics',
      runtime_info: 'Runtime Information',
      system_composition_info: 'System Composition',
      iflow_info: 'Integration Flow Details',
      search_results: 'Search Results',
      general: 'Query Results'
    };

    return titles[type] || 'Query Results';
  }

  // Get default capabilities when service is unavailable
  getDefaultCapabilities() {
    return {
      queryTypes: [
        {
          type: 'security',
          description: 'Queries about security mechanisms and authentication',
          examples: [
            'Show me all iFlows with OAuth authentication',
            'Which iFlows are using certificate-based security?',
            'List all security mechanisms used in the tenant'
          ]
        },
        {
          type: 'adapter',
          description: 'Queries about adapters and connectivity',
          examples: [
            'List iFlows with ODATA adapters',
            'Which iFlows use SOAP adapters?',
            'Show me all HTTP adapter configurations'
          ]
        },
        {
          type: 'error',
          description: 'Queries about errors and error handling',
          examples: [
            'Which iFlows have error handling issues?',
            'Show me all failed iFlows',
            'List iFlows with missing error logging'
          ]
        },
        {
          type: 'performance',
          description: 'Queries about performance and processing time',
          examples: [
            'What is the average message processing time?',
            'Which iFlows have the highest processing time?',
            'Show me performance metrics for all iFlows'
          ]
        },
        {
          type: 'system_composition',
          description: 'Queries about system composition',
          examples: [
            'List all iFlows with SAP2SAP system composition',
            'How many iFlows are using SAP to non-SAP composition?',
            'Show me all non-SAP to non-SAP integrations'
          ]
        },
        {
          type: 'iflow',
          description: 'Queries about specific iFlows',
          examples: [
            'Show me details for a specific iFlow',
            'What security mechanisms does an iFlow use?',
            'Show me the performance of a specific iFlow'
          ]
        }
      ]
    };
  }

  // Suggest queries based on current view
  getSuggestedQueries(currentView) {
    const suggestions = {
      overview: [
        "Show me integration flow status summary",
        "What's the overall security compliance rate?",
        "How many iFlows are currently deployed?",
        "Show me the most common adapters used"
      ],
      integrationStatus: [
        "Which iFlows are currently failing?",
        "Show me deployment status breakdown",
        "List all successful deployments",
        "What's the success rate by package?"
      ],
      securityMechanisms: [
        "Show me all iFlows with OAuth authentication",
        "Which iFlows are using certificate-based security?",
        "List all security mechanisms used",
        "Show me iFlows with missing authentication"
      ],
      adapters: [
        "Which adapters are most commonly used?",
        "Show me HTTP adapter usage",
        "List all SOAP adapters",
        "Show me iFlows with ODATA adapters",
        "What's the average response time by adapter?"
      ],
      errorHandling: [
        "Which iFlows have error handling issues?",
        "Show me all failed iFlows",
        "List iFlows with missing error logging",
        "What are the most common error types?"
      ],
      runtimeInfo: [
        "What is the average message processing time?",
        "Which iFlows have the highest processing time?",
        "Show me performance metrics",
        "List iFlows with poor performance"
      ]
    };

    return suggestions[currentView] || suggestions.overview;
  }

  // Format security mechanisms for display
  formatSecurityMechanisms(mechanisms) {
    if (!mechanisms || !Array.isArray(mechanisms)) {
      return 'None';
    }

    return mechanisms.map(mech => `${mech.type} (${mech.direction})`).join(', ');
  }

  // Format adapters for display
  formatAdapters(adapters) {
    if (!adapters || !Array.isArray(adapters)) {
      return 'None';
    }

    return adapters.map(adapter => `${adapter.type} (${adapter.direction})`).join(', ');
  }
}

export const chatService = new ChatService();