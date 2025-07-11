
import { useQuery } from "@tanstack/react-query";
import NEXT_PUBLIC_WEATHERKEY from "next.config";

export interface WeatherData {
    lat: number;
    lon: number;
    timezone: string;
    timezone_offset: number;
    current: {
        dt: number;
        sunrise: number;
        sunset: number;
        temp: number;
        feels_like: number;
        pressure: number;
        humidity: number;
        dew_point: number;
        uvi: number;
        clouds: number;
        visibility: number;
        wind_speed: number;
        wind_deg: number;
        wind_gust: number;
        weather: {
            id: number;
            main: string;
            description: string;
            icon: string;
        }[];
    };
    minutely: {
        dt: number;
        precipitation: number;
    }[];
    hourly: {
        dt: number;
        temp: number;
        feels_like: number;
        pressure: number;
        humidity: number;
        dew_point: number;
        uvi: number;
        clouds: number;
        visibility: number;
        wind_speed: number;
        wind_deg: number;
        wind_gust: number;
        weather: {
            id: number;
            main: string;
            description: string;
            icon: string;
        }[];
        pop: number;
    }[];
    daily: {
        dt: number;
        sunrise: number;
        sunset: number;
        moonrise: number;
        moonset: number;
        moon_phase: number;
        summary: string;
        temp: {
            day: number;
            min: number;
            max: number;
            night: number;
            eve: number;
            morn: number;
        };
        feels_like: {
            day: number;
            night: number;
            eve: number;
            morn: number;
        };
        pressure: number;
        humidity: number;
        dew_point: number;
        wind_speed: number;
        wind_deg: number;
        wind_gust: number;
        weather: {
            id: number;
            main: string;
            description: string;
            icon: string;
        }[];
        clouds: number;
        pop: number;
        rain: number;
        uvi: number;
    }[];
    alerts: {
        sender_name: string;
        event: string;
        start: number;
        end: number;
        description: string;
        tags: string[];
    }[];


}

async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
    const weatherKey = process.env.NEXT_PUBLIC_WEATHERKEY;
    const response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherKey}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json() as Promise<WeatherData>;
}

const useWeatherData = (lat?: number, lon?: number) => {
    const { data, isPending, error } = useQuery({
        queryKey: ["weatherData", lat, lon],
        enabled: lat !== undefined && lon !== undefined,
        queryFn: () => fetchWeatherData(lat!, lon!),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
    return { data, isPending, error };
};

export default useWeatherData;