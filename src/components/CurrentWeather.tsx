'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

import { Skeleton } from "./ui/skeleton";
import { 
  CloudIcon, 
  SunIcon, 
  EyeIcon, 
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

import useUserLocation, { type LocationData } from "../lib/hooks/useUserLocation";
import useWeatherData from "../lib/hooks/useWeatherData";
import useCityName from "../lib/hooks/useCityName";
import { 
  removeTrailingNumbers, 
  getWeatherEmoji, 
  getCarrotWeatherComment,
  formatTime,
  getWindDirection,
  getUVDescription
} from "../lib/formatters";

const CurrentWeather = () => {
  const { data: location, isPending: isLocationPending, error: locationError } = useUserLocation();
  const { data: weatherData, isPending: weatherIsPending, error: weatherError } = useWeatherData(location?.latitude, location?.longitude);
  const { data: cityName, isPending: isCityPending } = useCityName(location?.latitude, location?.longitude);
  const [currentComment, setCurrentComment] = useState<string>('');

  // Determine if it's night time
  const isNight = weatherData ? 
    Date.now() / 1000 < weatherData.current.sunrise || Date.now() / 1000 > weatherData.current.sunset 
    : false;

  // Generate Carrot Weather style comment
  useEffect(() => {
    if (weatherData) {
      const comment = getCarrotWeatherComment(
        weatherData.current.temp, 
        weatherData.current.weather[0]?.description || 'unknown'
      );
      setCurrentComment(comment);
    }
  }, [weatherData]);

  if (locationError || weatherError) {
    return (
      <Card className="glass-card w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="text-red-400 mb-4">
            <CloudIcon className="w-16 h-16 mx-auto mb-2" />
            <p className="text-lg font-semibold">Oops!</p>
            <p className="text-sm opacity-80">
              {locationError ? 'Could not get your location' : 'Weather data unavailable'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLoading = isLocationPending || weatherIsPending;
  const currentWeather = weatherData?.current;
  const todayWeather = weatherData?.daily?.[0];

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Main Weather Card */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="text-center pb-2">
          {isLoading || isCityPending ? (
            <Skeleton className="h-8 w-48 mx-auto mb-2 shimmer" />
          ) : (
            <>
              <CardTitle className="text-2xl font-bold text-primary drop-shadow-lg">
                {cityName || 'Unknown Location'}
              </CardTitle>
              <CardDescription className="text-secondary text-sm">
                {formatTime(Date.now() / 1000)}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="px-6 pb-2">
          {/* Temperature Display */}
          <div className="text-center mb-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 mx-auto shimmer" />
                <Skeleton className="h-20 w-32 mx-auto shimmer" />
                <Skeleton className="h-4 w-24 mx-auto shimmer" />
              </div>
            ) : (
              <>
                <div className="text-8xl font-extralight text-primary drop-shadow-2xl mb-2 float-animation">
                  {getWeatherEmoji(currentWeather?.weather[0]?.description || '', isNight)}
                </div>
                <div className="text-6xl font-light text-primary drop-shadow-lg">
                  {removeTrailingNumbers(String(currentWeather?.temp))}°
                </div>
                <div className="text-lg text-secondary capitalize mb-1">
                  {currentWeather?.weather[0]?.description}
                </div>
                <div className="text-sm text-muted">
                  Feels like {Math.round(currentWeather?.feels_like || 0)}°F
                </div>
              </>
            )}
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {isLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-4 w-16 mx-auto mb-1 shimmer" />
                    <Skeleton className="h-6 w-12 mx-auto shimmer" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <ArrowUpIcon className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-muted text-sm">High</span>
                  </div>
                  <div className="text-primary font-semibold">
                    {Math.round(todayWeather?.temp.max || 0)}°
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <ArrowDownIcon className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-muted text-sm">Low</span>
                  </div>
                  <div className="text-primary font-semibold">
                    {Math.round(todayWeather?.temp.min || 0)}°
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-muted mr-1" />
                    <span className="text-muted text-sm">Wind</span>
                  </div>
                  <div className="text-primary font-semibold text-sm">
                    {Math.round(currentWeather?.wind_speed || 0)} mph {getWindDirection(currentWeather?.wind_deg || 0)}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <EyeIcon className="w-4 h-4 text-muted mr-1" />
                    <span className="text-muted text-sm">Visibility</span>
                  </div>
                  <div className="text-primary font-semibold text-sm">
                    {Math.round((currentWeather?.visibility || 0) / 1000)} km
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-12 mx-auto mb-1 shimmer" />
                    <Skeleton className="h-4 w-8 mx-auto shimmer" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div>
                  <div className="text-muted text-xs mb-1">Humidity</div>
                  <div className="text-primary font-medium">{currentWeather?.humidity}%</div>
                </div>
                
                <div>
                  <div className="text-muted text-xs mb-1">Pressure</div>
                  <div className="text-primary font-medium">{Math.round(currentWeather?.pressure || 0)} hPa</div>
                </div>
                
                <div>
                  <div className="text-muted text-xs mb-1">UV Index</div>
                  <div className="text-primary font-medium">
                    {Math.round(currentWeather?.uvi || 0)} <span className="text-muted">({getUVDescription(currentWeather?.uvi || 0).level})</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>

        {/* Carrot Weather Style Comment */}
        <CardFooter className="px-6 pt-0 pb-6">
          {isLoading ? (
            <Skeleton className="h-12 w-full shimmer" />
          ) : (
            <div className="w-full text-center">
              <div className="glass-card p-3">
                <p className="text-secondary text-sm leading-relaxed">
                  {currentComment}
                </p>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Sunrise/Sunset Card */}
      {!isLoading && weatherData && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center mb-2">
                  <SunIcon className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-muted text-sm">Sunrise</span>
                </div>
                <div className="text-primary font-semibold">
                  {formatTime(weatherData.current.sunrise)}
                </div>
              </div>
              
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              
              <div className="text-center flex-1">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-5 h-5 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-muted text-sm">Sunset</span>
                </div>
                <div className="text-primary font-semibold">
                  {formatTime(weatherData.current.sunset)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CurrentWeather;
