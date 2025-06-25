import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-white/80 z-50"
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <div 
        className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"
        role="status"
        aria-label="Loading..."
      />
    </div>
  );
};

export default PageLoader;
