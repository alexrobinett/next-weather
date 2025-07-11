'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface UserPreferences {
  // Animation & Motion
  reducedMotion: boolean;
  disableAnimations: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  
  // Weather Display
  temperatureUnit: 'celsius' | 'fahrenheit';
  windUnit: 'mph' | 'kph' | 'ms';
  pressureUnit: 'hPa' | 'inHg' | 'mmHg';
  
  // UI Preferences
  compactMode: boolean;
  showSeconds: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  
  // Notifications
  weatherAlerts: boolean;
  soundEnabled: boolean;
  
  // Data & Privacy
  saveLocation: boolean;
  shareUsageData: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  // Animation & Motion
  reducedMotion: false,
  disableAnimations: false,
  animationSpeed: 'normal',
  
  // Accessibility
  highContrast: false,
  largeText: false,
  screenReaderOptimized: false,
  
  // Weather Display
  temperatureUnit: 'fahrenheit',
  windUnit: 'mph',
  pressureUnit: 'hPa',
  
  // UI Preferences
  compactMode: false,
  showSeconds: false,
  autoRefresh: true,
  refreshInterval: 10,
  
  // Notifications
  weatherAlerts: true,
  soundEnabled: true,
  
  // Data & Privacy
  saveLocation: true,
  shareUsageData: false,
};

const STORAGE_KEY = 'weather-glass-user-preferences';

// Get preferences from localStorage
const getPreferencesFromStorage = (): UserPreferences => {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    
    const parsed = JSON.parse(stored);
    
    // Merge with defaults to handle new preference keys
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
  } catch (error) {
    console.error('Error reading preferences from storage:', error);
    return DEFAULT_PREFERENCES;
  }
};

// Save preferences to localStorage
const savePreferencesToStorage = (preferences: UserPreferences): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences to storage:', error);
  }
};

// Apply CSS classes based on preferences
const applyCSSPreferences = (preferences: UserPreferences): void => {
  if (typeof window === 'undefined') return;
  
  const html = document.documentElement;
  
  // Animation preferences
  if (preferences.reducedMotion || preferences.disableAnimations) {
    html.classList.add('reduce-motion');
  } else {
    html.classList.remove('reduce-motion');
  }
  
  // Animation speed
  html.classList.remove('slow-animations', 'fast-animations');
  if (preferences.animationSpeed === 'slow') {
    html.classList.add('slow-animations');
  } else if (preferences.animationSpeed === 'fast') {
    html.classList.add('fast-animations');
  }
  
  // Accessibility
  if (preferences.highContrast) {
    html.classList.add('high-contrast');
  } else {
    html.classList.remove('high-contrast');
  }
  
  if (preferences.largeText) {
    html.classList.add('large-text');
  } else {
    html.classList.remove('large-text');
  }
  
  if (preferences.compactMode) {
    html.classList.add('compact-mode');
  } else {
    html.classList.remove('compact-mode');
  }
};

// Detect system preferences
const detectSystemPreferences = (): Partial<UserPreferences> => {
  if (typeof window === 'undefined') return {};
  
  const preferences: Partial<UserPreferences> = {};
  
  // Detect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    preferences.reducedMotion = true;
  }
  
  // Detect high contrast preference
  if (window.matchMedia('(prefers-contrast: high)').matches) {
    preferences.highContrast = true;
  }
  
  return preferences;
};

const useUserPreferences = () => {
  const queryClient = useQueryClient();

  // Load preferences with system detection
  const { data: preferences = DEFAULT_PREFERENCES, isPending } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: () => {
      const stored = getPreferencesFromStorage();
      const system = detectSystemPreferences();
      
      // Apply system preferences for new users
      const merged = { ...stored, ...system };
      
      // Apply CSS immediately
      applyCSSPreferences(merged);
      
      return merged;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Update a single preference
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const updatedPreferences = {
      ...preferences,
      [key]: value,
    };
    
    // Update cache immediately
    queryClient.setQueryData(['userPreferences'], updatedPreferences);
    
    // Save to localStorage
    savePreferencesToStorage(updatedPreferences);
    
    // Apply CSS changes
    applyCSSPreferences(updatedPreferences);
    
    return { success: true, message: 'Preference updated successfully' };
  };

  // Update multiple preferences
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const updatedPreferences = {
      ...preferences,
      ...updates,
    };
    
    queryClient.setQueryData(['userPreferences'], updatedPreferences);
    savePreferencesToStorage(updatedPreferences);
    applyCSSPreferences(updatedPreferences);
    
    return { success: true, message: 'Preferences updated successfully' };
  };

  // Reset to defaults
  const resetPreferences = () => {
    const systemPrefs = detectSystemPreferences();
    const resetPrefs = { ...DEFAULT_PREFERENCES, ...systemPrefs };
    
    queryClient.setQueryData(['userPreferences'], resetPrefs);
    savePreferencesToStorage(resetPrefs);
    applyCSSPreferences(resetPrefs);
    
    return { success: true, message: 'Preferences reset to defaults' };
  };

  // Get derived values
  const getDerivedValues = () => ({
    // CSS classes for components
    animationClass: preferences.disableAnimations 
      ? 'no-animations' 
      : preferences.reducedMotion 
        ? 'reduced-motion' 
        : '',
    
    // Speed multiplier for animations
    animationDuration: preferences.animationSpeed === 'slow' 
      ? 1.5 
      : preferences.animationSpeed === 'fast' 
        ? 0.5 
        : 1,
    
    // Text size multiplier
    textSizeMultiplier: preferences.largeText ? 1.2 : 1,
    
    // Refresh interval in milliseconds
    refreshIntervalMs: preferences.autoRefresh ? preferences.refreshInterval * 60 * 1000 : null,
  });

  // Export preferences for external use (e.g., weather API calls)
  const getWeatherApiUnits = () => ({
    units: preferences.temperatureUnit === 'celsius' ? 'metric' : 'imperial',
    windSpeed: preferences.windUnit,
    pressure: preferences.pressureUnit,
  });

  return {
    preferences,
    isPending,
    updatePreference,
    updatePreferences,
    resetPreferences,
    getDerivedValues,
    getWeatherApiUnits,
    
    // Convenience getters
    shouldReduceMotion: preferences.reducedMotion || preferences.disableAnimations,
    shouldShowAnimations: !preferences.disableAnimations && !preferences.reducedMotion,
    isAccessibilityMode: preferences.highContrast || preferences.largeText || preferences.screenReaderOptimized,
  };
};

export default useUserPreferences; 