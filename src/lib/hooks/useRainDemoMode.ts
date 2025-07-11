'use client';

import { useState, useEffect } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

// Storage key for persistence
const STORAGE_KEY = 'weather-glass-rain-demo-mode';

// Get initial state from storage
const getInitialDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch (error) {
    console.error('Error reading demo mode from storage:', error);
    return false;
  }
};

// Save to storage
const saveDemoModeToStorage = (isDemo: boolean): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isDemo));
  } catch (error) {
    console.error('Error saving demo mode to storage:', error);
  }
};

const useRainDemoMode = () => {
  const queryClient = useQueryClient();
  
  const { data: isDemoMode = false } = useQuery({
    queryKey: ['rainDemoMode'],
    queryFn: () => getInitialDemoMode(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
  
  const toggleDemoMode = () => {
    const newMode = !isDemoMode;
    queryClient.setQueryData(['rainDemoMode'], newMode);
    saveDemoModeToStorage(newMode);
  };
  
  return {
    isDemoMode,
    toggleDemoMode,
  };
};

export default useRainDemoMode; 