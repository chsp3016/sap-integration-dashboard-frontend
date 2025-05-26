// src/components/Layout/PageLayout.jsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';

const PageLayout = ({ 
  children, 
  user, 
  onLogout, 
  notifications,
  showFooter = true,
  className = '' 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        user={user} 
        onLogout={onLogout} 
        notifications={notifications} 
      />
      
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;