export interface User {
  id: number;
  name: string;
  email: string;
  image: string;
}

export interface ImageGeneration {
  id: number;
  user_id: number;
  image_key: string;
  prompt: string;
  generated_at: string;
  model: string;
  hf_lora: string;
  prediction_log: any;
  prediction_id: string;
  prediction_status: string;
  replicate_image_url: string;
  is_deleted: boolean;
  is_favorite: boolean;
}

export interface Wallet {
  wallet_id: number;
  user_id: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  transaction_id: number;
  wallet_id: number;
  amount: number;
  transaction_type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

export interface GrowthPhase {
  name: string;
  daylightThreshold: number;
  duration: number;
}

export interface LocationData {
  lat: number;
  lng: number;
  city: string;
  state: string;
  zipCode: string;
  firstFrostDate?: string | null;
  lastFrostDate?: string | null;
  elevation?: number;
  terrain?: string;
  microclimate?: string;
  nearbyWaterBodies?: string[];
  weatherPatterns?: WeatherPattern[];
}

export interface WeatherPattern {
  month: string;
  avgTemp: {
    high: number;
    low: number;
  };
  precipitation: {
    rain: number;
    snow: number;
  };
  humidity: {
    morning: number;
    afternoon: number;
  };
  windSpeed: {
    avg: number;
    gusts: number;
  };
  commonConditions: string[];
  growingNotes: string[];
}

export interface WeeklyGrowthData {
  weekNumber: number;
  dayLength: number;
  developmentStage: 'Vegetative' | 'Early Flower' | 'Mid Flower' | 'Late Flower';
  recommendedTemp: {
    day: number;
    night: number;
  };
  recommendedHumidity: number;
  milestones?: string[];
}

export interface PhotoperiodCalculation {
  floweringInitiationDate: Date;
  estimatedHarvestDate: Date;
  plantingDate: Date;
  daylightHours: number;
  weeklyData: WeeklyGrowthData[];
  flowerInitiationTime: string;
  recommendations?: string[];
  criticalPhotoperiodThreshold: number;
}

export interface GrowthParameters {
  zipCode: string;
  plantingDate: Date;
  floweringWeeks: number;
  frostRiskTolerance: number;
  criticalPhotoperiodThreshold: string;
  vegetativeWeeks?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface PlantingScore {
  total: number;
  breakdown: {
    frostRisk: number;
    daylightOptimization: number;
    seasonTiming: number;
    weatherConditions: number;
  };
  achievements: Achievement[];
}