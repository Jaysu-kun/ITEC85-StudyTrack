import React, { useEffect, useState, useCallback } from 'react';
import { CloudRain, Sun, Wind, Droplets, Gauge, MapPin, RefreshCw, Navigation } from 'lucide-react';

interface WeatherData {
  name: string;
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  dt: number;
}

// Default to CvSU Main Campus (Indang, Cavite)
const DEFAULT_COORDS = {
  lat: 14.1953,
  lon: 120.8782,
  label: 'Campus Weather',
};

export const WeatherWidget: React.FC = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isUsingUserLocation, setIsUsingUserLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherForCoords = useCallback(async (lat: number, lon: number, isLocal: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const key = import.meta.env.VITE_OPENWEATHER_KEY || '72e0c4ef76fc14fb342c2990d0a32cf6';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
      );
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const json: WeatherData = await response.json();
      setData(json);
      setIsUsingUserLocation(isLocal);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown weather error';
      setError(message);
    } finally {
      setLoading(false);
      setIsLocating(false);
    }
  }, []);

  const detectLocationAndFetch = useCallback(() => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherForCoords(position.coords.latitude, position.coords.longitude, true);
        },
        (geoError) => {
          console.warn('Geolocation unavailable or permission denied:', geoError.message);
          // Fallback to campus coordinates
          fetchWeatherForCoords(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, false);
        },
        {
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
          enableHighAccuracy: false,
        }
      );
    } else {
      // Browser doesn't support geolocation
      fetchWeatherForCoords(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, false);
    }
  }, [fetchWeatherForCoords]);

  useEffect(() => {
    detectLocationAndFetch();
  }, [detectLocationAndFetch]);

  if (loading && !data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center animate-pulse gap-2.5">
        <Sun className="w-8 h-8 text-sky-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">
          {isLocating ? 'Detecting your location & weather...' : 'Loading weather data...'}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-5 flex flex-col items-center justify-center text-center">
        <CloudRain className="w-8 h-8 text-sky-500 mb-1.5" />
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Campus Weather
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sunny & Mild • 28°C</p>
        <button
          onClick={detectLocationAndFetch}
          className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-lg border border-sky-200/60 dark:border-sky-800/60 transition-colors"
        >
          <RefreshCw size={12} className={isLocating ? 'animate-spin' : ''} />
          Retry Weather
        </button>
      </div>
    );
  }

  const { name, weather, main, wind } = data;
  const weatherInfo = weather[0] || { main: 'Clear', description: 'clear sky', icon: '01d' };
  const iconUrl = `https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`;

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            {isUsingUserLocation ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 truncate">
                <Navigation size={11} className="fill-teal-600/20 flex-shrink-0" />
                Local Weather
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 truncate">
                <MapPin size={11} className="flex-shrink-0" />
                Campus Weather
              </span>
            )}
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate">
            {name || (isUsingUserLocation ? 'Current Location' : 'CvSU Main')}
          </h4>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={detectLocationAndFetch}
            disabled={isLocating}
            title={isUsingUserLocation ? 'Refresh local weather' : 'Detect your current location'}
            aria-label="Refresh location and weather"
            className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none cursor-pointer"
          >
            <RefreshCw size={14} className={isLocating ? 'animate-spin text-sky-500' : ''} />
          </button>
          <img
            src={iconUrl}
            alt={weatherInfo.description}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-xs flex-shrink-0"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between border-t border-b border-slate-100 dark:border-slate-800/80 py-2 sm:py-2.5 gap-1">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {Math.round(main.temp)}°C
        </span>
        <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 capitalize font-medium truncate">
          {weatherInfo.description} (Feels {Math.round(main.feels_like)}°C)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs text-slate-600 dark:text-slate-400 pt-0.5">
        <div className="flex flex-col items-center p-1 sm:p-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/60 min-w-0">
          <Droplets size={13} className="text-sky-500 mb-0.5 flex-shrink-0" />
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate w-full">Humidity</span>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 truncate w-full">{main.humidity}%</span>
        </div>
        <div className="flex flex-col items-center p-1 sm:p-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/60 min-w-0">
          <Wind size={13} className="text-teal-500 mb-0.5 flex-shrink-0" />
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate w-full">Wind</span>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 truncate w-full">{wind.speed} m/s</span>
        </div>
        <div className="flex flex-col items-center p-1 sm:p-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/60 min-w-0">
          <Gauge size={13} className="text-indigo-500 mb-0.5 flex-shrink-0" />
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate w-full">Pressure</span>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 truncate w-full">{main.pressure} hPa</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
