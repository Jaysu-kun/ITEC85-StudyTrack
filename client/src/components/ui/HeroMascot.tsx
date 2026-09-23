import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import heroLogo from '../../assets/images/Hero_Logo.png';

interface HeroMascotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
}

export const HeroMascot: React.FC<HeroMascotProps> = ({
  className = '',
  size = 'responsive',
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Size mapping
  const sizeClasses = {
    sm: 'w-36 h-36',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    responsive: 'w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-64 lg:h-64',
  }[size];

  // Ground shadow size mapping
  const shadowSizeClasses = {
    sm: 'w-24 h-4',
    md: 'w-32 h-5',
    lg: 'w-40 h-6',
    responsive: 'w-28 sm:w-36 md:w-44 h-4 sm:h-5 md:h-5.5',
  }[size];

  // If reduced motion is preferred, render clean static presentation
  if (shouldReduceMotion) {
    return (
      <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
        {/* Static Ambient Glow */}
        <div
          className="absolute -inset-4 bg-gradient-to-tr from-sky-400/20 via-cyan-400/15 to-transparent dark:from-sky-500/25 dark:via-cyan-400/20 rounded-full blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Mascot Container */}
        <div className={`relative ${sizeClasses} flex items-center justify-center`}>
          <img
            src={heroLogo}
            alt="IskoTasks Mascot - Study Assistant Robot"
            className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(14,165,233,0.18)] dark:drop-shadow-[0_16px_32px_rgba(56,189,248,0.22)] pointer-events-none"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* Static Ground Shadow */}
        <div
          className={`mt-1 bg-slate-400/20 dark:bg-sky-500/15 rounded-full blur-sm pointer-events-none ${shadowSizeClasses}`}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Subtle Ambient Cyan / Blue Glow Behind Mascot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0.5, 0.75, 0.5],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          opacity: { duration: 6, ease: 'easeInOut', repeat: Infinity },
          scale: { duration: 6, ease: 'easeInOut', repeat: Infinity },
          delay: 0.2,
        }}
        className="absolute -inset-6 bg-gradient-to-tr from-sky-400/20 via-cyan-400/15 to-transparent dark:from-sky-500/25 dark:via-cyan-400/20 rounded-full blur-2xl sm:blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Entrance Animation Wrapper (fade-in, slide up, slight rotation, settle) */}
      <motion.div
        initial={{
          opacity: 0,
          y: 28,
          rotate: -4,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          y: 0,
          rotate: 0,
          scale: 1,
        }}
        transition={{
          duration: 1.1,
          ease: [0.16, 1, 0.3, 1], // Gentle spring-like settle
        }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Idle Floating & Breathing Motion Wrapper */}
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 1.2, 0, -1.2, 0],
            scale: [1, 1.012, 1],
          }}
          transition={{
            y: {
              duration: 5.5,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'reverse',
            },
            rotate: {
              duration: 7.5,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'reverse',
            },
            scale: {
              duration: 5.5,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'reverse',
            },
          }}
          className={`relative ${sizeClasses} flex items-center justify-center`}
        >
          <img
            src={heroLogo}
            alt="IskoTasks Mascot - Study Assistant Robot"
            className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(14,165,233,0.18)] dark:drop-shadow-[0_16px_32px_rgba(56,189,248,0.22)] pointer-events-none"
            loading="eager"
            draggable={false}
          />
        </motion.div>

        {/* Dynamic Ground Shadow that synchronizes with the vertical float */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.35, 0.2, 0.35],
            scale: [1, 0.88, 1],
          }}
          transition={{
            duration: 5.5,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 0.1,
          }}
          className={`mt-1 bg-slate-400/20 dark:bg-sky-500/15 rounded-full blur-sm pointer-events-none ${shadowSizeClasses}`}
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
};

export default HeroMascot;
