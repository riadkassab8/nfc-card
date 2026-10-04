import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: '#090d16',
      }}
    >
      {/* Deep gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 40%, #090d16 100%)',
        }}
      />

      {/* Top glowing ambient sphere */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulseGlow 8s ease-in-out infinite alternate',
        }}
      />

      {/* Accent secondary orb (cyan-blue) */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 65%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Subtle Grid Pattern Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.25,
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Futuristic ambient keyframe style */}
      <style>{`
        @keyframes pulseGlow {
          0% { transform: translateX(-50%) scale(0.95); opacity: 0.7; }
          100% { transform: translateX(-50%) scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
