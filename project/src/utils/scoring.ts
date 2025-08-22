import { differenceInDays } from 'date-fns';
import type { LocationData, PlantingScore, Achievement } from '../types';

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'early-planner',
    title: 'Early Planner',
    description: 'Plan your grow at least 30 days in advance',
    icon: '🎯'
  },
  {
    id: 'frost-dodger',
    title: 'Frost Dodger',
    description: 'Choose a planting date with minimal frost risk',
    icon: '❄️'
  },
  {
    id: 'light-master',
    title: 'Light Master',
    description: 'Optimize daylight hours for maximum growth',
    icon: '☀️'
  },
  {
    id: 'season-optimizer',
    title: 'Season Optimizer',
    description: 'Perfect timing within the growing season',
    icon: '📅'
  },
  {
    id: 'weather-watcher',
    title: 'Weather Watcher',
    description: 'Account for all weather conditions',
    icon: '🌤️'
  }
];

export function calculatePlantingScore(
  plantingDate: Date,
  lastFrostDate: Date,
  firstFrostDate: Date,
  daylightHours: number,
  location: LocationData
): PlantingScore {
  const now = new Date();
  const achievements: Achievement[] = [];
  
  // Calculate frost risk score (0-25)
  const daysToLastFrost = differenceInDays(plantingDate, lastFrostDate);
  const daysToFirstFrost = differenceInDays(firstFrostDate, plantingDate);
  const frostRisk = Math.min(25, Math.max(0, 
    25 * (daysToLastFrost > 0 ? 1 : 0.5) * 
    (daysToFirstFrost > 0 ? 1 : 0.5)
  ));

  if (frostRisk >= 20) {
    achievements.push({
      ...ACHIEVEMENTS.find(a => a.id === 'frost-dodger')!,
      unlockedAt: now
    });
  }

  // Calculate daylight optimization score (0-25)
  const optimalDaylight = 14; // hours
  const daylightDiff = Math.abs(daylightHours - optimalDaylight);
  const daylightOptimization = Math.min(25, Math.max(0, 
    25 * (1 - daylightDiff / optimalDaylight)
  ));

  if (daylightOptimization >= 20) {
    achievements.push({
      ...ACHIEVEMENTS.find(a => a.id === 'light-master')!,
      unlockedAt: now
    });
  }

  // Calculate season timing score (0-25)
  const growingDays = differenceInDays(firstFrostDate, lastFrostDate);
  const optimalStart = new Date(lastFrostDate.getTime() + (growingDays * 0.2) * 86400000);
  const optimalEnd = new Date(firstFrostDate.getTime() - (growingDays * 0.2) * 86400000);
  const seasonTiming = Math.min(25, Math.max(0,
    25 * (plantingDate >= optimalStart && plantingDate <= optimalEnd ? 1 : 0.5)
  ));

  if (seasonTiming >= 20) {
    achievements.push({
      ...ACHIEVEMENTS.find(a => a.id === 'season-optimizer')!,
      unlockedAt: now
    });
  }

  // Calculate weather conditions score (0-25)
  const weatherConditions = location.weatherPatterns?.reduce((score, pattern) => {
    const monthMatch = pattern.month === plantingDate.toLocaleString('default', { month: 'long' });
    if (!monthMatch) return score;
    
    const tempScore = pattern.avgTemp.high < 85 && pattern.avgTemp.low > 60 ? 10 : 5;
    const humidityScore = pattern.humidity.afternoon < 70 ? 10 : 5;
    const windScore = pattern.windSpeed.avg < 15 ? 5 : 2;
    
    return tempScore + humidityScore + windScore;
  }, 0) ?? 15;

  if (weatherConditions >= 20) {
    achievements.push({
      ...ACHIEVEMENTS.find(a => a.id === 'weather-watcher')!,
      unlockedAt: now
    });
  }

  // Early planner achievement
  const planningDays = differenceInDays(plantingDate, now);
  if (planningDays >= 30) {
    achievements.push({
      ...ACHIEVEMENTS.find(a => a.id === 'early-planner')!,
      unlockedAt: now
    });
  }

  return {
    total: frostRisk + daylightOptimization + seasonTiming + weatherConditions,
    breakdown: {
      frostRisk,
      daylightOptimization,
      seasonTiming,
      weatherConditions
    },
    achievements
  };
}