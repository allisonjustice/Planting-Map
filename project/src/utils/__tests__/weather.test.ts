import { getGrowingConditions } from '../../services/weather';
import type { LocationData } from '../../types';

describe('Weather Service Tests', () => {
  const mockLocation: LocationData = {
    lat: 40.7128,
    lng: -74.0060,
    city: 'New York, NY',
    state: 'New York',
    firstFrostDate: '2024-10-15T00:00:00.000Z',
    lastFrostDate: '2024-04-15T00:00:00.000Z'
  };

  test('getGrowingConditions returns valid data', async () => {
    const conditions = await getGrowingConditions(mockLocation);
    
    expect(conditions).toHaveProperty('usdaZone');
    expect(conditions).toHaveProperty('growingDays');
    expect(conditions).toHaveProperty('lastFrostDate');
    expect(conditions).toHaveProperty('firstFrostDate');
    expect(conditions).toHaveProperty('optimalPlantingWindow');
    
    expect(conditions.growingDays).toBeGreaterThan(0);
    expect(conditions.optimalPlantingWindow.start).toBeInstanceOf(Date);
    expect(conditions.optimalPlantingWindow.end).toBeInstanceOf(Date);
  });
});