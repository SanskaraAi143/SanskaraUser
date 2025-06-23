import React from 'react';

// Assuming .particle and .floating-particles styles are defined in a global CSS file
// (e.g., src/index.css or src/App.css) like:
// .floating-particles { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 0; /* or appropriate z-index */ }
// .particle { position: absolute; background-color: rgba(255, 255, 255, 0.5); border-radius: 50%; animation-name: float; animation-timing-function: linear; animation-iteration-count: infinite; }
// @keyframes float { /* ... animation ... */ }


const FloatingParticles: React.FC<{ count?: number }> = ({ count = 20 }) => {
  return (
    <div className="floating-particles" aria-hidden="true">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${Math.random() * 10 + 15}s`, // Ensure duration is always reasonably long
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
