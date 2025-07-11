'use client'
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface FavoriteCity {
  id: string;
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  addedAt: number;
}

const STORAGE_KEY = 'weather-glass-favorite-cities';
const MAX_FAVORITES = 10;

// Get favorites from localStorage
const getFavoritesFromStorage = (): FavoriteCity[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading favorites from storage:', error);
    return [];
  }
};

// Save favorites to localStorage
const saveFavoritesToStorage = (favorites: FavoriteCity[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites to storage:', error);
  }
};

// Generate unique ID for a city
const generateCityId = (lat: number, lon: number): string => {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
};

const useFavoriteCities = () => {
  const queryClient = useQueryClient();

  // Use Tanstack Query to manage favorites with localStorage
  const { data: favorites = [], isPending } = useQuery({
    queryKey: ['favoriteCities'],
    queryFn: getFavoritesFromStorage,
    staleTime: Infinity, // Never stale since it's local data
    gcTime: Infinity, // Keep in cache forever
  });

  // Add a city to favorites
  const addFavorite = (city: Omit<FavoriteCity, 'id' | 'addedAt'>) => {
    const cityId = generateCityId(city.lat, city.lon);
    
    // Check if already exists
    if (favorites.some(fav => fav.id === cityId)) {
      return { success: false, message: 'City already in favorites' };
    }
    
    // Check if at max capacity
    if (favorites.length >= MAX_FAVORITES) {
      return { success: false, message: `Maximum ${MAX_FAVORITES} cities allowed` };
    }
    
    const newCity: FavoriteCity = {
      ...city,
      id: cityId,
      addedAt: Date.now(),
    };
    
    const updatedFavorites = [newCity, ...favorites];
    
    // Update cache immediately
    queryClient.setQueryData(['favoriteCities'], updatedFavorites);
    
    // Save to localStorage
    saveFavoritesToStorage(updatedFavorites);
    
    return { success: true, message: 'City added to favorites' };
  };

  // Remove a city from favorites
  const removeFavorite = (cityId: string) => {
    const updatedFavorites = favorites.filter(city => city.id !== cityId);
    
    // Update cache immediately
    queryClient.setQueryData(['favoriteCities'], updatedFavorites);
    
    // Save to localStorage
    saveFavoritesToStorage(updatedFavorites);
    
    return { success: true, message: 'City removed from favorites' };
  };

  // Check if a city is favorited
  const isFavorite = (lat: number, lon: number): boolean => {
    const cityId = generateCityId(lat, lon);
    return favorites.some(fav => fav.id === cityId);
  };

  // Clear all favorites
  const clearAllFavorites = () => {
    queryClient.setQueryData(['favoriteCities'], []);
    saveFavoritesToStorage([]);
    return { success: true, message: 'All favorites cleared' };
  };

  // Reorder favorites
  const reorderFavorites = (startIndex: number, endIndex: number) => {
    if (startIndex < 0 || startIndex >= favorites.length || endIndex < 0 || endIndex >= favorites.length) {
      return { success: false, message: 'Invalid indices for reordering' };
    }
    
    const updatedFavorites = [...favorites];
    const removed = updatedFavorites.splice(startIndex, 1)[0];
    
    if (removed) {
      updatedFavorites.splice(endIndex, 0, removed);
      
      queryClient.setQueryData(['favoriteCities'], updatedFavorites);
      saveFavoritesToStorage(updatedFavorites);
      
      return { success: true, message: 'Favorites reordered' };
    }
    
    return { success: false, message: 'Failed to reorder favorites' };
  };

  return {
    favorites,
    isPending,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearAllFavorites,
    reorderFavorites,
    maxFavorites: MAX_FAVORITES,
    canAddMore: favorites.length < MAX_FAVORITES,
  };
};

export default useFavoriteCities; 