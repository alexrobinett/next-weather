'use client'
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  category: 'seasonal' | 'style' | 'accessibility' | 'custom';
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  isDark: boolean;
  isMinimal: boolean;
  isHighContrast: boolean;
  cssClass: string;
}

const THEME_CONFIGS: ThemeConfig[] = [
  // Standard Themes
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright default theme',
    category: 'style',
    preview: '☀️',
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#3b82f6',
      background: '#f8fafc',
    },
    isDark: false,
    isMinimal: false,
    isHighContrast: false,
    cssClass: 'theme-light',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Sleek dark mode for low-light environments',
    category: 'style',
    preview: '🌙',
    colors: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      accent: '#60a5fa',
      background: '#0f172a',
    },
    isDark: true,
    isMinimal: false,
    isHighContrast: false,
    cssClass: 'theme-dark',
  },
  
  // Seasonal Themes - Improved contrast ratios
  {
    id: 'spring',
    name: 'Spring Bloom',
    description: 'Fresh greens and soft pastels of spring',
    category: 'seasonal',
    preview: '🌸',
    colors: {
      primary: '#052e16',      // Much darker green for better contrast (was #064e3b)
      secondary: '#166534',    // Dark green for secondary text (was #059669)
      accent: '#16a34a',       // Vibrant but readable green (was #10b981)
      background: '#f7fee7',   // Softer green background (was #f0fdf4)
    },
    isDark: false,
    isMinimal: false,
    isHighContrast: false,
    cssClass: 'theme-spring',
  },
  {
    id: 'summer',
    name: 'Summer Vibes',
    description: 'Bright blues and warm sunshine colors',
    category: 'seasonal',
    preview: '🏖️',
    colors: {
      primary: '#0c4a6e',      // Good contrast blue (unchanged)
      secondary: '#0369a1',    // Darker blue for better readability (was #0284c7)
      accent: '#0284c7',       // Bright accent blue (was #0ea5e9)
      background: '#f8fafc',   // Clean white background (was #f0f9ff)
    },
    isDark: false,
    isMinimal: false,
    isHighContrast: false,
    cssClass: 'theme-summer',
  },
  {
    id: 'autumn',
    name: 'Autumn Leaves',
    description: 'Warm oranges and deep reds of fall',
    category: 'seasonal',
    preview: '🍁',
    colors: {
      primary: '#7c2d12',      // Good contrast brown (unchanged)
      secondary: '#a16207',    // Dark amber for secondary (was #dc2626)
      accent: '#ea580c',       // Warm orange accent (was #f97316)
      background: '#fffbeb',   // Warm cream background (was #fff7ed)
    },
    isDark: false,
    isMinimal: false,
    isHighContrast: false,
    cssClass: 'theme-autumn',
  },
  {
    id: 'winter',
    name: 'Winter Frost',
    description: 'Cool blues and crisp whites of winter',
    category: 'seasonal',
    preview: '❄️',
    colors: {
      primary: '#1e3a8a',      // Good contrast blue (unchanged)
      secondary: '#1e40af',    // Darker blue for better readability (was #3730a3)
      accent: '#3b82f6',       // Classic blue accent (was #6366f1)
      background: '#f8fafc',   // Pure white background (unchanged)
    },
    isDark: false,
    isMinimal: false,
    isHighContrast: false,
    cssClass: 'theme-winter',
  },
  
  // Style Variants
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean and distraction-free light theme',
    category: 'style',
    preview: '⚪',
    colors: {
      primary: '#374151',
      secondary: '#9ca3af',
      accent: '#6b7280',
      background: '#ffffff',
    },
    isDark: false,
    isMinimal: true,
    isHighContrast: false,
    cssClass: 'theme-minimal-light',
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Clean and distraction-free dark theme',
    category: 'style',
    preview: '⚫',
    colors: {
      primary: '#e5e7eb',
      secondary: '#6b7280',
      accent: '#9ca3af',
      background: '#111827',
    },
    isDark: true,
    isMinimal: true,
    isHighContrast: false,
    cssClass: 'theme-minimal-dark',
  },
  
  // Accessibility Themes
  {
    id: 'high-contrast-light',
    name: 'High Contrast Light',
    description: 'Maximum contrast for better visibility',
    category: 'accessibility',
    preview: '🔆',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#0066cc',
      background: '#ffffff',
    },
    isDark: false,
    isMinimal: false,
    isHighContrast: true,
    cssClass: 'theme-high-contrast-light',
  },
  {
    id: 'high-contrast-dark',
    name: 'High Contrast Dark',
    description: 'High contrast dark theme for accessibility',
    category: 'accessibility',
    preview: '🔅',
    colors: {
      primary: '#ffffff',
      secondary: '#cccccc',
      accent: '#66b3ff',
      background: '#000000',
    },
    isDark: true,
    isMinimal: false,
    isHighContrast: true,
    cssClass: 'theme-high-contrast-dark',
  },
];

const STORAGE_KEY = 'weather-glass-enhanced-theme';

interface EnhancedThemePreferences {
  selectedTheme: string;
  autoSeasonal: boolean;
  autoTimeOfDay: boolean;
  customOverrides: Record<string, string>;
}

const DEFAULT_THEME_PREFERENCES: EnhancedThemePreferences = {
  selectedTheme: 'light',
  autoSeasonal: false,
  autoTimeOfDay: false, // Disabled by default to prevent overriding user choices
  customOverrides: {},
};

// Get current season based on date
const getCurrentSeason = (): 'spring' | 'summer' | 'autumn' | 'winter' => {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'spring'; // Mar-May
  if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug  
  if (month >= 8 && month <= 10) return 'autumn'; // Sep-Nov
  return 'winter'; // Dec-Feb
};

// Get time-based theme preference
const getTimeBasedTheme = (): 'light' | 'dark' => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
};

// Get theme preferences from localStorage
const getThemePreferencesFromStorage = (): EnhancedThemePreferences => {
  if (typeof window === 'undefined') return DEFAULT_THEME_PREFERENCES;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_THEME_PREFERENCES;
    
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_THEME_PREFERENCES, ...parsed };
  } catch (error) {
    console.error('Error reading theme preferences:', error);
    return DEFAULT_THEME_PREFERENCES;
  }
};

// Save theme preferences to localStorage
const saveThemePreferencesToStorage = (preferences: EnhancedThemePreferences): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving theme preferences:', error);
  }
};

// Apply theme CSS classes
const applyThemeClasses = (themeConfig: ThemeConfig): void => {
  if (typeof window === 'undefined') return;
  
  const html = document.documentElement;
  
  // Remove all theme classes
  THEME_CONFIGS.forEach(config => {
    html.classList.remove(config.cssClass);
  });
  
  // Remove modifier classes
  html.classList.remove('minimal-theme', 'high-contrast-theme');
  
  // Apply new theme class
  html.classList.add(themeConfig.cssClass);
  
  // Apply modifier classes
  if (themeConfig.isMinimal) {
    html.classList.add('minimal-theme');
  }
  
  if (themeConfig.isHighContrast) {
    html.classList.add('high-contrast-theme');
  }
  
  // Set CSS custom properties for dynamic theming
  html.style.setProperty('--theme-primary', themeConfig.colors.primary);
  html.style.setProperty('--theme-secondary', themeConfig.colors.secondary);
  html.style.setProperty('--theme-accent', themeConfig.colors.accent);
  html.style.setProperty('--theme-background', themeConfig.colors.background);
};

