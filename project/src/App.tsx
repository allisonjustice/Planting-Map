import React, { useState, useEffect } from 'react';
import { FlaskRound as Flask, Dna } from 'lucide-react';
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
  const [currentWeather, setCurrentWeather] = useState(null);
  const [daylightData, setDaylightData] = useState<any[]>([]);
  const [growingConditions, setGrowingConditions] = useState<any>(null);
  const [growthParameters, setGrowthParameters] = useState<GrowthParameters>({
    zipCode: '',
    plantingDate: new Date(),
    floweringWeeks: 8,
    frostRiskTolerance: 20,
    criticalPhotoperiodThreshold: '13:55',
    vegetativeWeeks: 4
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
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      const data = await response.json();
      
      if (data && data.places && data.places[0]) {
        const locationData: LocationData = {
          lat: parseFloat(data.places[0].latitude),
          lng: parseFloat(data.places[0].longitude),
          city: `${data.places[0]['place name']}, ${data.places[0]['state abbreviation']}`,
          state: data.places[0]['state']
        };

        const [frostDates, forecast, weather, conditions] = await Promise.all([
          getFrostDates(locationData),
          getWeatherForecast(locationData),
          getCurrentWeather(locationData),
          getGrowingConditions(locationData)
        ]);
        
        const updatedLocation = {
          ...locationData,
          firstFrostDate: frostDates.firstFrostDate?.toISOString() || null,
          lastFrostDate: frostDates.lastFrostDate?.toISOString() || null,
          weatherPatterns: conditions.weatherPatterns
        };
        
        setLocation(updatedLocation);
        setWeatherForecast(forecast);
        setCurrentWeather(weather);
        setGrowingConditions(conditions);

        updatePhotoperiodCalculations(updatedLocation, growthParameters);

        // Generate annual daylight data for current year
        const yearDaylightData = Array.from({ length: 365 }, (_, index) => {
          const date = new Date();
          date.setMonth(0, 1); // Set to January 1st of current year
          date.setDate(date.getDate() + index);
          const times = SunCalc.getTimes(date, locationData.lat, locationData.lng);
          const daylightHours = (times.sunset.getTime() - times.sunrise.getTime()) / (1000 * 60 * 60);
          
          return {
            date,
            daylightHours,
            sunrise: times.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: times.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        });

        setDaylightData(yearDaylightData);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
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
              <img src="https://i.imgur.com/sndGywi.jpeg" alt="CRC Logo" className="w-12 h-12 logo" />
              <div className="p-3 bg-emerald-900/20 rounded-xl border border-emerald-800 animate-pulse">
                <Flask className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight blueprint-text">
                Calculate Growth Timeline
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
        </header>

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
                    photoperiod: photoperiodData?.daylightHours || 0,
                    temperature: forecast.temp.day,
                    humidity: forecast.humidity,
                    description: forecast.description
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
                onPlantingDateChange={(date) => handleGrowthParametersChange({
                  ...growthParameters,
                  plantingDate: date
                })}
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
      </div>
    </Tooltip.Provider>
  );
}

export default App;