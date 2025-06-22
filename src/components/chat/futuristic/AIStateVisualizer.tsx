import React from 'react';
import './AIStateVisualizer.css';

export type AIState = 'idle' | 'listening' | 'processing' | 'speaking' | 'confused';

interface AIStateVisualizerProps {
  state: AIState;
}

const AIStateVisualizer: React.FC<AIStateVisualizerProps> = ({ state }) => {
  return (
    <div className="ai-state-visualizer-container">
      <svg viewBox="0 0 100 100" className={`ai-orb ${state}`}>
        {/* Base Orb */}
        <circle cx="50" cy="50" r="30" className="base-orb" />

        {/* State-specific elements */}
        {state === 'processing' && (
          <>
            <circle cx="50" cy="50" r="20" className="processing-pulse-1" />
            <circle cx="50" cy="50" r="25" className="processing-pulse-2" />
          </>
        )}

        {state === 'listening' && (
          <g className="listening-waves">
            <circle cx="50" cy="50" r="35" className="wave" />
            <circle cx="50" cy="50" r="40" className="wave" />
            <circle cx="50" cy="50" r="45" className="wave" />
          </g>
        )}

        {state === 'speaking' && (
           <circle cx="50" cy="50" r="32" className="speaking-glow" />
        )}

      </svg>
      {/* Optional: Text display for current state (for debugging/development) */}
      {/* <p className="ai-state-text">Current State: {state}</p> */}
    </div>
  );
};

export default AIStateVisualizer;
