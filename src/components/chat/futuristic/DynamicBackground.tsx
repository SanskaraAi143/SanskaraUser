import React from 'react';
import './DynamicBackground.css';

interface DynamicBackgroundProps {
  // Props to control aspects of the background, e.g., theme, intensity
  // For now, no specific props are needed for the initial version.
  children?: React.ReactNode; // To allow content to be rendered on top
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children }) => {
  return (
    <div className="dynamic-background-container">
      <div className="animated-gradient-layer"></div>
      {/* Optional: Particle layer can be added here later */}
      {/* <div className="particle-layer"></div> */}
      <div className="content-on-top">
        {children}
      </div>
    </div>
  );
};

export default DynamicBackground;
