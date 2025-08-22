import React, { useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { Search, ThermometerSun, Navigation, Clock, HelpCircle, AlertTriangle } from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import * as Tooltip from '@radix-ui/react-tooltip';
import { format } from 'date-fns';
import type { LocationData, GrowthParameters } from '../types';
import { getGrowingConditions } from '../services/weather';
import { getLocationFromZip } from '../services/location';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface LocationMapProps {
  location: LocationData | null;
  hoveredState: string;
  setHoveredState: (state: string) => void;
  onZipCodeSubmit: (zipCode: string) => void;
  onParametersChange: (params: GrowthParameters) => void;
}

export const LocationMap: React.FC<LocationMapProps> = ({ 
  location, 
  hoveredState, 
  setHoveredState,
  onZipCodeSubmit,
  onParametersChange
}) => {
  const [zipCode, setZipCode] = useState('');
  const [frostTolerance, setFrostTolerance] = useState(20);
  const [floweringWeeks, setFloweringWeeks] = useState(8);
  const [criticalPhotoperiodHours, setCriticalPhotoperiodHours] = useState(13);
  const [criticalPhotoperiodMinutes, setCriticalPhotoperiodMinutes] = useState(55);
  const [vegetativeWeeks, setVegetativeWeeks] = useState(4);
  const [isSearching, setIsSearching] = useState(false);
  const [growingConditions, setGrowingConditions] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [plantingDate, setPlantingDate] = useState({
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    year: new Date().getFullYear()
  });

  const validateDate = (month: number, day: number, year: number) => {
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && 
           date.getDate() === day && 
           date.getFullYear() === year &&
           year >= new Date().getFullYear();
  };

  const isValidDate = validateDate(plantingDate.month, plantingDate.day, plantingDate.year);

  const updateParameters = useCallback((updates: Partial<GrowthParameters>) => {
    if (!isValidDate) return;
    
    const date = new Date(plantingDate.year, plantingDate.month - 1, plantingDate.day);
    const criticalPhotoperiodThreshold = `${criticalPhotoperiodHours}:${criticalPhotoperiodMinutes.toString().padStart(2, '0')}`;
    const newParameters: GrowthParameters = {
      zipCode,
      plantingDate: date,
      floweringWeeks,
      frostRiskTolerance: frostTolerance,
      criticalPhotoperiodThreshold,
      vegetativeWeeks,
      ...updates
    };
    onParametersChange(newParameters);
  }, [zipCode, plantingDate, floweringWeeks, frostTolerance, criticalPhotoperiodHours, criticalPhotoperiodMinutes, vegetativeWeeks, isValidDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.length === 5 && isValidDate) {
      setIsSearching(true);
      setError(null);
      
      try {
        const locationData = await getLocationFromZip(zipCode);
        const conditions = await getGrowingConditions(locationData);
        setGrowingConditions(conditions);
        
        await onZipCodeSubmit(zipCode);
        updateParameters({});
      } catch (error) {
        console.error('Error fetching location data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch location data');
      } finally {
        setIsSearching(false);
      }
    }
  };

  const TooltipContent = ({ title, description }: { title: string; description: string }) => (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button className="ml-1 text-emerald-400 hover:text-emerald-300 focus:outline-none">
          <HelpCircle className="w-4 h-4" />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content
        className="bg-emerald-950 p-3 rounded-lg border border-emerald-800 max-w-xs"
        sideOffset={5}
      >
        <p className="text-sm text-emerald-200">
          <span className="font-semibold text-emerald-400">{title}:</span> {description}
        </p>
        <Tooltip.Arrow className="fill-emerald-800" />
      </Tooltip.Content>
    </Tooltip.Root>
  );

  return (
    <div className="bg-emerald-900/20 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-emerald-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm text-emerald-400">Location (ZIP Code)</label>
            <div className="relative">
              <Search className={`absolute left-3 top-2.5 h-5 w-5 text-emerald-500 ${isSearching ? 'animate-spin' : ''}`} />
              <input
                type="text"
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5));
                }}
                placeholder="Enter ZIP code"
                className="w-full pl-10 pr-4 py-2.5 bg-emerald-950 rounded-lg text-sm border border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100"
                maxLength={5}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-emerald-400">Planting Date</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="block text-xs text-emerald-500">Month</label>
                <input
                  type="number"
                  value={plantingDate.month}
                  onChange={(e) => {
                    const value = Math.min(12, Math.max(1, parseInt(e.target.value) || 1));
                    setPlantingDate(prev => ({ ...prev, month: value }));
                  }}
                  className="w-full px-3 py-2.5 bg-emerald-950 rounded-lg text-sm border border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100"
                  min="1"
                  max="12"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-emerald-500">Day</label>
                <input
                  type="number"
                  value={plantingDate.day}
                  onChange={(e) => {
                    const value = Math.min(31, Math.max(1, parseInt(e.target.value) || 1));
                    setPlantingDate(prev => ({ ...prev, day: value }));
                  }}
                  className="w-full px-3 py-2.5 bg-emerald-950 rounded-lg text-sm border border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100"
                  min="1"
                  max="31"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-emerald-500">Year</label>
                <input
                  type="number"
                  value={plantingDate.year}
                  onChange={(e) => {
                    const value = Math.max(new Date().getFullYear(), parseInt(e.target.value) || new Date().getFullYear());
                    setPlantingDate(prev => ({ ...prev, year: value }));
                  }}
                  className="w-full px-3 py-2.5 bg-emerald-950 rounded-lg text-sm border border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100"
                  min={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValidDate || zipCode.length !== 5 || isSearching}
            className={`h-full px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
              !isValidDate || zipCode.length !== 5 || isSearching
                ? 'bg-emerald-900 text-emerald-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {isSearching ? 'Processing...' : 'Calculate Growth Timeline'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <label className="text-sm text-emerald-300">Critical Photoperiod</label>
              <TooltipContent
                title="Critical Photoperiod"
                description="The critical photoperiod is the threshold of light exposure that triggers a plant's transition from vegetative growth (producing leaves) to reproductive growth (producing flowers)."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs text-emerald-500">Hours</label>
                <input
                  type="number"
                  value={criticalPhotoperiodHours}
                  onChange={(e) => {
                    const value = Math.min(24, Math.max(0, parseInt(e.target.value) || 0));
                    setCriticalPhotoperiodHours(value);
                    updateParameters({});
                  }}
                  className="w-full px-3 py-2.5 bg-emerald-950 rounded-lg text-sm border border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100"
                  min="0"
                  max="24"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-emerald-500">Minutes</label>
                <input
                  type="number"
                  value={criticalPhotoperiodMinutes}
                  onChange={(e) => {
                    const value = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                    setCriticalPhotoperiodMinutes(value);
                    updateParameters({});
                  }}
                  className="w-full px-3 py-2.5 bg-emerald-950 rounded-lg text-sm border border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100"
                  min="0"
                  max="59"
                />
              </div>
            </div>
            <p className="text-xs text-emerald-400 mt-1">
              If unsure, leave at 13 hours and 55 minutes
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <label className="text-sm text-emerald-300">Frost Risk Tolerance</label>
              <TooltipContent
                title="Frost Risk Tolerance"
                description="Higher tolerance allows planting closer to frost dates but increases risk. Lower tolerance provides a safer growing window but shorter season."
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <span className="text-sm font-medium text-emerald-100">
                  {frostTolerance}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={frostTolerance}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFrostTolerance(value);
                  updateParameters({ frostRiskTolerance: value });
                }}
                className="w-full h-[38px] bg-emerald-950 rounded-lg appearance-none cursor-pointer border border-emerald-800"
                style={{
                  background: `linear-gradient(to right, #059669 0%, #059669 ${frostTolerance}%, #064e3b ${frostTolerance}%, #064e3b 100%)`
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <label className="text-sm text-emerald-300">Flowering Duration</label>
              <TooltipContent
                title="Flowering Duration"
                description="The time of day when the light cycle begins. This helps calculate the exact timing of the photoperiod."
              />
            </div>
            <select
              value={floweringWeeks}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setFloweringWeeks(value);
                updateParameters({ floweringWeeks: value });
              }}
              className="w-full px-4 py-2.5 bg-emerald-950 rounded-lg text-sm border border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100"
            >
              {Array.from({ length: 9 }, (_, i) => i + 6).map(weeks => (
                <option key={weeks} value={weeks}>{weeks} weeks</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <label className="text-sm text-emerald-300">Vegetative Growth Period</label>
            <TooltipContent
              title="Vegetative Growth"
              description="The growth period before flowering begins. Longer vegetative periods result in larger plants but require earlier planting."
            />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <span className="text-sm font-medium text-emerald-100">
                {vegetativeWeeks} weeks
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={vegetativeWeeks}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setVegetativeWeeks(value);
                updateParameters({ vegetativeWeeks: value });
              }}
              className="w-full h-[38px] bg-emerald-950 rounded-lg appearance-none cursor-pointer border border-emerald-800"
              style={{
                background: `linear-gradient(to right, #059669 0%, #059669 ${(vegetativeWeeks - 2) * 16.67}%, #064e3b ${(vegetativeWeeks - 2) * 16.67}%, #064e3b 100%)`
              }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 text-red-400 p-4 rounded-lg border border-red-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </form>

      {location && (
        <div className="mt-6 bg-emerald-950/80 p-4 rounded-lg border border-emerald-800 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-900/50 rounded-lg">
              <Navigation className="h-5 w-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="text-sm text-emerald-400">Growing Location</div>
              <div className="text-lg font-semibold text-emerald-200">
                {location.city}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative h-[400px] mt-6 rounded-lg overflow-hidden bg-emerald-950 border border-emerald-800">
        <div className="absolute top-4 right-4 z-10 bg-emerald-950/90 p-4 rounded-lg border border-emerald-800 w-64 space-y-4">
          <div>
            <div className="text-sm text-emerald-300 mb-3">Growing Conditions</div>
            {location && growingConditions ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400">USDA Zone</span>
                    <span className="text-xs text-emerald-200">{growingConditions.usdaZone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400">Growing Season</span>
                    <span className="text-xs text-emerald-200">{growingConditions.growingDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400">Last Frost</span>
                    <span className="text-xs text-emerald-200">
                      {growingConditions.lastFrostDate ? format(growingConditions.lastFrostDate, 'MMM d') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400">First Frost</span>
                    <span className="text-xs text-emerald-200">
                      {growingConditions.firstFrostDate ? format(growingConditions.firstFrostDate, 'MMM d') : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-800">
                  <div className="text-xs text-emerald-300">
                    Optimal planting window: {format(growingConditions.optimalPlantingWindow.start, 'MMM d')} - {format(growingConditions.optimalPlantingWindow.end, 'MMM d')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-emerald-400">
                Enter ZIP code to view growing conditions
              </div>
            )}
          </div>
        </div>

        <ComposableMap 
          projection="geoAlbersUsa"
          projectionConfig={{ 
            scale: 1200,
            center: [-96, 38]
          }}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const state = geo.properties.name;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHoveredState(state)}
                    onMouseLeave={() => setHoveredState('')}
                    style={{
                      default: {
                        fill: "#065f46",
                        stroke: "#065f46",
                        strokeWidth: 0.5,
                        outline: "none",
                        opacity: 0.8,
                      },
                      hover: {
                        fill: "#047857",
                        stroke: "#10b981",
                        strokeWidth: 1,
                        outline: "none",
                        opacity: 1,
                      },
                      pressed: {
                        fill: "#047857",
                        stroke: "#10b981",
                        strokeWidth: 1,
                        outline: "none",
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
          {location && (
            <Marker coordinates={[location.lng, location.lat]}>
              <g transform="translate(-12, -24)">
                <path
                  d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0Z"
                  fill="#ef4444"
                  fillOpacity="0.8"
                  className="animate-pulse"
                />
                <circle cx="12" cy="7" r="3" fill="#FFFFFF" />
              </g>
              <text
                textAnchor="middle"
                y={-30}
                style={{
                  fontFamily: 'system-ui',
                  fill: '#ef4444',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))',
                }}
                className="animate-fadeIn"
              >
                {location.city}
              </text>
            </Marker>
          )}
        </ComposableMap>
      </div>
    </div>
  );
};

export default LocationMap;