import React from 'react';
import { Sun, Sunrise, Sunset, Thermometer, Droplets, Wind, Gauge } from 'lucide-react';
import { format } from 'date-fns';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface WeatherMetricsProps {
  currentWeather: {
    temp: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    description: string;
    sunrise: Date;
    sunset: Date;
    daylightHours: number;
  } | null;
}

export const WeatherMetrics: React.FC<WeatherMetricsProps> = ({ currentWeather }) => {
  if (!currentWeather) return null;

  const metrics = [
    {
      name: 'Temperature',
      value: `${currentWeather.temp.toFixed(1)}°F`,
      icon: Thermometer,
      status: currentWeather.temp > 85 ? 'warning' : currentWeather.temp < 60 ? 'warning' : 'optimal',
      tooltip: 'Current air temperature. Optimal range: 60-85°F'
    },
    {
      name: 'Sunrise',
      value: format(currentWeather.sunrise, 'h:mm a'),
      icon: Sunrise,
      status: 'optimal',
      tooltip: 'Time of sunrise'
    },
    {
      name: 'Sunset',
      value: format(currentWeather.sunset, 'h:mm a'),
      icon: Sunset,
      status: 'optimal',
      tooltip: 'Time of sunset'
    },
    {
      name: 'Daylight',
      value: `${currentWeather.daylightHours.toFixed(1)} hrs`,
      icon: Sun,
      status: 'optimal',
      tooltip: 'Total hours of daylight'
    },
    {
      name: 'Pressure',
      value: `${currentWeather.pressure} hPa`,
      icon: Gauge,
      status: 'optimal',
      tooltip: 'Atmospheric pressure in hectopascals'
    },
    {
      name: 'Humidity',
      value: `${currentWeather.humidity}%`,
      icon: Droplets,
      status: currentWeather.humidity > 70 ? 'warning' : currentWeather.humidity < 40 ? 'warning' : 'optimal',
      tooltip: 'Relative humidity. Optimal range: 40-70%'
    },
    {
      name: 'Wind',
      value: `${currentWeather.windSpeed} mph`,
      icon: Wind,
      status: currentWeather.windSpeed > 15 ? 'warning' : 'optimal',
      tooltip: 'Wind speed. Warning if above 15 mph'
    }
  ];

  return (
    <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-800">
      <h2 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2">
        <Sun className="w-5 h-5" />
        Current Conditions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <TooltipPrimitive.Provider key={metric.name}>
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger asChild>
                <div className="bg-emerald-950 rounded-lg p-3 border border-emerald-800 hover:border-emerald-700 transition-all hover:scale-[1.02] cursor-help">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <metric.icon className={`w-4 h-4 text-emerald-500 ${
                        metric.name === 'Wind' ? 'animate-spin-slow' : 
                        metric.name === 'Temperature' ? 'animate-pulse' : ''
                      }`} />
                      <span className="text-sm text-emerald-300">{metric.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      metric.status === 'optimal' ? 'bg-emerald-900/30 text-emerald-400' :
                      metric.status === 'warning' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {metric.status}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-emerald-200">
                    {metric.value}
                  </div>
                </div>
              </TooltipPrimitive.Trigger>
              <TooltipPrimitive.Content
                className="bg-emerald-950 p-3 rounded-lg border border-emerald-800 shadow-lg"
                sideOffset={5}
              >
                <p className="text-sm text-emerald-200">{metric.tooltip}</p>
                <TooltipPrimitive.Arrow className="fill-emerald-800" />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Root>
          </TooltipPrimitive.Provider>
        ))}
      </div>
    </div>
  );
};