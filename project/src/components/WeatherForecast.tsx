import React from 'react';
import { format } from 'date-fns';
import { Sun, Cloud, CloudRain, Wind, Droplets, ThermometerSun, ThermometerSnowflake } from 'lucide-react';
import type { WeatherForecast as WeatherForecastType } from '../types';

interface WeatherForecastProps {
  forecast: WeatherForecastType[];
}

export const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast }) => {
  const getWeatherIcon = (description: string) => {
    if (description.includes('rain')) return CloudRain;
    if (description.includes('cloud')) return Cloud;
    return Sun;
  };

  return (
    <div className="bg-emerald-900/20 rounded-xl p-4 sm:p-6 border border-emerald-800 animate-fadeIn">
      <h2 className="text-lg font-semibold mb-4 text-emerald-400">7-Day Weather Forecast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        {forecast.slice(0, 7).map((day, index) => {
          const WeatherIcon = getWeatherIcon(day.description.toLowerCase());
          return (
            <div 
              key={index}
              className="bg-emerald-950 rounded-lg p-3 sm:p-4 border border-emerald-800 hover:border-emerald-700 transition-all hover-scale glass-effect animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center mb-2 sm:mb-3">
                <div className="text-sm font-medium text-emerald-300">
                  {format(day.date, 'EEE')}
                </div>
                <div className="text-xs text-emerald-500">
                  {format(day.date, 'MMM d')}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <WeatherIcon className="w-6 sm:w-8 h-6 sm:h-8 text-emerald-400 animate-float" />
                </div>
                
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1">
                    <ThermometerSun className="w-4 h-4 text-red-400" />
                    <span className="text-base sm:text-lg font-semibold text-emerald-200">
                      {Math.round(day.temp.max)}°F
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThermometerSnowflake className="w-4 h-4 text-blue-400" />
                    <span className="text-sm sm:text-base text-emerald-300">
                      {Math.round(day.temp.min)}°F
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs sm:text-sm text-emerald-300 line-clamp-2">
                    {day.description}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Droplets className="w-3 sm:w-4 h-3 sm:h-4 animate-pulse" />
                      <span className="text-xs sm:text-sm">{day.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Wind className="w-3 sm:w-4 h-3 sm:h-4 animate-spin-slow" />
                      <span className="text-xs sm:text-sm">{Math.round(day.windSpeed)} mph</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};