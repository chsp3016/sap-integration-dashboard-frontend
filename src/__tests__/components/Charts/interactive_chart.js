import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const InteractiveChart = ({ 
  data, 
  type = 'pie', 
  onClick, 
  options = {},
  height = 400 
}) => {
  const chartRef = useRef(null);

  // Default chart options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || context.raw;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            
            if (type === 'pie' || type === 'doughnut') {
              return `${label}: ${value} (${percentage}%)`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onClick) {
        const elementIndex = elements[0].index;
        onClick(elementIndex, elements[0]);
      }
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    }
  };

  // Merge default options with provided options
  const chartOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins
    }
  };

  // Chart-specific options
  const getChartSpecificOptions = () => {
    switch (type) {
      case 'bar':
        return {
          ...chartOptions,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 11
                },
                maxRotation: 45
              }
            }
          }
        };

      case 'line':
        return {
          ...chartOptions,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          },
          elements: {
            point: {
              radius: 4,
              hoverRadius: 6
            },
            line: {
              borderWidth: 2,
              tension: 0.1
            }
          }
        };

      case 'doughnut':
        return {
          ...chartOptions,
          cutout: '60%',
          plugins: {
            ...chartOptions.plugins,
            legend: {
              ...chartOptions.plugins.legend,
              position: 'right'
            }
          }
        };

      case 'pie':
      default:
        return chartOptions;
    }
  };

  const finalOptions = getChartSpecificOptions();

  // Enhanced data processing
  const processedData = {
    ...data,
    datasets: data.datasets?.map(dataset => ({
      ...dataset,
      borderWidth: dataset.borderWidth || 2,
      hoverBorderWidth: dataset.hoverBorderWidth || 3,
      hoverBackgroundColor: dataset.hoverBackgroundColor || dataset.backgroundColor?.map(color => 
        color.replace(')', ', 0.8)').replace('rgb', 'rgba')
      )
    }))
  };

  // Chart component selection
  const renderChart = () => {
    const commonProps = {
      ref: chartRef,
      data: processedData,
      options: finalOptions,
      height: height
    };

    switch (type) {
      case 'bar':
        return <Bar {...commonProps} />;
      case 'line':
        return <Line {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      case 'pie':
      default:
        return <Pie {...commonProps} />;
    }
  };

  // Error boundary for chart rendering
  if (!data || !data.datasets || data.datasets.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
        style={{ height: height }}
      >
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Chart Loading Overlay */}
      <div className="relative" style={{ height: height }}>
        {renderChart()}
      </div>

      {/* Chart Actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex space-x-1">
          <button
            onClick={() => {
              const chart = chartRef.current;
              if (chart) {
                const url = chart.toBase64Image();
                const link = document.createElement('a');
                link.download = `chart-${Date.now()}.png`;
                link.href = url;
                link.click();
              }
            }}
            className="p-1 bg-white rounded shadow hover:bg-gray-50 transition-colors"
            title="Download chart as image"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart Info */}
      {data.summary && (
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            Click on chart segments for detailed information
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveChart;