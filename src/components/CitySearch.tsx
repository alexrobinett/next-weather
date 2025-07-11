'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  MapPinIcon,
  PlusIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import useCitySearch, { type FormattedCityResult } from '../lib/hooks/useCitySearch';
import useFavoriteCities from '../lib/hooks/useFavoriteCities';

interface CitySearchProps {
  onCitySelect: (city: FormattedCityResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const CitySearch = ({ 
  onCitySelect, 
  placeholder = "Search for a city...",
  autoFocus = false 
}: CitySearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { cities, isPending, isEmpty } = useCitySearch(query, isOpen);
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteCities();
  
  // Auto focus when component mounts
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
    setSelectedIndex(-1);
  };

  // Handle input focus
  const handleFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  // Handle input blur (with delay to allow clicks)
  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle city selection
  const handleCitySelect = (city: FormattedCityResult) => {
    onCitySelect(city);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Toggle favorite
  const handleToggleFavorite = (e: React.MouseEvent, city: FormattedCityResult) => {
    e.stopPropagation();
    
    if (isFavorite(city.lat, city.lon)) {
      removeFavorite(city.id);
    } else {
      addFavorite({
        name: city.name,
        state: city.state,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
      });
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || cities.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < cities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && cities[selectedIndex]) {
          handleCitySelect(cities[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-muted" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="glass-card w-full pl-10 pr-10 py-3 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
          aria-label="Search for cities"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          aria-activedescendant={selectedIndex >= 0 ? `city-option-${selectedIndex}` : undefined}
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-primary transition-colors duration-200"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card 
          ref={dropdownRef}
          className="absolute top-full mt-1 w-full z-50 glass-card border shadow-xl max-h-64 overflow-y-auto"
        >
          <CardContent className="p-0">
            {isPending ? (
              // Loading skeleton
              <div className="p-2 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2">
                    <Skeleton className="h-4 w-4 rounded shimmer" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4 shimmer" />
                      <Skeleton className="h-3 w-1/2 shimmer" />
                    </div>
                    <Skeleton className="h-4 w-4 rounded shimmer" />
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              // No results
              <div className="p-4 text-center text-muted">
                <MapPinIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No cities found for "{query}"</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              // Search results
              <div className="py-1" role="listbox">
                {cities.map((city, index) => {
                  const isSelected = index === selectedIndex;
                  const isCityFavorite = isFavorite(city.lat, city.lon);
                  
                  return (
                    <div
                      key={city.id}
                      id={`city-option-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`
                        flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150
                        ${isSelected 
                          ? 'bg-blue-100 dark:bg-blue-900/30' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        }
                      `}
                      onClick={() => handleCitySelect(city)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <MapPinIcon className="h-4 w-4 text-muted flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-primary truncate">
                            {city.name}
                          </p>
                          <p className="text-xs text-muted truncate">
                            {city.state ? `${city.state}, ${city.country}` : city.country}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={(e) => handleToggleFavorite(e, city)}
                          className={`
                            p-1 rounded-full transition-colors duration-200
                            ${isCityFavorite 
                              ? 'text-red-500 hover:text-red-600' 
                              : 'text-muted hover:text-red-500'
                            }
                          `}
                          aria-label={isCityFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {isCityFavorite ? (
                            <HeartSolidIcon className="h-4 w-4" />
                          ) : (
                            <HeartIcon className="h-4 w-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleCitySelect(city)}
                          className="p-1 rounded-full text-muted hover:text-primary transition-colors duration-200"
                          aria-label="Select city"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search hint */}
      {!isOpen && query.length > 0 && query.length < 2 && (
        <p className="text-xs text-muted mt-1 px-3">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
};

export default CitySearch; 