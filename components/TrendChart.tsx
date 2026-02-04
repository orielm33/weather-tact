
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  data: {
    time: string[];
    temperature: number[];
  };
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const chartData = data.time.map((t, i) => ({
    hour: new Date(t).getHours() + ":00",
    temp: data.temperature[i]
  }));

  return (
    <div className="w-full h-32 mt-4">
      <div className="text-[10px] mb-1 opacity-60">מגמת טמפרטורה (12 שע')</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00ff41" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="hour" 
            hide 
          />
          <YAxis 
            hide 
            domain={['dataMin - 2', 'dataMax + 2']} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #00ff41', color: '#00ff41', fontSize: '10px' }}
            itemStyle={{ color: '#00ff41' }}
          />
          <Area 
            type="monotone" 
            dataKey="temp" 
            stroke="#00ff41" 
            fillOpacity={1} 
            fill="url(#colorTemp)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
