// src/components/Layout/Footer.jsx
import React from 'react';
import { APP_CONFIG } from '../../utils/constants';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            © 2024 {APP_CONFIG.NAME}. Built for SAP Integration Suite.
          </div>
          <div className="flex items-center space-x-4">
            <span>Version {APP_CONFIG.VERSION}</span>
            <span>•</span>
            <span>Environment: {APP_CONFIG.ENVIRONMENT}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;