
import React, { useState, useEffect, useCallback } from 'react';
import { WeatherData, TacticalBriefing } from './types';
import { fetchWeatherData, generateTacticalBriefing } from './services/weatherService';
import TacticalMap from './components/TacticalMap';
import TrendChart from './components/TrendChart';
import DailyForecast from './components/DailyForecast';

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [briefing, setBriefing] = useState<TacticalBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const refreshData = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      const data = await fetchWeatherData(lat, lon);
      setWeather(data);
      setLastUpdate(new Date());
      
      const brief = await generateTacticalBriefing(data);
      setBriefing(brief);
      setError(null);
    } catch (err) {
      setError("שגיאה בטעינת נתונים טקטיים");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("גישה למיקום אינה נתמכת בדפדפן זה");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        refreshData(latitude, longitude);

        // Auto-update every 30 minutes
        const interval = setInterval(() => {
          refreshData(latitude, longitude);
        }, 30 * 60 * 1000);

        return () => clearInterval(interval);
      },
      (err) => {
        setError("נדרשת הרשאת מיקום עבור דיוק טקטי");
        setLoading(false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !weather) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-[#00ff41]">
        <div className="w-16 h-16 border-4 border-t-[#00ff41] border-r-transparent border-b-[#00ff41] border-l-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-xl tracking-widest uppercase animate-pulse text-center px-4">System Boot Sequence...<br/>Calibrating Sensors</div>
      </div>
    );
  }

  const statusColors = {
    safe: 'text-green-500',
    caution: 'text-yellow-500',
    danger: 'text-red-500'
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen flex flex-col gap-4">
      {/* Header */}
      <header className="flex justify-between items-end border-b border-[#00ff41]/30 pb-2">
        <div>
          <h1 className="text-2xl font-bold neon-glow leading-none">WEATHER_TACTICAL</h1>
          <p className="text-[10px] opacity-50 uppercase">UNIT_ID: ALPHA-01 // SIGINT_ENABLED</p>
        </div>
        <div className="text-right text-[10px]">
          <p>UTC {new Date().toISOString().split('T')[1].split('.')[0]}</p>
          <p className="opacity-70">SENS_REFRESH: {lastUpdate.toLocaleTimeString()}</p>
        </div>
      </header>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 p-2 text-red-500 text-xs text-center">
          SYSTEM_ERR: {error}
        </div>
      )}

      {weather && (
        <>
          {/* Main Card */}
          <div className="tactical-border bg-black/40 p-6 relative overflow-hidden">
            <div className="absolute top-2 left-2 text-[8px] opacity-40">PRIMARY_METRICS</div>
            <div className="flex flex-col items-center text-center">
              <div className="text-7xl font-bold neon-glow mb-1">
                {Math.round(weather.current.temp)}<span className="text-3xl font-light">°C</span>
              </div>
              <div className="ice-blue text-lg uppercase tracking-widest font-bold">
                {weather.current.description}
              </div>
              <div className="mt-4 flex gap-8">
                <div className="text-center">
                  <div className="text-[10px] opacity-50 uppercase">לחות</div>
                  <div className="text-xl font-bold">{weather.current.humidity}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] opacity-50 uppercase">משקעים</div>
                  <div className="text-xl font-bold">{weather.current.precipitation}mm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="tactical-border p-3 bg-black/40">
              <div className="text-[10px] opacity-50 uppercase mb-1">רוח</div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 border border-[#00ff41] rounded-full flex items-center justify-center shrink-0"
                  style={{ transform: `rotate(${weather.current.windDirection}deg)` }}
                >
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-[#00ff41] mb-2"></div>
                </div>
                <div>
                  <div className="font-bold text-lg leading-none shrink-0">{weather.current.windSpeed} <span className="text-[10px]">קמ"ש</span></div>
                  <div className="text-[10px] opacity-50">{weather.current.windDirection}°</div>
                </div>
              </div>
            </div>

            <div className="tactical-border p-3 bg-black/40">
              <div className="text-[10px] opacity-50 uppercase mb-1">ראות</div>
              <div className="text-xl font-bold">{weather.current.visibility.toFixed(1)} <span className="text-[10px]">ק"מ</span></div>
              <div className="text-[8px] opacity-40 mt-1">SENS_OPTIC_SCAN</div>
            </div>

            <div className="tactical-border p-3 bg-black/40">
              <div className="text-[10px] opacity-50 uppercase mb-1">נקודת טל</div>
              <div className="text-xl font-bold">{weather.current.dewPoint.toFixed(1)}°C</div>
              <div className="text-[8px] opacity-40 mt-1">CONDENSATION_IDX</div>
            </div>

            <div className="tactical-border p-3 bg-black/40">
              <div className="text-[10px] opacity-50 uppercase mb-1">נ"צ</div>
              <div className="text-[11px] font-mono leading-tight">
                LAT: {weather.location.lat.toFixed(4)}<br/>
                LON: {weather.location.lon.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="h-48 relative">
            <TacticalMap lat={weather.location.lat} lon={weather.location.lon} />
          </div>

          {/* AI Briefing */}
          {briefing && (
            <div className="tactical-border p-4 bg-black/60 border-l-4 border-l-[#00ff41]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-tighter">AI_TACTICAL_BRIEFING</span>
                <span className={`text-[10px] font-bold uppercase ${statusColors[briefing.status]}`}>
                  OP_STATUS: {briefing.status}
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-3 ice-blue font-medium">
                {briefing.assessment}
              </p>
              <ul className="space-y-1">
                {briefing.recommendations.map((rec, i) => (
                  <li key={i} className="text-[11px] flex items-start gap-2">
                    <span className="text-[#00ff41] mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Daily Forecast */}
          <DailyForecast daily={weather.daily} />

          {/* Forecast Chart */}
          <div className="tactical-border p-4 bg-black/40 mb-2">
            <TrendChart data={weather.hourly} />
          </div>
        </>
      )}

      {/* Footer Nav / Sticky */}
      <div className="mt-auto pt-4 flex gap-2">
        <button 
          onClick={() => {
            if (weather) refreshData(weather.location.lat, weather.location.lon);
          }}
          className="flex-1 border border-[#00ff41] bg-[#00ff41]/10 py-3 text-xs uppercase tracking-widest font-bold hover:bg-[#00ff41]/20 active:scale-95 transition-all"
        >
          FORCE_REFRESH_SCAN
        </button>
      </div>
    </div>
  );
};

export default App;
