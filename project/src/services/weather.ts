import { LocationData } from '../types';
import SunCalc from 'suncalc';

// Helper function to calculate frost dates based on latitude and climate data
const calculateFrostDates = (lat: number, lng: number) => {
  // More accurate frost date calculation based on latitude and regional climate
  const year = new Date().getFullYear();
  
  if (lat < 29) {
    // Tropical/subtropical zones (most of Florida) - no frost
    return { 
      lastFrostDate: null, 
      firstFrostDate: null,
      isFrostFree: true 
    };
  }
  
  let lastFrostDate: Date;
  let firstFrostDate: Date;
  
  if (lat < 30) {
    // Warm temperate (North Florida)
    lastFrostDate = new Date(year, 1, 15);  // February 15
    firstFrostDate = new Date(year, 11, 15); // December 15
  } else if (lat < 35) {
    // Mid temperate (e.g., North Florida, South Georgia)
    lastFrostDate = new Date(year, 2, 15);  // March 15
    firstFrostDate = new Date(year, 10, 15); // November 15
  } else if (lat < 40) {
    // Cool temperate (e.g., Mid-Atlantic)
    lastFrostDate = new Date(year, 3, 15);  // April 15
    firstFrostDate = new Date(year, 9, 15);  // October 15
  } else if (lat < 45) {
    // Northern temperate (e.g., New England)
    lastFrostDate = new Date(year, 4, 1);   // May 1
    firstFrostDate = new Date(year, 8, 30);  // September 30
  } else {
    // Northern (e.g., Northern Maine)
    lastFrostDate = new Date(year, 4, 15);  // May 15
    firstFrostDate = new Date(year, 8, 15);  // September 15
  }

  return { 
    lastFrostDate, 
    firstFrostDate,
    isFrostFree: false
  };
};

// Calculate USDA Hardiness Zone more accurately
const calculateUSDAZone = (lat: number, lng: number): string => {
  // Base calculation on latitude with adjustments
  const baseZone = 13 - Math.floor((lat - 25) / 5);
  
  // Adjust for elevation and coastal effects (simplified)
  const coastalEffect = Math.abs(lng) < 100 ? 0.5 : 0;
  const adjustedZone = baseZone + coastalEffect;
  
  // Ensure zone is within valid range (1-13)
  const finalZone = Math.min(13, Math.max(1, Math.round(adjustedZone)));
  
  // Convert to USDA zone format (e.g., "7b")
  const subzone = adjustedZone - Math.floor(adjustedZone) < 0.5 ? 'a' : 'b';
  return `${finalZone}${subzone}`;
};

export async function getFrostDates(location: LocationData) {
  return calculateFrostDates(location.lat, location.lng);
}

export async function getCurrentWeather(location: LocationData) {
  const now = new Date();
  const times = SunCalc.getTimes(now, location.lat, location.lng);
  
  // Calculate more realistic temperature based on time of day and latitude
  const hourOfDay = now.getHours();
  const baseTemp = 70; // Base temperature
  const tempVariation = 15; // Daily temperature variation
  const latitudeEffect = (location.lat - 40) * 0.5; // Temperature adjustment for latitude
  
  // Temperature curve throughout the day
  const timeEffect = Math.sin((hourOfDay - 6) * Math.PI / 12) * tempVariation;
  const temp = baseTemp + timeEffect - latitudeEffect;

  return {
    temp: Math.round(temp),
    humidity: 45 + Math.round(Math.random() * 20), // More realistic humidity range
    windSpeed: Math.round(5 + Math.random() * 10),
    description: "Partly cloudy",
    sunrise: times.sunrise,
    sunset: times.sunset,
    daylightHours: (times.sunset.getTime() - times.sunrise.getTime()) / (1000 * 60 * 60)
  };
}

export async function getWeatherForecast(location: LocationData) {
  const baseTemp = 70 - (location.lat - 40) * 0.5; // Adjust base temperature for latitude
  
  return Array.from({ length: 10 }, (_, i) => {
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    const dayTemp = baseTemp + Math.random() * 10;
    
    return {
      date,
      temp: {
        min: Math.round(dayTemp - 15 + Math.random() * 5),
        max: Math.round(dayTemp + 10 + Math.random() * 5),
        day: Math.round(dayTemp),
        night: Math.round(dayTemp - 12 + Math.random() * 5)
      },
      humidity: Math.round(40 + Math.random() * 20),
      description: "Partly cloudy",
      windSpeed: Math.round(5 + Math.random() * 10),
      precipitation: Math.round(Math.random() * 100) / 100
    };
  });
}

export async function getGrowingConditions(location: LocationData) {
  const frostDates = await getFrostDates(location);
  const usdaZone = calculateUSDAZone(location.lat, location.lng);
  
  // Handle frost-free zones
  if (frostDates.isFrostFree) {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31);
    
    return {
      usdaZone,
      growingDays: 365,
      lastFrostDate: null,
      firstFrostDate: null,
      isFrostFree: true,
      optimalPlantingWindow: {
        start: yearStart,
        end: yearEnd
      },
      weatherPatterns: [
        {
          month: "Year-round",
          avgTemp: { high: 85, low: 65 },
          precipitation: { rain: 4, snow: 0 },
          humidity: { morning: 80, afternoon: 60 },
          windSpeed: { avg: 8, gusts: 15 },
          commonConditions: ["Warm", "Humid"],
          growingNotes: ["Monitor humidity levels", "Ensure good air circulation"]
        }
      ]
    };
  }

  const { lastFrostDate, firstFrostDate } = frostDates;
  
  // Calculate growing days between frost dates
  const growingDays = Math.round(
    (firstFrostDate.getTime() - lastFrostDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate optimal planting window
  const optimalStart = new Date(lastFrostDate);
  optimalStart.setDate(lastFrostDate.getDate() + 14); // 2 weeks after last frost
  
  const optimalEnd = new Date(firstFrostDate);
  optimalEnd.setDate(firstFrostDate.getDate() - 120); // 4 months before first frost
  
  // Generate monthly weather patterns
  const weatherPatterns = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i, 1).toLocaleString('default', { month: 'long' });
    const isGrowingSeason = i >= lastFrostDate.getMonth() && i <= firstFrostDate.getMonth();
    
    const baseTemp = 60 + (i - 6) * 5; // Temperature curve throughout the year
    const latitudeEffect = (location.lat - 40) * 0.5;
    
    return {
      month,
      avgTemp: {
        high: Math.round(baseTemp + 15 - latitudeEffect),
        low: Math.round(baseTemp - 10 - latitudeEffect)
      },
      precipitation: {
        rain: 2 + Math.random() * 2,
        snow: i < 2 || i > 10 ? Math.random() * 2 : 0
      },
      humidity: {
        morning: Math.round(70 + Math.random() * 10),
        afternoon: Math.round(50 + Math.random() * 10)
      },
      windSpeed: {
        avg: Math.round(8 + Math.random() * 4),
        gusts: Math.round(15 + Math.random() * 10)
      },
      commonConditions: isGrowingSeason 
        ? ["Warm", "Moderate humidity"]
        : ["Cool", "Variable conditions"],
      growingNotes: isGrowingSeason
        ? ["Optimal growing conditions", "Monitor water needs"]
        : ["Outside main growing season", "Consider indoor growing"]
    };
  });

  return {
    usdaZone,
    growingDays,
    lastFrostDate,
    firstFrostDate,
    isFrostFree: false,
    optimalPlantingWindow: {
      start: optimalStart,
      end: optimalEnd
    },
    weatherPatterns
  };
}