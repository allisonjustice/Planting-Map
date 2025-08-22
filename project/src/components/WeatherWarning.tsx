import React from 'react';
import { AlertTriangle, ThermometerSun, Calendar, Wind } from 'lucide-react';
import type { LocationData, WeatherForecast } from '../types';

interface WeatherWarningProps {
  location: LocationData;
  currentWeather: any;
  forecast: WeatherForecast[];
}

export const WeatherWarning: React.FC<WeatherWarningProps> = ({ location, currentWeather, forecast }) => {
  if (!currentWeather || !location) return null;

  const warnings: { type: string; message: string; severity: 'high' | 'medium' | 'low' }[] = [];

  // Temperature warnings
  if (currentWeather.temp < 60) {
    warnings.push({
      type: 'temperature',
      message: 'Current temperature is below optimal range (65-85°F). Consider supplemental heating or indoor growing.',
      severity: 'high'
    });
  } else if (currentWeather.temp > 85) {
    warnings.push({
      type: 'temperature',
      message: 'Current temperature is above optimal range (65-85°F). Consider cooling measures or shade cloth.',
      severity: 'high'
    });
  }

  // Humidity warnings
  if (currentWeather.humidity > 70) {
    warnings.push({
      type: 'humidity',
      message: 'High humidity levels detected. Risk of mold and mildew. Improve ventilation and dehumidification.',
      severity: 'high'
    });
  } else if (currentWeather.humidity < 40) {
    warnings.push({
      type: 'humidity',
      message: 'Low humidity levels detected. Consider using a humidifier to maintain optimal growth conditions.',
      severity: 'medium'
    });
  }

  // Growing season analysis
  const frostDates = location.firstFrostDate && location.lastFrostDate ? {
    first: new Date(location.firstFrostDate),
    last: new Date(location.lastFrostDate)
  } : null;

  if (frostDates) {
    const growingDays = Math.round((frostDates.first.getTime() - frostDates.last.getTime()) / (1000 * 60 * 60 * 24));
    if (growingDays < 84) { // 12 weeks minimum
      warnings.push({
        type: 'season',
        message: `Short growing season detected (${growingDays} days). Consider indoor growing or autoflowering strains.`,
        severity: 'high'
      });
    }
  }

  // Wind warnings
  if (currentWeather.windSpeed > 15) {
    warnings.push({
      type: 'wind',
      message: 'High wind conditions detected. Consider wind breaks or support structures for plants.',
      severity: 'medium'
    });
  }

  if (warnings.length === 0) {
    return (
      <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-800 mb-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <ThermometerSun className="w-5 h-5" />
          <p>Growing conditions in your area are currently optimal! 🌱</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-800 mb-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-emerald-400">Growing Condition Alerts</h3>
      </div>
      
      {warnings.map((warning, index) => (
        <div 
          key={index}
          className={`rounded-lg p-3 flex items-start gap-3 ${
            warning.severity === 'high' 
              ? 'bg-red-900/20 border border-red-800' 
              : warning.severity === 'medium'
              ? 'bg-yellow-900/20 border border-yellow-800'
              : 'bg-emerald-900/30 border border-emerald-800'
          }`}
        >
          {warning.type === 'temperature' && <ThermometerSun className="w-5 h-5 text-red-400 shrink-0" />}
          {warning.type === 'season' && <Calendar className="w-5 h-5 text-yellow-400 shrink-0" />}
          {warning.type === 'wind' && <Wind className="w-5 h-5 text-emerald-400 shrink-0" />}
          <div>
            <p className={`text-sm ${
              warning.severity === 'high' 
                ? 'text-red-300' 
                : warning.severity === 'medium'
                ? 'text-yellow-300'
                : 'text-emerald-300'
            }`}>
              {warning.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};