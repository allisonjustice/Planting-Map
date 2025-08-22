import React from 'react';
import { format } from 'date-fns';
import { Thermometer, AlertTriangle } from 'lucide-react';

interface FrostDateVisualProps {
  firstFrostDate: Date;
  lastFrostDate: Date;
  plantingDate: Date;
  harvestDate: Date;
}

export const FrostDateVisual: React.FC<FrostDateVisualProps> = ({
  firstFrostDate,
  lastFrostDate,
  plantingDate,
  harvestDate
}) => {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31);
  
  const dateToPercent = (date: Date) => {
    const total = yearEnd.getTime() - yearStart.getTime();
    const position = date.getTime() - yearStart.getTime();
    return (position / total) * 100;
  };

  const isFrostRisk = (date: Date) => {
    const month = date.getMonth();
    return month < lastFrostDate.getMonth() || month > firstFrostDate.getMonth();
  };

  return (
    <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-800">
      <h3 className="text-lg font-semibold text-emerald-400 mb-4">Growing Season Timeline</h3>
      
      <div className="relative h-24">
        {/* Timeline base */}
        <div className="absolute w-full h-2 bg-emerald-950 rounded-full top-1/2 transform -translate-y-1/2" />
        
        {/* Frost periods */}
        <div 
          className="absolute h-2 bg-blue-500/30 rounded-l-full"
          style={{ 
            left: '0%',
            width: `${dateToPercent(lastFrostDate)}%`
          }}
        />
        <div 
          className="absolute h-2 bg-blue-500/30 rounded-r-full"
          style={{ 
            left: `${dateToPercent(firstFrostDate)}%`,
            width: '100%'
          }}
        />
        
        {/* Growing period */}
        <div 
          className="absolute h-2 bg-emerald-500 rounded-full"
          style={{ 
            left: `${dateToPercent(plantingDate)}%`,
            width: `${dateToPercent(harvestDate) - dateToPercent(plantingDate)}%`
          }}
        />
        
        {/* Date markers */}
        {[plantingDate, harvestDate].map((date, i) => (
          <div
            key={i}
            className="absolute transform -translate-x-1/2"
            style={{ left: `${dateToPercent(date)}%` }}
          >
            <div className="relative">
              <div className="absolute bottom-4 -translate-x-1/2 left-1/2">
                <div className="w-1 h-8 bg-emerald-500" />
              </div>
              <div className="absolute -bottom-8 -translate-x-1/2 left-1/2 whitespace-nowrap">
                <div className="bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800">
                  <div className="text-xs text-emerald-400">{i === 0 ? 'Plant' : 'Harvest'}</div>
                  <div className="text-sm text-emerald-200">{format(date, 'MMM d')}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Frost date markers */}
        {[
          { date: lastFrostDate, label: 'Last Frost' },
          { date: firstFrostDate, label: 'First Frost' }
        ].map((item, i) => (
          <div
            key={i}
            className="absolute transform -translate-x-1/2"
            style={{ left: `${dateToPercent(item.date)}%` }}
          >
            <div className="relative">
              <div className="absolute -top-16 -translate-x-1/2 left-1/2 whitespace-nowrap">
                <div className="bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-blue-400" />
                    <div className="text-xs text-blue-400">{item.label}</div>
                  </div>
                  <div className="text-sm text-emerald-200">{format(item.date, 'MMM d')}</div>
                </div>
              </div>
              <div className="absolute -top-4 -translate-x-1/2 left-1/2">
                <div className="w-1 h-8 bg-blue-400" />
              </div>
            </div>
          </div>
        ))}
        
        {/* Warning indicators for frost risk */}
        {isFrostRisk(plantingDate) && (
          <div 
            className="absolute -top-24 transform -translate-x-1/2"
            style={{ left: `${dateToPercent(plantingDate)}%` }}
          >
            <div className="flex items-center gap-2 bg-red-950/50 px-3 py-1 rounded-lg border border-red-800">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">Frost Risk</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};