'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CalendarDaysIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { type WeatherData } from "../lib/hooks/useWeatherData";
import { formatDate, getWeatherEmoji } from "../lib/formatters";

interface DailyForecastProps {
  weatherData: WeatherData;
}

const DailyForecast = ({ weatherData }: DailyForecastProps) => {
  // Get next 7 days (excluding today)
  const dailyData = weatherData.daily.slice(1, 8);

  return (
    <Card className="glass-card w-full max-w-4xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-primary text-lg">
          <CalendarDaysIcon className="w-5 h-5 mr-2 text-accent" />
          7-Day Forecast
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        <div className="space-y-3">
          {dailyData.map((day, index) => {
            return (
              <div 
                key={day.dt}
                className="glass-card-hover p-4 flex items-center justify-between"
              >
                {/* Day and Weather */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-primary font-medium min-w-[80px]">
                    {index === 0 ? 'Tomorrow' : formatDate(day.dt)}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getWeatherEmoji(day.weather[0]?.description || '', false)}
                    </div>
                    
                    <div className="text-secondary capitalize text-sm">
                      {day.weather[0]?.description}
                    </div>
                  </div>
                </div>

                {/* Precipitation */}
                <div className="text-center px-4">
                  <div className="text-muted text-xs">Rain</div>
                  <div className="text-primary text-sm font-medium">
                    {Math.round(day.pop * 100)}%
                  </div>
                </div>

                {/* Temperature Range */}
                <div className="flex items-center space-x-4 min-w-[120px] justify-end">
                  <div className="flex items-center space-x-1">
                    <ArrowDownIcon className="w-3 h-3 text-blue-500" />
                    <span className="text-secondary text-sm">
                      {Math.round(day.temp.min)}°
                    </span>
                  </div>
                  
                  <div className="w-16 h-2 bg-gray-300 dark:bg-gray-600 rounded-full relative overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-red-400 rounded-full"
                      style={{
                        width: '100%'
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <ArrowUpIcon className="w-3 h-3 text-red-500" />
                    <span className="text-primary font-semibold text-sm">
                      {Math.round(day.temp.max)}°
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyForecast; 