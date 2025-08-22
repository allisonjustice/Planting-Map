import { z } from 'zod';
import type { LocationData } from '../types';

const zipResponseSchema = z.object({
  'post code': z.string(),
  country: z.string(),
  'country abbreviation': z.string(),
  places: z.array(z.object({
    'place name': z.string(),
    longitude: z.string(),
    latitude: z.string(),
    state: z.string(),
    'state abbreviation': z.string()
  })).min(1)
});

export async function getLocationFromZip(zipCode: string): Promise<LocationData> {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('ZIP code not found. Please check and try again.');
      }
      throw new Error('Failed to fetch location data. Please try again later.');
    }

    const data = await response.json();
    
    // Validate response data
    const validatedData = zipResponseSchema.parse(data);
    const place = validatedData.places[0];

    // Check for Alaska
    if (place['state abbreviation'] === 'AK') {
      throw new Error('This tool is not optimized for Alaska due to extreme daylight variations.');
    }

    return {
      city: `${place['place name']}, ${place['state abbreviation']}`,
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
      state: place.state,
      zipCode: zipCode
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid location data received from server');
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}