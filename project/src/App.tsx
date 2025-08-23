import React, { useState } from 'react';
import { FlaskRound as Flask, Dna, AlertTriangle, Loader2 } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import SunCalc from 'suncalc';
import { LocationMap } from './components/LocationMap';
import { PhotoperiodAnalysis } from './components/PhotoperiodAnalysis';
import { WeatherMetrics } from './components/WeatherMetrics';
import { WeatherForecast } from './components/WeatherForecast';
import { WeatherPatterns } from './components/WeatherPatterns';
import { DaylightChart } from './components/DaylightChart';
import { PlantingConditions } from './components/PlantingConditions';
import { calculatePhotoperiod, parseTimeToHours } from './utils/photoperiod';
import { getFrostDates, getWeatherForecast, getCurrentWeather, getGrowingConditions } from './services/weather';
import type { LocationData, GrowthParameters, PhotoperiodCalculation, WeatherForecast as WeatherForecastType } from './types';

function App() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [hoveredState, setHoveredState] = useState('');
  const [photoperiodData, setPhotoperiodData] = useState<PhotoperiodCalculation | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecastType[]>([]);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [daylightData, setDaylightData] = useState<any[]>([]);
  const [growingConditions, setGrowingConditions] = useState<any>(null);

  // NEW: simple UX states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [growthParameters, setGrowthParameters] = useState<GrowthParameters>({
    zipCode: '',
    plantingDate: new Date(),
    floweringWeeks: 8,
    frostRiskTolerance: 20,
    criticalPhotoperiodThreshold: '13:55',
    vegetativeWeeks: 4,
  });

  const updatePhotoperiodCalculations = (locationData: LocationData, parameters: GrowthParameters) => {
    const photoperiod = calculatePhotoperiod(
      parameters.plantingDate,
      locationData,
      parameters.floweringWeeks,
      parameters.criticalPhotoperiodThreshold,
      parameters.frostRiskTolerance
    );
    setPhotoperiodData(photoperiod);
  };

  const handleLocationSubmit = async (zipCode: string) => {
    // quick guard
    if (!zipCode || zipCode.trim().length !== 5) {
      setErrorMsg('Please enter a valid 5-digit ZIP code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const resp = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      if (!resp.ok) {
        throw new Error(`ZIP lookup failed (${resp.status})`);
      }
      const data = await resp.json();

      if (!data?.places?.[0]) {
        throw new Error('ZIP code not found.');
      }

      const locationData: LocationData = {
        lat: parseFloat(data.places[0].latitude),
        lng: parseFloat(data.places[0].longitude),
        city: `${data.places[0]['place name']}, ${data.places[0]['state abbreviation']}`,
        state: data.places[0]['state'],
      };

      const [frostDates, forecast, weather, conditions] = await Promise.all([
        getFrostDates(locationData),
        getWeatherForecast(locationData),
        getCurrentWeather(locationData),
        getGrowingConditions(locationData),
      ]);

      const updatedLocation = {
        ...locationData,
        firstFrostDate: frostDates.firstFrostDate?.toISOString() || null,
        lastFrostDate: frostDates.lastFrostDate?.toISOString() || null,
        weatherPatterns: conditions.weatherPatterns,
      };

      setLocation(updatedLocation);
      setWeatherForecast(forecast || []);
      setCurrentWeather(weather || null);
      setGrowingConditions(conditions || null);

      updatePhotoperiodCalculations(updatedLocation, growthParameters);

      // Generate annual daylight data for the current year
      const jan1 = new Date(new Date().getFullYear(), 0, 1);
      const yearDaylightData = Array.from({ length: 365 }, (_, index) => {
        const date = new Date(jan1);
        date.setDate(jan1.getDate() + index);
        const times = SunCalc.getTimes(date, locationData.lat, locationData.lng);
        const daylightHours = (times.sunset.getTime() - times.sunrise.getTime()) / (1000 * 60 * 60);

        return {
          date,
          daylightHours,
          sunrise: times.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sunset: times.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });

      setDaylightData(yearDaylightData);
    } catch (err: any) {
      console.error('Error fetching location data:', err);
      setErrorMsg(err?.message || 'Something went wrong fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleGrowthParametersChange = (newParameters: GrowthParameters) => {
    setGrowthParameters(newParameters);
    if (location) {
      updatePhotoperiodCalculations(location, newParameters);
    }
    if (newParameters.zipCode && newParameters.zipCode.length === 5) {
      handleLocationSubmit(newParameters.zipCode);
    }
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="min-h-screen blueprint-bg text-emerald-50 p-6">
        <header className="flex items-center justify-between mb-8 blueprint-container rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Replace this image with your own brand asset if desired */}
              <img
                src="https://i.imgur.com/sndGywi.jpeg"
                alt="CRC Logo"
                className="w-12 h-12 logo rounded-md"
              />
              <div className="p-3 bg-emerald-900/20 rounded-xl border border-emerald-800 animate-pulse">
                <Flask className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <div>
              {/* VISIBLE CHANGE: new title text */}
              <h1 className="text-2xl font-bold tracking-tight blueprint-text">
                🌱 Planting Map & Growth Timeline
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm technical-readout">
                <span className="flex items-center gap-1">
                  <Dna className="w-4 h-4" />
                  Plant Calculator by CRC Cannabis Research Center & Coalition
                </span>
                <span className="text-emerald-700">|</span>
                <span className="font-mono">v2.1.0</span>
              </div>
            </div>
          </div>

          {/* NEW: small status chip for loading */}
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-900/30 border border-emerald-800">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Fetching data…</span>
            </div>
          )}
        </header>

        {/* NEW: inline error display */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-800">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm">{errorMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          <LocationMap
            location={location}
            hoveredState={hoveredState}
            setHoveredState={setHoveredState}
            onZipCodeSubmit={handleLocationSubmit}
            onParametersChange={handleGrowthParametersChange}
          />

          {location && currentWeather && (
            <>
              <PlantingConditions
                lastFrostDate={location.lastFrostDate ? new Date(location.lastFrostDate) : null}
                firstFrostDate={location.firstFrostDate ? new Date(location.firstFrostDate) : null}
                currentTemp={currentWeather.temp}
                optimalPlantingWindow={growingConditions?.optimalPlantingWindow}
              />

              {photoperiodData && (
                <PhotoperiodAnalysis
                  photoperiodData={photoperiodData}
                  growthData={weatherForecast.map((forecast, index) => ({
                    day: index,
                    // Note: if you want day-specific photoperiod, wire in per-day values here
                    photoperiod: photoperiodData?.daylightHours || 0,
                    temperature: forecast.temp.day,
                    humidity: forecast.humidity,
                    description: forecast.description,
                  }))}
                />
              )}

              <DaylightChart
                data={daylightData}
                criticalPhotoperiod={parseTimeToHours(growthParameters.criticalPhotoperiodThreshold)}
                lastFrostDate={location.lastFrostDate ? new Date(location.lastFrostDate) : undefined}
                firstFrostDate={location.firstFrostDate ? new Date(location.firstFrostDate) : undefined}
                flowerInitiationDate={photoperiodData?.floweringInitiationDate || new Date()}
                harvestDate={photoperiodData?.estimatedHarvestDate || new Date()}
                plantingDate={growthParameters.plantingDate}
                vegetativeWeeks={growthParameters.vegetativeWeeks || 4}
                onPlantingDateChange={(date) =>
                  handleGrowthParametersChange({
                    ...growthParameters,
                    plantingDate: date,
                  })
                }
              />

              <WeatherMetrics currentWeather={currentWeather} />
              <WeatherPatterns
                patterns={location.weatherPatterns || []}
                plantingDate={growthParameters.plantingDate}
                harvestDate={photoperiodData?.estimatedHarvestDate}
              />
              <WeatherForecast forecast={weatherForecast} />
            </>
          )}
        </div>

        {/* Optional tiny footer */}
        <footer className="mt-10 text-xs text-emerald-400/70">
          <span>Built with Vite + React · Data powered by your location inputs</span>
        </footer>
      </div>
    </Tooltip.Provider>
  );
}

export default App;
