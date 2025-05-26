import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const DashboardTile = ({ tile, onClick, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        gradient: 'from-blue-500 to-blue-600',
        hover: 'from-blue-600 to-blue-700',
        icon: 'text-blue-100',
        accent: 'bg-blue-100 text-blue-800'
      },
      green: {
        gradient: 'from-green-500 to-green-600',
        hover: 'from-green-600 to-green-700',
        icon: 'text-green-100',
        accent: 'bg-green-100 text-green-800'
      },
      yellow: {
        gradient: 'from-yellow-500 to-yellow-600',
        hover: 'from-yellow-600 to-yellow-700',
        icon: 'text-yellow-100',
        accent: 'bg-yellow-100 text-yellow-800'
      },
      red: {
        gradient: 'from-red-500 to-red-600',
        hover: 'from-red-600 to-red-700',
        icon: 'text-red-100',
        accent: 'bg-red-100 text-red-800'
      },
      indigo: {
        gradient: 'from-indigo-500 to-indigo-600',
        hover: 'from-indigo-600 to-indigo-700',
        icon: 'text-indigo-100',
        accent: 'bg-indigo-100 text-indigo-800'
      },
      purple: {
        gradient: 'from-purple-500 to-purple-600',
        hover: 'from-purple-600 to-purple-700',
        icon: 'text-purple-100',
        accent: 'bg-purple-100 text-purple-800'
      },
      gray: {
        gradient: 'from-gray-500 to-gray-600',
        hover: 'from-gray-600 to-gray-700',
        icon: 'text-gray-100',
        accent: 'bg-gray-100 text-gray-800'
      }
    };

    return colorMap[color] || colorMap.blue;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const colors = getColorClasses(tile.color);
  const IconComponent = tile.icon;

  const handleClick = () => {
    if (tile.clickable && onClick) {
      onClick();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div
      className={`
        relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden
        transition-all duration-200 transform
        ${tile.clickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button for custom tiles */}
      {tile.isCustom && onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
          title="Delete tile"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Gradient Header */}
      <div className={`
        h-2 w-full bg-gradient-to-r ${isHovered ? colors.hover : colors.gradient}
        transition-all duration-200
      `} />

      <div className="p-6">
        {/* Icon and Title Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {IconComponent && (
              <div className={`
                p-2 rounded-lg bg-gradient-to-r ${colors.gradient}
                ${isHovered ? 'scale-110' : ''}
                transition-transform duration-200
              `}>
                <IconComponent className={`w-5 h-5 ${colors.icon}`} />
              </div>
            )}
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">
                {tile.title}
              </h3>
              {tile.isCustom && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  Custom
                </span>
              )}
            </div>
          </div>
          
          {/* Trend Indicator */}
          {tile.trend && (
            <div className="flex items-center">
              {getTrendIcon(tile.trend)}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <div className="text-2xl font-bold text-gray-900">
            {tile.value}
          </div>
        </div>

        {/* Subtext */}
        {tile.subtext && (
          <div className="text-sm text-gray-500">
            {tile.subtext}
          </div>
        )}

        {/* Additional Data */}
        {tile.data && (
          <div className="mt-4 space-y-2">
            {Object.entries(tile.data).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="font-medium text-gray-900">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {tile.tags && tile.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {tile.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.accent}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Last Updated */}
        {tile.lastUpdated && (
          <div className="mt-4 text-xs text-gray-400">
            Updated: {new Date(tile.lastUpdated).toLocaleString()}
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      {tile.clickable && (
        <div className={`
          absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0
          ${isHovered ? 'opacity-5' : ''}
          transition-opacity duration-200 pointer-events-none
        `} />
      )}
    </div>
  );
};

export default DashboardTile;