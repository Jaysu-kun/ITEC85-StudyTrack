import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Subtle Micro Grid Blueprint Layer */}
      <div className="absolute inset-0 bg-academic-grid opacity-80 dark:opacity-60" />

      {/* Primary Cyan/Sky Gradient Orb */}
      <div
        className="ambient-orb-1 absolute -top-[10%] -left-[5%] w-[60vw] max-w-[650px] h-[60vw] max-h-[650px] rounded-full blur-[100px] sm:blur-[130px] opacity-40 dark:opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.9) 0%, rgba(2, 132, 199, 0.45) 55%, transparent 75%)',
        }}
      />

      {/* Secondary Indigo/Blue Gradient Orb */}
      <div
        className="ambient-orb-2 absolute top-[30%] -right-[10%] w-[55vw] max-w-[600px] h-[55vw] max-h-[600px] rounded-full blur-[110px] sm:blur-[140px] opacity-35 dark:opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, rgba(14, 165, 233, 0.4) 55%, transparent 75%)',
        }}
      />

      {/* Tertiary Soft Azure Ambient Center/Bottom Glow */}
      <div
        className="ambient-orb-3 absolute bottom-[-15%] left-[20%] w-[50vw] max-w-[550px] h-[50vw] max-h-[550px] rounded-full blur-[90px] sm:blur-[120px] opacity-30 dark:opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.75) 0%, rgba(59, 130, 246, 0.35) 55%, transparent 75%)',
        }}
      />
    </div>
  );
};

export default AmbientBackground;
