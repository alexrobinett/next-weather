'use client'
import { useQuery } from "@tanstack/react-query";

export interface CityData {
    name: string;
    state?: string;
    country?: string;
}

async function fetchCityName(lat: number, lon: number): Promise<string> {
    const weatherKey = process.env.NEXT_PUBLIC_WEATHERKEY;
    if (!weatherKey) {
        throw new Error('Weather API key not found');
    }
    
    const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${weatherKey}`
    );
    
    if (!response.ok) {
        throw new Error('Failed to fetch city name');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
        const location = data[0] as CityData;
        const name = location?.name || 'Unknown';
        const state = location?.state ? `, ${location.state}` : '';
        const country = location?.country ? `, ${location.country}` : '';
        return `${name}${state}${country}`;
    }
    
    return 'Unknown Location';
}

const useCityName = (lat?: number, lon?: number) => {
    const { data, isPending, error } = useQuery({
        queryKey: ["cityName", lat, lon],
        queryFn: () => fetchCityName(lat!, lon!),
        enabled: lat !== undefined && lon !== undefined,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
    
    return { data, isPending, error };
};

export default useCityName; 