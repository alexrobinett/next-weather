'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ClockIcon } from '@heroicons/react/24/outline';
import { type WeatherData } from "../lib/hooks/useWeatherData";
import { formatTime, getWeatherEmoji, removeTrailingNumbers } from "../lib/formatters";

interface HourlyForecastProps {
  weatherData: WeatherData;
}

const HourlyForecast = ({ weatherData }: HourlyForecastProps) => {
  // Get next 12 hours
  const hourlyData = weatherData.hourly.slice(0, 12);

  return (
    <Card className="glass-card w-full max-w-4xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-primary text-lg">
          <ClockIcon className="w-5 h-5 mr-2 text-accent" />
          Hourly Forecast
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {hourlyData.map((hour, index) => {
            const isNight = hour.dt < weatherData.current.sunrise || hour.dt > weatherData.current.sunset;
            
            return (
              <div 
                key={hour.dt}
                className="flex-shrink-0 text-center glass-card-hover p-4 min-w-[100px]"
              >
                <div className="text-muted text-sm mb-2">
                  {index === 0 ? 'Now' : formatTime(hour.dt)}
                </div>
                
                <div className="text-3xl mb-2">
                  {getWeatherEmoji(hour.weather[0]?.description || '', isNight)}
                </div>
                
                <div className="text-primary font-semibold text-lg mb-1">
                  {removeTrailingNumbers(String(hour.temp))}°
                </div>
                
                <div className="text-muted text-xs mb-2">
                  {Math.round(hour.pop * 100)}%
                </div>
                
                <div className="text-muted text-xs">
                  {Math.round(hour.wind_speed)} mph
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default HourlyForecast; 