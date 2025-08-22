import React from 'react';
import { Cloud, Sun, Wind, Droplets, ThermometerSun, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import type { WeatherPattern } from '../types';

interface WeatherPatternsProps {
  patterns: WeatherPattern[];
  plantingDate?: Date;
  harvestDate?: Date;
}

export function WeatherPatterns({ patterns, plantingDate, harvestDate }: WeatherPatternsProps) {
  if (!patterns || patterns.length === 0) return null;

  const plantingMonth = plantingDate ? format(plantingDate, 'MMMM') : null;
  const harvestMonth = harvestDate ? format(harvestDate, 'MMMM') : null;

  return (
    <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-800">
      <h2 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2">
        <Cloud className="w-5 h-5" />
        Historical Weather Patterns
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {patterns.map((pattern) => {
          const isPlantingMonth = plantingMonth && pattern.month === plantingMonth;
          const isHarvestMonth = harvestMonth && pattern.month === harvestMonth;
          
          return (
            <div 
              key={pattern.month}
              className={`bg-emerald-950 rounded-lg p-4 border ${
                isPlantingMonth ? 'border-yellow-500' : 
                isHarvestMonth ? 'border-orange-500' : 
                'border-emerald-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-emerald-300 font-medium">{pattern.month}</h3>
                <div className="flex gap-1">
                  {pattern.commonConditions.map((condition, i) => {
                    const Icon = condition.toLowerCase().includes('cloud') ? Cloud :
                               condition.toLowerCase().includes('rain') ? Droplets :
                               Sun;
                    return <Icon key={i} className="w-4 h-4 text-emerald-400" />;
                  })}
                </div>
              </div>

              {(isPlantingMonth || isHarvestMonth) && (
                <div className={`mb-3 px-2 py-1 rounded text-xs font-medium text-center ${
                  isPlantingMonth ? 'bg-yellow-900/30 text-yellow-400' : 'bg-orange-900/30 text-orange-400'
                }`}>
                  {isPlantingMonth ? 'Planting Month' : 'Harvest Month'}
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-emerald-900/30 rounded-lg p-2">
                    <div className="flex items-center gap-1 text-emerald-400 mb-1">
                      <ThermometerSun className="w-4 h-4" />
                      <span>Temperature</span>
                    </div>
                    <div className="text-emerald-200">
                      <div>High: {pattern.avgTemp.high}°F</div>
                      <div>Low: {pattern.avgTemp.low}°F</div>
                    </div>
                  </div>

                  <div className="bg-emerald-900/30 rounded-lg p-2">
                    <div className="flex items-center gap-1 text-emerald-400 mb-1">
                      <Droplets className="w-4 h-4" />
                      <span>Humidity</span>
                    </div>
                    <div className="text-emerald-200">
                      <div>AM: {pattern.humidity.morning}%</div>
                      <div>PM: {pattern.humidity.afternoon}%</div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-900/30 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-emerald-400 mb-1">
                    <Wind className="w-4 h-4" />
                    <span>Wind</span>
                  </div>
                  <div className="text-emerald-200 text-sm">
                    <div>Avg: {pattern.windSpeed.avg} mph</div>
                    <div>Gusts up to: {pattern.windSpeed.gusts} mph</div>
                  </div>
                </div>

                {pattern.growingNotes.length > 0 && (
                  <div className="space-y-2">
                    {pattern.growingNotes.map((note, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-2 text-xs text-yellow-300 bg-yellow-950/20 rounded-lg p-2 border border-yellow-900/50"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}