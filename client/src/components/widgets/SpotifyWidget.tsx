import React from 'react';
import { Music } from 'lucide-react';

export const SpotifyWidget: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-full p-3.5 sm:p-5">
      <div className="w-full flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2.5 sm:mb-3 self-start sm:self-center">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Music size={12} />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Study Beats & Lo-Fi
          </span>
        </div>
        <iframe
          src="https://open.spotify.com/embed/playlist/00zvV81yVu0rJCpJoBGagW?utm_source=generator&theme=0"
          width="100%"
          height="154"
          style={{
            borderRadius: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            background: 'transparent',
          }}
          frameBorder={0}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="border border-slate-200/80 dark:border-slate-800 w-full max-w-full"
          title="Spotify Study Player"
        />
      </div>
    </div>
  );
};

export default SpotifyWidget;
