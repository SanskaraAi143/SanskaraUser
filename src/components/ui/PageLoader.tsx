import React from 'react';
import './PageLoader.css'; // Import the CSS file

const PageLoader: React.FC = () => {
  return (
    <div className="page-loader-container">
      <div className="page-loader-spinner"></div>
    </div>
  );
};

export default PageLoader;
