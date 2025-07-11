'use client'
import { useQuery } from '@tanstack/react-query';

export interface AirQualityData {
  coord: {
    lon: number;
    lat: number;
  };
  list: [
    {
      main: {
        aqi: number; // Air Quality Index: 1-5 (1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor)
      };
      components: {
        co: number;    // Carbon monoxide μg/m³
        no: number;    // Nitrogen monoxide μg/m³
        no2: number;   // Nitrogen dioxide μg/m³
        o3: number;    // Ozone μg/m³
        so2: number;   // Sulphur dioxide μg/m³
        pm2_5: number; // Fine particles matter μg/m³
        pm10: number;  // Coarse particulate matter μg/m³
        nh3: number;   // Ammonia μg/m³
      };
      dt: number; // Date and time, Unix, UTC
    }
  ];
}

export interface AQIInfo {
  index: number;
  level: string;
  description: string;
  color: string;
  bgColor: string;
  healthRecommendations: string[];
  icon: string;
}

// Get AQI information with health recommendations
const getAQIInfo = (aqi: number): AQIInfo => {
  switch (aqi) {
    case 1:
      return {
        index: aqi,
        level: 'Good',
        description: 'Air quality is excellent',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        healthRecommendations: [
          'Perfect day for outdoor activities',
          'Ideal for exercise and sports',
          'All groups can enjoy outdoor activities'
        ],
        icon: '😊'
      };
    case 2:
      return {
        index: aqi,
        level: 'Fair',
        description: 'Air quality is acceptable',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        healthRecommendations: [
          'Good day for most outdoor activities',
          'Sensitive individuals should limit prolonged exposure',
          'Consider reducing outdoor exercise intensity'
        ],
        icon: '🙂'
      };
    case 3:
      return {
        index: aqi,
        level: 'Moderate',
        description: 'Air quality is moderate',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
        healthRecommendations: [
          'Sensitive groups should reduce outdoor activities',
          'Consider wearing a mask during outdoor exercise',
          'Limit prolonged outdoor exertion'
        ],
        icon: '😐'
      };
    case 4:
      return {
        index: aqi,
        level: 'Poor',
        description: 'Air quality is poor',
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        healthRecommendations: [
          'Avoid outdoor activities',
          'Stay indoors with windows closed',
          'Use air purifiers if available',
          'Wear N95 masks if you must go outside'
        ],
        icon: '😷'
      };
    case 5:
      return {
        index: aqi,
        level: 'Very Poor',
        description: 'Air quality is hazardous',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
        healthRecommendations: [
          'Stay indoors at all times',
          'Keep windows and doors closed',
          'Use high-efficiency air purifiers',
          'Seek medical attention if experiencing symptoms',
          'Avoid all outdoor activities'
        ],
        icon: '☠️'
      };
    default:
      return {
        index: 0,
        level: 'Unknown',
        description: 'Air quality data unavailable',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
        healthRecommendations: ['Air quality data is currently unavailable'],
        icon: '❓'
      };
  }
};

// Get pollutant level description
const getPollutantLevel = (value: number, type: 'pm2_5' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co'): string => {
  const thresholds = {
    pm2_5: [12, 35, 55, 150], // WHO guidelines
    pm10: [25, 50, 90, 180],
    o3: [60, 100, 140, 180],
    no2: [40, 80, 180, 280],
    so2: [20, 80, 250, 500],
    co: [4000, 9000, 15000, 30000],
  } as const;
  
  const levels = ['Low', 'Moderate', 'High', 'Very High', 'Extremely High'] as const;
  const threshold = thresholds[type];
  
  for (let i = 0; i < threshold.length; i++) {
    if (value <= threshold[i]) {
      return levels[i];
    }
  }
  
  return levels[levels.length - 1];
};

// Fetch air quality data
const fetchAirQuality = async (lat: number, lon: number): Promise<AirQualityData> => {
  const weatherKey = process.env.NEXT_PUBLIC_WEATHERKEY;
  if (!weatherKey) {
    throw new Error('Weather API key not found');
  }
  
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Air quality data fetch failed: ${response.statusText}`);
  }
  
  return response.json() as Promise<AirQualityData>;
};

const useAirQuality = (lat?: number, lon?: number) => {
  const { data, isPending, error, isError } = useQuery({
    queryKey: ['airQuality', lat, lon],
    queryFn: () => fetchAirQuality(lat!, lon!),
    enabled: lat !== undefined && lon !== undefined,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  const currentData = data?.list[0];
  const aqiInfo = currentData ? getAQIInfo(currentData.main.aqi) : null;
  
  // Format pollutant data with levels
  const pollutants = currentData ? {
    pm2_5: {
      value: currentData.components.pm2_5,
      level: getPollutantLevel(currentData.components.pm2_5, 'pm2_5'),
      name: 'PM2.5',
      unit: 'μg/m³'
    },
    pm10: {
      value: currentData.components.pm10,
      level: getPollutantLevel(currentData.components.pm10, 'pm10'),
      name: 'PM10',
      unit: 'μg/m³'
    },
    o3: {
      value: currentData.components.o3,
      level: getPollutantLevel(currentData.components.o3, 'o3'),
      name: 'Ozone',
      unit: 'μg/m³'
    },
    no2: {
      value: currentData.components.no2,
      level: getPollutantLevel(currentData.components.no2, 'no2'),
      name: 'NO₂',
      unit: 'μg/m³'
    },
    so2: {
      value: currentData.components.so2,
      level: getPollutantLevel(currentData.components.so2, 'so2'),
      name: 'SO₂',
      unit: 'μg/m³'
    },
    co: {
      value: currentData.components.co,
      level: getPollutantLevel(currentData.components.co, 'co'),
      name: 'CO',
      unit: 'μg/m³'
    }
  } : null;
  
  return {
    data: currentData,
    aqiInfo,
    pollutants,
    isPending,
    error,
    isError,
    lastUpdated: currentData ? new Date(currentData.dt * 1000) : null,
  };
};

export default useAirQuality; 