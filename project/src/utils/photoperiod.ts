import SunCalc from 'suncalc';
import { addWeeks, addDays, differenceInDays } from 'date-fns';
import type { LocationData, PhotoperiodCalculation, WeeklyGrowthData } from '../types';

export function calculateDaylightHours(date: Date, latitude: number, longitude: number): number {
  const times = SunCalc.getTimes(date, latitude, longitude);
  const sunrise = times.sunrise;
  const sunset = times.sunset;
  const daylightHours = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
  return Number(daylightHours.toFixed(2));
}

export function parseTimeToHours(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + (minutes / 60);
}

function getFrostWarning(
  plantingDate: Date,
  lastFrostDate: Date | null,
  firstFrostDate: Date | null
): string | null {
  if (!lastFrostDate || !firstFrostDate) {
    return null;
  }

  const daysBeforeLastFrost = differenceInDays(lastFrostDate, plantingDate);
  const daysAfterFirstFrost = differenceInDays(plantingDate, firstFrostDate);
  
  if (daysBeforeLastFrost > 0) {
    return "CRITICAL: Planting date is before the last frost date. Plants will likely die if exposed to frost. Either start indoors or adjust your planting date.";
  } else if (daysAfterFirstFrost > 0) {
    return "CRITICAL: Planting date is after the first frost date. Plants will be killed by frost before harvest. Move planting date earlier or grow indoors.";
  }
  
  return null;
}

function findFlowerInitiationDate(
  startDate: Date,
  location: LocationData,
  criticalPhotoperiod: number
): Date {
  let currentDate = new Date(startDate);
  const endDate = addDays(startDate, 365);
  
  while (currentDate <= endDate) {
    const daylight = calculateDaylightHours(currentDate, location.lat, location.lng);
    if (daylight <= criticalPhotoperiod) {
      return currentDate;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return startDate;
}

export function calculatePhotoperiod(
  plantingDate: Date,
  location: LocationData,
  floweringWeeks: number,
  criticalPhotoperiodThreshold: string,
  frostRiskTolerance: number = 20
): PhotoperiodCalculation {
  const lastFrostDate = location.lastFrostDate ? new Date(location.lastFrostDate) : null;
  const firstFrostDate = location.firstFrostDate ? new Date(location.firstFrostDate) : null;
  
  const frostWarning = getFrostWarning(plantingDate, lastFrostDate, firstFrostDate);
  
  const criticalPhotoperiod = parseTimeToHours(criticalPhotoperiodThreshold);
  
  const floweringInitiationDate = findFlowerInitiationDate(
    plantingDate,
    location,
    criticalPhotoperiod
  );
  
  const estimatedHarvestDate = addWeeks(floweringInitiationDate, floweringWeeks);
  const daylightHours = calculateDaylightHours(new Date(), location.lat, location.lng);
  
  let harvestWarning = null;
  if (firstFrostDate && estimatedHarvestDate > firstFrostDate) {
    const daysAfterFrost = differenceInDays(estimatedHarvestDate, firstFrostDate);
    harvestWarning = `CRITICAL: Your estimated harvest date is ${daysAfterFrost} days after the first frost date. Frost will kill your plants before harvest, resulting in complete crop loss. Consider these options:\n\n1. Start earlier in the season\n2. Choose a faster-flowering variety\n3. Grow indoors or in a greenhouse\n4. Use frost protection methods (row covers, cold frames)`;
  }

  const totalWeeks = Math.ceil(
    (estimatedHarvestDate.getTime() - plantingDate.getTime()) / 
    (7 * 24 * 60 * 60 * 1000)
  );
  
  const weeklyData: WeeklyGrowthData[] = Array.from({ length: totalWeeks }, (_, i) => {
    const weekNumber = i + 1;
    const currentDate = addWeeks(plantingDate, i);
    const dayLength = calculateDaylightHours(currentDate, location.lat, location.lng);
    const stage = getGrowthStage(weekNumber, totalWeeks, floweringInitiationDate, currentDate);
    const conditions = getRecommendedConditions(stage);
    
    return {
      weekNumber,
      dayLength,
      developmentStage: stage,
      recommendedTemp: conditions.temp,
      recommendedHumidity: conditions.humidity,
      milestones: getMilestones(stage, weekNumber)
    };
  });

  const recommendations = [
    ...(frostWarning ? [frostWarning] : []),
    ...(harvestWarning ? [harvestWarning] : []),
    ...generateRecommendations(weeklyData)
  ];

  return {
    floweringInitiationDate,
    estimatedHarvestDate,
    plantingDate,
    daylightHours,
    weeklyData,
    flowerInitiationTime: criticalPhotoperiodThreshold,
    recommendations,
    criticalPhotoperiodThreshold: criticalPhotoperiod
  };
}

function getGrowthStage(
  weekNumber: number, 
  totalWeeks: number,
  floweringInitiationDate: Date,
  currentDate: Date
): 'Vegetative' | 'Early Flower' | 'Mid Flower' | 'Late Flower' {
  if (currentDate < floweringInitiationDate) return 'Vegetative';
  
  const floweringWeeks = Math.ceil(
    (currentDate.getTime() - floweringInitiationDate.getTime()) / 
    (7 * 24 * 60 * 60 * 1000)
  );
  
  if (floweringWeeks <= 2) return 'Early Flower';
  if (floweringWeeks <= 5) return 'Mid Flower';
  return 'Late Flower';
}

function getRecommendedConditions(stage: 'Vegetative' | 'Early Flower' | 'Mid Flower' | 'Late Flower') {
  switch (stage) {
    case 'Vegetative':
      return {
        temp: { day: 75, night: 70 },
        humidity: 65
      };
    case 'Early Flower':
      return {
        temp: { day: 75, night: 68 },
        humidity: 55
      };
    case 'Mid Flower':
      return {
        temp: { day: 73, night: 65 },
        humidity: 50
      };
    case 'Late Flower':
      return {
        temp: { day: 70, night: 65 },
        humidity: 45
      };
  }
}

function getMilestones(stage: string, weekNumber: number): string[] {
  const milestones: string[] = [];
  
  switch (stage) {
    case 'Vegetative':
      if (weekNumber === 1) milestones.push('Initial growth phase');
      if (weekNumber === 2) milestones.push('Root system development');
      break;
    case 'Early Flower':
      if (weekNumber === 1) milestones.push('Flower initiation');
      break;
    case 'Mid Flower':
      if (weekNumber === 4) milestones.push('Peak flowering');
      break;
    case 'Late Flower':
      if (weekNumber === 7) milestones.push('Final maturation');
      break;
  }
  
  return milestones;
}

function generateRecommendations(weeklyData: WeeklyGrowthData[]): string[] {
  const recommendations: string[] = [];
  
  const stages = weeklyData.map(week => week.developmentStage);
  const uniqueStages = Array.from(new Set(stages));
  
  uniqueStages.forEach(stage => {
    const conditions = getRecommendedConditions(stage);
    recommendations.push(
      `During ${stage} stage: Maintain temperature at ${conditions.temp.day}°F day / ${conditions.temp.night}°F night with ${conditions.humidity}% humidity`
    );
  });
  
  return recommendations;
}