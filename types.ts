
export interface WeatherData {
  current: {
    temp: number;
    description: string;
    windSpeed: number;
    windDirection: number;
    humidity: number;
    precipitation: number;
    dewPoint: number;
    visibility: number;
    time: string;
    conditionCode: number;
  };
  hourly: {
    time: string[];
    temperature: number[];
  };
  daily: {
    time: string[];
    weatherCode: number[];
    tempMax: number[];
    tempMin: number[];
  };
  location: {
    lat: number;
    lon: number;
    name?: string;
  };
}

export interface TacticalBriefing {
  status: 'safe' | 'caution' | 'danger';
  assessment: string;
  recommendations: string[];
}
