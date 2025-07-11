'use client'
import { useQuery } from '@tanstack/react-query';

export interface CitySearchResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface FormattedCityResult {
  id: string;
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  displayName: string;
}

// Fetch cities from OpenWeatherMap Geocoding API
const fetchCities = async (query: string): Promise<CitySearchResult[]> => {
  if (!query || query.length < 2) {
    return [];
  }
  
  const weatherKey = process.env.NEXT_PUBLIC_WEATHERKEY;
  if (!weatherKey) {
    throw new Error('Weather API key not found');
  }
  
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=8&appid=${weatherKey}`
  );
  
  if (!response.ok) {
    throw new Error(`City search failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data as CitySearchResult[];
};

// Format city results for display
const formatCityResults = (results: CitySearchResult[]): FormattedCityResult[] => {
  return results.map(city => {
    const displayName = city.state 
      ? `${city.name}, ${city.state}, ${city.country}`
      : `${city.name}, ${city.country}`;
    
    return {
      id: `${city.lat.toFixed(4)},${city.lon.toFixed(4)}`,
      name: city.name,
      state: city.state,
      country: city.country,
      lat: city.lat,
      lon: city.lon,
      displayName,
    };
  });
};

// Remove duplicate cities (same name and country)
const removeDuplicates = (cities: FormattedCityResult[]): FormattedCityResult[] => {
  const seen = new Set<string>();
  return cities.filter(city => {
    const key = `${city.name}-${city.country}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const useCitySearch = (query: string, enabled: boolean = true) => {
  const trimmedQuery = query.trim();
  
  const { data, isPending, error, isError } = useQuery({
    queryKey: ['citySearch', trimmedQuery],
    queryFn: () => fetchCities(trimmedQuery),
    enabled: enabled && trimmedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Format and deduplicate results
  const formattedResults = data ? removeDuplicates(formatCityResults(data)) : [];
  
  return {
    cities: formattedResults,
    isPending: isPending && trimmedQuery.length >= 2,
    error,
    isError,
    hasResults: formattedResults.length > 0,
    isEmpty: !isPending && trimmedQuery.length >= 2 && formattedResults.length === 0,
  };
};

export default useCitySearch; 