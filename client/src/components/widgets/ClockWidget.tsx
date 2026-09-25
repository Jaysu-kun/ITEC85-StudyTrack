import React, { useEffect, useState, useMemo } from 'react';
import { Clock, Globe } from 'lucide-react';

export const ClockWidget: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    // Initial sync
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeZoneInfo = useMemo(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      const offsetMinutes = -new Date().getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const absMins = Math.abs(offsetMinutes);
      const hours = Math.floor(absMins / 60);
      const mins = absMins % 60;
      const gmt = `GMT${sign}${hours}${mins > 0 ? `:${mins.toString().padStart(2, '0')}` : ''}`;
      return { tz, gmt };
    } catch {
      return { tz: 'Local Time', gmt: '' };
    }
  }, []);

  const formattedTime = useMemo(() => {
    if (is24Hour) {
      return now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    }
    return now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [now, is24Hour]);

  const fullDateString = useMemo(() => {
    return now.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [now]);

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none">
      {/* Header Pill */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
        <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 border border-sky-200/80 dark:border-sky-800/60 px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Clock size={12} className="text-sky-600 dark:text-sky-400" />
          <span>Local Device Time</span>
        </div>

        <button
          onClick={() => setIs24Hour(!is24Hour)}
          title={`Switch to ${is24Hour ? '12-hour' : '24-hour'} format`}
          className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-sky-600 hover:border-sky-300 transition-colors cursor-pointer"
        >
          {is24Hour ? '24H' : '12H'}
        </button>
      </div>

      {/* Main Digital Clock */}
      <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
        {formattedTime}
      </span>

      {/* Day and Full Localized Date */}
      <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 break-words max-w-full">
        {fullDateString}
      </div>

      {/* Timezone and Offset Details */}
      <div className="flex items-center justify-center gap-1.5 mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 break-words max-w-full">
        <Globe size={11} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
        <span className="truncate">
          {timeZoneInfo.tz} {timeZoneInfo.gmt ? `(${timeZoneInfo.gmt})` : ''}
        </span>
      </div>
    </div>
  );
};

export default ClockWidget;
