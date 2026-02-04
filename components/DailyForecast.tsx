
import React from 'react';
import { getWeatherDescription } from '../services/weatherService';

interface DailyForecastProps {
  daily: {
    time: string[];
    weatherCode: number[];
    tempMax: number[];
    tempMin: number[];
  };
}

const DailyForecast: React.FC<DailyForecastProps> = ({ daily }) => {
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('he-IL', { weekday: 'short' }).format(date);
  };

  return (
    <div className="tactical-border bg-black/40 p-3 mt-4">
      <div className="text-[10px] mb-2 opacity-60 uppercase tracking-widest">LONG_RANGE_INTEL (5_DAY_PROJECTION)</div>
      <div className="flex flex-col gap-2">
        {daily.time.map((time, i) => (
          <div key={time} className="flex items-center justify-between border-b border-[#00ff41]/10 pb-1 last:border-0">
            <div className="w-12 font-bold text-xs">{getDayName(time)}</div>
            <div className="flex-1 px-2 text-[10px] ice-blue truncate uppercase text-center">
              {getWeatherDescription(daily.weatherCode[i])}
            </div>
            <div className="flex gap-3 text-xs w-20 justify-end">
              <span className="font-bold">{Math.round(daily.tempMax[i])}°</span>
              <span className="opacity-40">{Math.round(daily.tempMin[i])}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast;
