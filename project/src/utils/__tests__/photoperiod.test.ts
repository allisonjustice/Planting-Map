import { calculatePhotoperiod, calculateDaylightHours } from '../photoperiod';
import type { LocationData } from '../../types';

describe('Photoperiod Calculations', () => {
  const mockLocation: LocationData = {
    lat: 40.7128,
    lng: -74.0060,
    city: 'New York, NY',
    state: 'New York',
    firstFrostDate: '2024-10-15T00:00:00.000Z',
    lastFrostDate: '2024-04-15T00:00:00.000Z'
  };

  test('calculateDaylightHours returns valid hours', () => {
    const date = new Date('2024-06-21'); // Summer solstice
    const hours = calculateDaylightHours(date, mockLocation.lat, mockLocation.lng);
    expect(hours).toBeGreaterThan(0);
    expect(hours).toBeLessThan(24);
  });

  test('calculatePhotoperiod returns valid growth timeline', () => {
    const plantingDate = new Date('2024-05-01');
    const flowerInitiationTime = '18:00';
    const floweringWeeks = 8;
    const frostRiskTolerance = 20;

    const result = calculatePhotoperiod(
      plantingDate,
      mockLocation,
      floweringWeeks,
      flowerInitiationTime,
      frostRiskTolerance
    );

    expect(result.plantingDate).toBeInstanceOf(Date);
    expect(result.floweringInitiationDate).toBeInstanceOf(Date);
    expect(result.estimatedHarvestDate).toBeInstanceOf(Date);
    expect(result.daylightHours).toBeGreaterThan(0);
    expect(result.weeklyData.length).toBe(Math.ceil(floweringWeeks * 1.4)); // Including veg time
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  test('frost risk tolerance affects planting date', () => {
    const plantingDate = new Date('2024-04-01'); // Before last frost
    const flowerInitiationTime = '18:00';
    const floweringWeeks = 8;

    const lowRiskResult = calculatePhotoperiod(
      plantingDate,
      mockLocation,
      floweringWeeks,
      flowerInitiationTime,
      10 // Conservative
    );

    const highRiskResult = calculatePhotoperiod(
      plantingDate,
      mockLocation,
      floweringWeeks,
      flowerInitiationTime,
      90 // Aggressive
    );

    // High risk tolerance should allow earlier planting
    expect(lowRiskResult.plantingDate.getTime())
      .toBeGreaterThan(highRiskResult.plantingDate.getTime());
  });
});