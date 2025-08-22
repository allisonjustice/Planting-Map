import React from 'react';
import { format } from 'date-fns';
import { Plane as Plant, ThermometerSun, AlertTriangle, Sun } from 'lucide-react';

interface PlantingConditionsProps {
  lastFrostDate?: Date | null;
  firstFrostDate?: Date | null;
  currentTemp: number;
  optimalPlantingWindow?: {
    start: Date;
    end: Date;
  };
}

export const PlantingConditions: React.FC<PlantingConditionsProps> = ({
  lastFrostDate,
  firstFrostDate,
  currentTemp,
  optimalPlantingWindow
}: PlantingConditionsProps) => {
  const now = new Date();
  const isOptimalPlantingTime = optimalPlantingWindow && 
    now >= optimalPlantingWindow.start && 
    now <= optimalPlantingWindow.end;

  const isFrostFree = !lastFrostDate && !firstFrostDate;

  return (
    <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-800">
      <div className="flex items-center gap-3 mb-4">
        <Plant className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-emerald-400">Risk of Frost</h3>
      </div>

      <div className="space-y-4">
        {isFrostFree ? (
          <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-700">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-200 font-medium">
                Frost-Free Growing Zone
              </span>
            </div>
            <p className="text-sm text-emerald-300">
              Your location is in a frost-free zone! You can plant year-round, focusing primarily on daylight hours 
              and temperature for optimal growing conditions. Monitor the daylight chart to time your growing cycle 
              with natural light patterns.
            </p>
          </div>
        ) : isOptimalPlantingTime ? (
          <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-700">
            <div className="flex items-center gap-2 mb-2">
              <ThermometerSun className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-200 font-medium">
                Favorable Planting Conditions
              </span>
            </div>
            <p className="text-sm text-emerald-300">
              Based on recent seasonal data, planting conditions in your area are typically favorable from{' '}
              {format(optimalPlantingWindow.start, 'MMMM d')} to {format(optimalPlantingWindow.end, 'MMMM d')}.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-200 font-medium">
                Consider Adjusting Timeline
              </span>
            </div>
            <p className="text-sm text-yellow-300">
              Based on recent seasonal data, planting conditions may not be optimal at this time. 
              The recommended planting window is from {format(optimalPlantingWindow?.start || lastFrostDate || now, 'MMMM d')} {' '}
              to {format(optimalPlantingWindow?.end || firstFrostDate || now, 'MMMM d')}.
            </p>
          </div>
        )}

        {!isFrostFree && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-900/30 rounded-lg p-4">
              <div className="text-sm text-emerald-400 mb-1">Last Frost Date</div>
              <div className="text-lg font-semibold text-emerald-200">
                {lastFrostDate ? format(lastFrostDate, 'MMMM d') : 'N/A'}
              </div>
            </div>
            <div className="bg-emerald-900/30 rounded-lg p-4">
              <div className="text-sm text-emerald-400 mb-1">First Frost Date</div>
              <div className="text-lg font-semibold text-emerald-200">
                {firstFrostDate ? format(firstFrostDate, 'MMMM d') : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};