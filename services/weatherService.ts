
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData, TacticalBriefing } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,visibility,dew_point_2m&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=6`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch weather data");
  
  const data = await response.json();
  
  return {
    current: {
      temp: data.current.temperature_2m,
      description: getWeatherDescription(data.current.weather_code),
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      dewPoint: data.current.dew_point_2m,
      visibility: data.current.visibility / 1000, // convert to km
      time: data.current.time,
      conditionCode: data.current.weather_code
    },
    hourly: {
      time: data.hourly.time.slice(0, 12),
      temperature: data.hourly.temperature_2m.slice(0, 12)
    },
    daily: {
      time: data.daily.time.slice(1, 6), // Next 5 days excluding today
      weatherCode: data.daily.weather_code.slice(1, 6),
      tempMax: data.daily.temperature_2m_max.slice(1, 6),
      tempMin: data.daily.temperature_2m_min.slice(1, 6)
    },
    location: { lat, lon }
  };
}

export function getWeatherDescription(code: number): string {
  const codes: Record<number, string> = {
    0: "שמיים בהירים",
    1: "בהיר ברובו",
    2: "מעונן חלקית",
    3: "מעונן",
    45: "ערפל",
    48: "ערפל כבד",
    51: "טפטוף קל",
    61: "גשם קל",
    63: "גשם",
    71: "שלג קל",
    95: "סופת רעמים"
  };
  return codes[code] || "לא ידוע";
}

export async function generateTacticalBriefing(data: WeatherData): Promise<TacticalBriefing> {
  const prompt = `Analyze this weather data for field operations:
  Temp: ${data.current.temp}°C
  Wind: ${data.current.windSpeed} km/h from ${data.current.windDirection}°
  Visibility: ${data.current.visibility} km
  Humidity: ${data.current.humidity}%
  Precipitation: ${data.current.precipitation}mm
  Description: ${data.current.description}
  
  Provide a tactical briefing in Hebrew.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, description: 'One of: safe, caution, danger' },
          assessment: { type: Type.STRING, description: 'Summary of operational impact' },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Tactical advice points' }
        },
        required: ['status', 'assessment', 'recommendations']
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    return {
      status: 'caution',
      assessment: 'ניתוח טקטי לא זמין כרגע. יש לנהוג במשנה זהירות.',
      recommendations: ['בדוק ציוד בטיחות', 'שמור על קשר רציף']
    };
  }
}
