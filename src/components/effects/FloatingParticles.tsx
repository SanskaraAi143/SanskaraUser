import React from 'react';

// Assuming .particle and .floating-particles styles are defined in a global CSS file
// (e.g., src/index.css or src/App.css) like:
// .floating-particles { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 0; /* or appropriate z-index */ }
// .particle { position: absolute; background-color: rgba(255, 255, 255, 0.5); border-radius: 50%; animation-name: float; animation-timing-function: linear; animation-iteration-count: infinite; }
// @keyframes float { /* ... animation ... */ }

const FloatingParticles: React.FC<{ count?: number }> = ({ count = 20 }) => {
  const particles = Array.from({ length: count });
  return (
    <div className="floating-particles" aria-hidden="true">
      {particles.map((_, i) => {
        const size = Math.random() * 16 + 8; // 8px to 24px
        const left = Math.random() * 100;
        const duration = Math.random() * 10 + 10; // 10s to 20s
        const delay = Math.random() * 10;
        return (
          <div
            key={i}
            className="particle"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export default FloatingParticles;
