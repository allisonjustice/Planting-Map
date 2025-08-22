import React, { useState, useRef, useCallback } from 'react';
import { format, differenceInDays, addDays, subDays, addWeeks } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { Sun, Moon, Snowflake, Calendar, ChevronLeft, ChevronRight, GripHorizontal } from 'lucide-react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface DaylightChartProps {
  data: {
    date: Date;
    daylightHours: number;
    sunrise: string;
    sunset: string;
  }[];
  criticalPhotoperiod: number;
  lastFrostDate?: Date;
  firstFrostDate?: Date;
  flowerInitiationDate: Date;
  harvestDate: Date;
  plantingDate: Date;
  vegetativeWeeks: number;
  onPlantingDateChange: (date: Date) => void;
}

export const DaylightChart: React.FC<DaylightChartProps> = ({ 
  data,
  criticalPhotoperiod,
  lastFrostDate,
  firstFrostDate,
  flowerInitiationDate,
  harvestDate,
  plantingDate,
  vegetativeWeeks,
  onPlantingDateChange
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Calculate vegetative end date
  const vegetativeEndDate = addWeeks(plantingDate, vegetativeWeeks);

  // Format hours to hours and minutes (e.g., "13h 33m")
  const formatHoursToHM = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dayData = data.find(d => format(d.date, 'MMM d') === label);
      return (
        <div className="bg-emerald-950 p-4 rounded-lg border border-emerald-800">
          <p className="text-emerald-200 font-semibold mb-2">{format(dayData?.date || new Date(), 'MMMM d')}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Sunrise: {dayData?.sunrise}</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Sunset: {dayData?.sunset}</span>
            </div>
            <div className="text-emerald-300">
              Daylight: {formatHoursToHM(payload[0].value)}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!chartRef.current) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !chartRef.current) return;

    const chartBounds = chartRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartX;
    const daysPerPixel = 365 / chartBounds.width;
    const daysDelta = Math.round(deltaX * daysPerPixel);

    if (daysDelta !== 0) {
      const newDate = addDays(plantingDate, daysDelta);
      onPlantingDateChange(newDate);
      setDragStartX(e.clientX);
    }
  }, [isDragging, dragStartX, plantingDate, onPlantingDateChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDateAdjustment = (direction: 'forward' | 'backward') => {
    const newDate = direction === 'forward' 
      ? addDays(plantingDate, 1)
      : subDays(plantingDate, 1);
    onPlantingDateChange(newDate);
  };

  const daysToFlowering = differenceInDays(flowerInitiationDate, plantingDate);

  return (
    <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-emerald-400">Annual Daylight Pattern</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-emerald-300">Daylight Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400/50 rounded-full"></div>
            <span className="text-xs text-emerald-300">Vegetative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500/50 rounded-full"></div>
            <span className="text-xs text-emerald-300">Flowering</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <TooltipPrimitive.Provider>
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDateAdjustment('backward')}
                  className="p-2 hover:bg-emerald-900 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-emerald-400" />
                </button>
                <div className="flex items-center gap-2 bg-emerald-950 rounded-lg px-3 py-2 hover:bg-emerald-900/50 transition-colors">
                  <span className="text-sm text-emerald-400">Planting:</span>
                  <span className="text-sm text-emerald-200">{format(plantingDate, 'MMM d')}</span>
                  <GripHorizontal className="w-4 h-4 text-emerald-400" />
                </div>
                <button
                  onClick={() => handleDateAdjustment('forward')}
                  className="p-2 hover:bg-emerald-900 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-emerald-400" />
                </button>
              </div>
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Content
              className="bg-emerald-950 p-3 rounded-lg border border-emerald-800 max-w-xs"
              sideOffset={5}
            >
              <p className="text-sm text-emerald-200">
                Click and drag the green planting line in the chart or use the arrows to adjust your planting date
              </p>
              <TooltipPrimitive.Arrow className="fill-emerald-800" />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>

        <div className="flex items-center gap-2 bg-emerald-950 rounded-lg px-3 py-2">
          <span className="text-sm text-emerald-400">Vegetative End:</span>
          <span className="text-sm text-emerald-200">{format(vegetativeEndDate, 'MMM d')}</span>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950 rounded-lg px-3 py-2">
          <span className="text-sm text-emerald-400">Flowering:</span>
          <span className="text-sm text-emerald-200">{format(flowerInitiationDate, 'MMM d')}</span>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950 rounded-lg px-3 py-2">
          <span className="text-sm text-emerald-400">Harvest:</span>
          <span className="text-sm text-emerald-200">{format(harvestDate, 'MMM d')}</span>
        </div>
      </div>
      
      <div 
        className="h-80 relative" 
        ref={chartRef}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="daylightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="vegetativeActualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#065f46" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="floweringGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fdbb74" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#c2410c" stopOpacity={0.1}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
            
            <XAxis 
              dataKey={(v) => format(v.date, 'MMM d')}
              stroke="#34d399"
              tick={{ fill: '#34d399', fontSize: 12 }}
              tickLine={{ stroke: '#34d399' }}
              axisLine={{ stroke: '#34d399' }}
              interval={30}
            />
            
            <YAxis
              stroke="#34d399"
              tick={{ fill: '#34d399' }}
              tickLine={{ stroke: '#34d399' }}
              axisLine={{ stroke: '#34d399' }}
              domain={[8, 16]}
              ticks={[8, 10, 12, 14, 16]}
              tickFormatter={formatHoursToHM}
              label={{ 
                value: 'Hours of Daylight',
                angle: -90,
                position: 'insideLeft',
                fill: '#34d399',
                offset: 10
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />

            {/* Critical Photoperiod Line */}
            <ReferenceLine
              y={criticalPhotoperiod}
              stroke="#f87171"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: `Critical Photoperiod (${formatHoursToHM(criticalPhotoperiod)})`,
                position: 'topRight',
                fill: '#f87171',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />

            {/* Growth Stage Areas */}
            <ReferenceArea
              x1={format(plantingDate, 'MMM d')}
              x2={format(flowerInitiationDate, 'MMM d')}
              y1={8}
              y2={16}
              fill="url(#vegetativeActualGradient)"
              fillOpacity={0.2}
              strokeOpacity={0}
              label={{
                value: `${differenceInDays(flowerInitiationDate, plantingDate)} days vegetative`,
                position: 'center',
                fill: '#34d399',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
            <ReferenceArea
              x1={format(flowerInitiationDate, 'MMM d')}
              x2={format(harvestDate, 'MMM d')}
              y1={8}
              y2={16}
              fill="url(#floweringGradient)"
              fillOpacity={0.2}
              strokeOpacity={0}
            />

            {/* Date Lines */}
            {lastFrostDate && (
              <ReferenceLine
                x={format(lastFrostDate, 'MMM d')}
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'Last Frost',
                  position: 'top',
                  fill: '#a855f7',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
            )}
            {firstFrostDate && (
              <ReferenceLine
                x={format(firstFrostDate, 'MMM d')}
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'First Frost',
                  position: 'top',
                  fill: '#a855f7',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
            )}

            {/* Planting Date Line */}
            <ReferenceLine
              x={format(plantingDate, 'MMM d')}
              stroke="#10b981"
              strokeWidth={4}
              label={{
                value: 'Planting',
                position: 'top',
                fill: '#10b981',
                fontSize: 12,
                fontWeight: 'bold'
              }}
              className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            />

            <ReferenceLine
              x={format(flowerInitiationDate, 'MMM d')}
              stroke="#fde047"
              strokeWidth={2}
              label={{
                value: 'Flowering Start',
                position: 'top',
                fill: '#fde047',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />

            <ReferenceLine
              x={format(harvestDate, 'MMM d')}
              stroke="#fb923c"
              strokeWidth={2}
              label={{
                value: 'Harvest',
                position: 'top',
                fill: '#fb923c',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />

            <Area
              type="monotone"
              dataKey="daylightHours"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#daylightGradient)"
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6, fill: '#34d399' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 space-y-2 text-sm text-emerald-300">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Click and drag the green planting line or use arrows to adjust your planting date.</span>
        </div>
        <div className="flex items-center gap-2">
          <Snowflake className="w-4 h-4 text-purple-400" />
          <span>Purple lines show frost dates - plan your growing season between these dates.</span>
        </div>
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-emerald-400" />
          <span>The green line shows daylight hours throughout the year.</span>
        </div>
      </div>
    </div>
  );
};