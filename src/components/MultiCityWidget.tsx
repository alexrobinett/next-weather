'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { 
  PlusIcon,
  HeartIcon,
  TrashIcon,
  MapPinIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import useFavoriteCities, { type FavoriteCity } from '../lib/hooks/useFavoriteCities';
import useWeatherData from '../lib/hooks/useWeatherData';
import CitySearch from './CitySearch';
import { type FormattedCityResult } from '../lib/hooks/useCitySearch';
import { 
  removeTrailingNumbers, 
  getWeatherEmoji, 
  formatTime 
} from '../lib/formatters';

interface CityWeatherCardProps {
  city: FavoriteCity;
  onRemove: (cityId: string) => void;
}

const CityWeatherCard = ({ city, onRemove }: CityWeatherCardProps) => {
  const { data: weatherData, isPending, error } = useWeatherData(city.lat, city.lon);
  
  const currentWeather = weatherData?.current;
  const isNight = weatherData ? 
    Date.now() / 1000 < weatherData.current.sunrise || Date.now() / 1000 > weatherData.current.sunset 
    : false;

  const handleRemove = () => {
    onRemove(city.id);
  };

  return (
    <Card className="glass-card-hover cursor-pointer relative group">
      <CardContent className="p-4">
        {/* Remove button */}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-full text-muted hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200"
          aria-label={`Remove ${city.name} from favorites`}
        >
          <TrashIcon className="w-4 h-4" />
        </button>

        {isPending ? (
          // Loading state
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4 text-muted" />
              <Skeleton className="h-4 w-24 shimmer" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full shimmer" />
              <div className="flex-1">
                <Skeleton className="h-6 w-16 mb-1 shimmer" />
                <Skeleton className="h-3 w-20 shimmer" />
              </div>
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-12 shimmer" />
              <Skeleton className="h-3 w-12 shimmer" />
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-4">
            <div className="text-red-500 text-2xl mb-2">⚠️</div>
            <p className="text-muted text-xs">Failed to load weather</p>
          </div>
        ) : currentWeather ? (
          // Weather data
          <div className="space-y-3">
            {/* City name */}
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4 text-muted flex-shrink-0" />
              <h3 className="text-primary font-medium text-sm truncate">
                {city.name}
              </h3>
            </div>

            {/* Main weather info */}
            <div className="flex items-center space-x-3">
              <div className="text-3xl">
                {getWeatherEmoji(currentWeather.weather[0]?.description || '', isNight)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-primary font-bold text-xl">
                  {removeTrailingNumbers(String(currentWeather.temp))}°
                </div>
                <div className="text-muted text-xs capitalize truncate">
                  {currentWeather.weather[0]?.description}
                </div>
              </div>
            </div>

            {/* Additional info */}
            <div className="flex justify-between text-xs text-muted">
              <span>Feels {Math.round(currentWeather.feels_like)}°</span>
              <span>{currentWeather.humidity}% humidity</span>
            </div>

            {/* Last updated */}
            <div className="text-xs text-muted text-center pt-1 border-t border-gray-200 dark:border-gray-700">
              Updated {formatTime(currentWeather.dt)}
            </div>
          </div>
        ) : (
          // No data
          <div className="text-center py-4">
            <div className="text-muted text-2xl mb-2">📍</div>
            <p className="text-muted text-xs">No weather data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface MultiCityWidgetProps {
  className?: string;
}

const MultiCityWidget = ({ className = '' }: MultiCityWidgetProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  
  const { 
    favorites, 
    isPending: isFavoritesPending, 
    addFavorite, 
    removeFavorite,
    clearAllFavorites,
    canAddMore,
    maxFavorites
  } = useFavoriteCities();

  const handleCitySelect = (city: FormattedCityResult) => {
    const result = addFavorite({
      name: city.name,
      state: city.state,
      country: city.country,
      lat: city.lat,
      lon: city.lon,
    });
    
    if (result.success) {
      setShowSearch(false);
    }
    
    // You could show a toast notification here
    console.log(result.message);
  };

  const handleRemoveCity = (cityId: string) => {
    removeFavorite(cityId);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all favorite cities?')) {
      clearAllFavorites();
      setShowManagement(false);
    }
  };

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-primary text-lg">
            <HeartSolidIcon className="w-5 h-5 mr-2 text-red-500" />
            Favorite Cities
            {favorites.length > 0 && (
              <span className="ml-2 text-sm text-muted">
                ({favorites.length}/{maxFavorites})
              </span>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {favorites.length > 0 && (
              <button
                onClick={() => setShowManagement(!showManagement)}
                className="p-1 rounded-full text-muted hover:text-primary transition-colors duration-200"
                aria-label="Manage favorites"
              >
                <Cog6ToothIcon className="w-4 h-4" />
              </button>
            )}
            
            {canAddMore && (
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-1 rounded-full text-muted hover:text-primary transition-colors duration-200"
                aria-label="Add city"
              >
                {showSearch ? (
                  <MagnifyingGlassIcon className="w-4 h-4" />
                ) : (
                  <PlusIcon className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Search component */}
        {showSearch && (
          <div className="mt-4">
            <CitySearch
              onCitySelect={handleCitySelect}
              placeholder="Search cities to add to favorites..."
              autoFocus={true}
            />
          </div>
        )}

        {/* Management controls */}
        {showManagement && favorites.length > 0 && (
          <div className="mt-4 p-3 glass-card border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">
                Manage your {favorites.length} favorite cities
              </span>
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="px-6 pb-6">
        {isFavoritesPending ? (
          // Loading favorites
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-4">
                  <Skeleton className="h-24 w-full shimmer" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-primary font-semibold mb-2">
              No favorite cities yet
            </h3>
            <p className="text-secondary text-sm mb-4 max-w-md mx-auto">
              Add cities to your favorites to see their weather at a glance. 
              Perfect for tracking weather in places you love or plan to visit!
            </p>
            {canAddMore && (
              <button
                onClick={() => setShowSearch(true)}
                className="glass-card-hover px-4 py-2 rounded-lg text-primary font-medium transition-all duration-200"
              >
                <PlusIcon className="w-4 h-4 inline mr-2" />
                Add Your First City
              </button>
            )}
          </div>
        ) : (
          // Cities grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((city) => (
              <CityWeatherCard
                key={city.id}
                city={city}
                onRemove={handleRemoveCity}
              />
            ))}
          </div>
        )}

        {/* Add more hint */}
        {favorites.length > 0 && canAddMore && !showSearch && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowSearch(true)}
              className="text-muted hover:text-primary text-sm transition-colors duration-200 flex items-center justify-center mx-auto"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add another city ({favorites.length}/{maxFavorites})
            </button>
          </div>
        )}

        {/* Max reached message */}
        {!canAddMore && (
          <div className="mt-6 text-center">
            <p className="text-muted text-xs">
              Maximum {maxFavorites} cities reached. Remove some to add new ones.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiCityWidget; 