const useEnhancedThemes = () => {
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();

  // Load theme preferences
  const { data: themePreferences = DEFAULT_THEME_PREFERENCES, isPending } = useQuery({
    queryKey: ['enhancedThemePreferences'],
    queryFn: getThemePreferencesFromStorage,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Get current theme configuration
  const getCurrentThemeConfig = (): ThemeConfig => {
    let themeId = themePreferences.selectedTheme;
    
    // Auto-seasonal override
    if (themePreferences.autoSeasonal) {
      const season = getCurrentSeason();
      const seasonalTheme = THEME_CONFIGS.find(t => t.id === season);
      if (seasonalTheme) {
        themeId = season;
      }
    }
    
    // Auto time-of-day override
    if (themePreferences.autoTimeOfDay) {
      const timeTheme = getTimeBasedTheme();
      if (timeTheme === 'dark' && !themeId.includes('dark')) {
        // Switch to dark variant if available
        const darkVariant = THEME_CONFIGS.find(t => 
          t.id === `${themeId}-dark` || (t.isDark && t.category === 'style')
        );
        if (darkVariant) {
          themeId = darkVariant.id;
        }
      }
    }
    
    const foundTheme = THEME_CONFIGS.find(t => t.id === themeId);
    if (foundTheme) return foundTheme;
    
    // Fallback to light theme
    const lightTheme = THEME_CONFIGS.find(t => t.id === 'light');
    if (lightTheme) return lightTheme;
    
    // Final fallback - return first theme (this should never happen)
    return THEME_CONFIGS[0]!;
  };

  const currentTheme = getCurrentThemeConfig();

  // Apply theme when it changes
  useEffect(() => {
    applyThemeClasses(currentTheme);
    setTheme(currentTheme.isDark ? 'dark' : 'light');
  }, [currentTheme, setTheme]);

  // Update theme preference
  const updateThemePreference = <K extends keyof EnhancedThemePreferences>(
    key: K,
    value: EnhancedThemePreferences[K]
  ) => {
    const updated = { ...themePreferences, [key]: value };
    queryClient.setQueryData(['enhancedThemePreferences'], updated);
    saveThemePreferencesToStorage(updated);
    queryClient.invalidateQueries({ queryKey: ['enhancedThemePreferences'] });
    
    return { success: true, message: 'Theme preference updated' };
  };

  // Set specific theme
  const setEnhancedTheme = (themeId: string) => {
    // Verify the theme exists
    const targetTheme = THEME_CONFIGS.find(t => t.id === themeId);
    if (!targetTheme) {
      console.error('Theme not found:', themeId);
      return;
    }
    
    // When user manually selects a theme, disable auto features to respect their choice
    const updatedPreferences = {
      ...themePreferences,
      selectedTheme: themeId,
      autoTimeOfDay: false, // Disable auto time-of-day when manually selecting
      autoSeasonal: false,  // Disable auto seasonal when manually selecting
    };
    
    queryClient.setQueryData(['enhancedThemePreferences'], updatedPreferences);
    saveThemePreferencesToStorage(updatedPreferences);
    queryClient.invalidateQueries({ queryKey: ['enhancedThemePreferences'] });
    
    // Also manually apply the theme immediately for instant feedback
    applyThemeClasses(targetTheme);
    setTheme(targetTheme.isDark ? 'dark' : 'light');
  };

  // Toggle auto-seasonal themes
  const toggleAutoSeasonal = () => {
    updateThemePreference('autoSeasonal', !themePreferences.autoSeasonal);
  };

  // Toggle auto time-based themes
  const toggleAutoTimeOfDay = () => {
    updateThemePreference('autoTimeOfDay', !themePreferences.autoTimeOfDay);
  };

  // Get themes by category
  const getThemesByCategory = () => {
    const categories = {
      seasonal: [] as ThemeConfig[],
      style: [] as ThemeConfig[],
      accessibility: [] as ThemeConfig[],
      custom: [] as ThemeConfig[],
    };
    
    THEME_CONFIGS.forEach(theme => {
      categories[theme.category].push(theme);
    });
    
    return categories;
  };

  // Reset to defaults
  const resetThemePreferences = () => {
    queryClient.setQueryData(['enhancedThemePreferences'], DEFAULT_THEME_PREFERENCES);
    saveThemePreferencesToStorage(DEFAULT_THEME_PREFERENCES);
    
    return { success: true, message: 'Theme preferences reset' };
  };

  return {
    // Current state
    currentTheme,
    themePreferences,
    isPending,
    
    // Available themes
    allThemes: THEME_CONFIGS,
    getThemesByCategory,
    
    // Theme management
    setEnhancedTheme,
    updateThemePreference,
    resetThemePreferences,
    
    // Auto features
    toggleAutoSeasonal,
    toggleAutoTimeOfDay,
    
    // Utilities
    getCurrentSeason: getCurrentSeason(),
    getTimeBasedTheme: getTimeBasedTheme(),
    
    // Theme info
    isMinimalTheme: currentTheme.isMinimal,
    isHighContrastTheme: currentTheme.isHighContrast,
    isDarkTheme: currentTheme.isDark,
  };
};

export default useEnhancedThemes; 