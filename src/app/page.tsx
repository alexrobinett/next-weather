'use client';

import { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

import CurrentWeather from '../components/CurrentWeather';
import MultiCityWidget from '../components/MultiCityWidget';
import AirQualityCard from '../components/AirQualityCard';
import WeatherRadar from '../components/WeatherRadar';
import DailyForecast from '../components/DailyForecast';
import HourlyForecast from '../components/HourlyForecast';
import RainForecast from '../components/RainForecast';
import SettingsPanel from '../components/SettingsPanel';
import DraggableWidgetContainer from '../components/DraggableWidgetContainer';
import useUserPreferences from '../lib/hooks/useUserPreferences';
import useUserLocation from '../lib/hooks/useUserLocation';
import useWeatherData from '../lib/hooks/useWeatherData';
import useWidgetCustomization from '../lib/hooks/useWidgetCustomization';
import useEnhancedThemes from '../lib/hooks/useEnhancedThemes';
import useRainDemoMode from '../lib/hooks/useRainDemoMode';

const weatherComments = [
  "Looking absolutely gorgeous out there! ☀️",
  "Perfect weather for a stroll! 🚶‍♀️",
  "Mother Nature is showing off today! 🌈",
  "What a delightful day to be alive! 🌸",
  "The weather gods are smiling! ⭐",
  "Pure meteorological perfection! 🎯",
  "Time to soak up this beautiful day! 🌻",
  "Weather this good should be illegal! 😄"
];

const getRandomComment = () => weatherComments[Math.floor(Math.random() * weatherComments.length)];

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  
  const { data: location } = useUserLocation();
  const { data: weatherData, isPending: weatherIsPending } = useWeatherData(location?.latitude, location?.longitude);
  const { preferences } = useUserPreferences();
  const { isWidgetEnabled } = useWidgetCustomization();
  const { 
    currentTheme, 
    allThemes, 
    getThemesByCategory, 
    setEnhancedTheme,
    isMinimalTheme 
  } = useEnhancedThemes();

  const { isDemoMode, toggleDemoMode } = useRainDemoMode();

  const themeCategories = getThemesByCategory();
  
  // Prevent hydration mismatch by only applying themes after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle theme button click and get position
  const handleThemeButtonClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setButtonPosition({
      x: rect.right - 320, // 320px is the width of the menu
      y: rect.bottom + 8
    });
    setShowThemeSelector(!showThemeSelector);
  };

  // Show a loading state until mounted to prevent flash
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌤️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Weather Glass</h1>
          <p className="text-gray-600 dark:text-gray-400">Loading your personalized weather experience...</p>
        </div>
      </div>
    );
  }

  // Render widget based on widget ID
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'current-weather':
        return <CurrentWeather />;
      
      case 'favorite-cities':
        return <MultiCityWidget />;
      
      case 'air-quality':
        return location ? (
          <AirQualityCard lat={location.latitude} lon={location.longitude} />
        ) : null;
      
      case 'weather-radar':
        return location ? (
          <WeatherRadar lat={location.latitude} lon={location.longitude} />
        ) : null;
      
      case 'hourly-forecast':
        return weatherData ? (
          <HourlyForecast weatherData={weatherData} />
        ) : weatherIsPending ? (
          <div className="glass-card p-6">
            <h3 className="text-primary font-semibold mb-4">⏰ Hourly Forecast</h3>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="ml-3 text-muted">Loading hourly forecast...</span>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6">
            <h3 className="text-primary font-semibold mb-4">⏰ Hourly Forecast</h3>
            <p className="text-muted">Location required for forecast data</p>
          </div>
        );
      
      case 'daily-forecast':
        return weatherData ? (
          <DailyForecast weatherData={weatherData} />
        ) : weatherIsPending ? (
          <div className="glass-card p-6">
            <h3 className="text-primary font-semibold mb-4">📅 7-Day Forecast</h3>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="ml-3 text-muted">Loading 7-day forecast...</span>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6">
            <h3 className="text-primary font-semibold mb-4">📅 7-Day Forecast</h3>
            <p className="text-muted">Location required for forecast data</p>
          </div>
        );
      
      case 'rain-forecast':
        return <RainForecast lat={location?.latitude} lon={location?.longitude} />;
      
      case 'historical-weather':
        return (
          <div className="glass-card p-6">
            <h3 className="text-primary font-semibold mb-4">📊 Historical Data</h3>
            <p className="text-muted">Coming soon - weather trends and comparisons</p>
          </div>
        );
      
      case 'weather-stats':
        return (
          <div className="glass-card p-6">
            <h3 className="text-primary font-semibold mb-4">📈 Weather Statistics</h3>
            <p className="text-muted">Coming soon - detailed weather metrics</p>
          </div>
        );
      
      case 'weather-alerts':
        return (
          <div className="glass-card p-6">
            <h3 className="text-primary font-semibold mb-4">⚠️ Weather Alerts</h3>
            <div className="text-center text-green-600 dark:text-green-400">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-primary">No active weather alerts</p>
              <p className="text-muted text-sm mt-1">All clear in your area</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`
      min-h-screen transition-all duration-300 theme-transition
      ${preferences.compactMode ? 'compact-mode' : ''}
      ${preferences.highContrast ? 'high-contrast' : ''}
      ${preferences.largeText ? 'large-text' : ''}
      ${currentTheme.cssClass}
      ${isMinimalTheme ? 'minimal-theme' : ''}
      ${currentTheme.isHighContrast ? 'high-contrast-theme' : ''}
    `}>
      {/* Dynamic Background */}
      <div className="fixed inset-0" />
      
      {/* Header */}
      <header className="relative z-10 glass-card mx-4 mt-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-primary text-2xl font-bold">
              Weather Glass
            </h1>
            <p className="text-muted text-sm mt-1">
              {getRandomComment()}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Rain Demo Toggle */}
            <button
              onClick={toggleDemoMode}
              className={`
                glass-card px-3 py-1 text-sm font-medium transition-all duration-200 hover:scale-105
                ${isDemoMode ? 'bg-blue-500/20 text-blue-400' : 'text-secondary hover:text-primary'}
              `}
              aria-label={isDemoMode ? 'Disable rain demo mode' : 'Enable rain demo mode'}
              title="Toggle rain forecast demo mode"
            >
              Demo {isDemoMode ? 'On' : 'Off'}
            </button>

            {/* Enhanced Theme Selector */}
            <button
              onClick={handleThemeButtonClick}
              className="glass-card p-2 text-secondary hover:text-primary transition-all duration-200 hover:scale-105"
              aria-label="Change theme"
              title={`Current theme: ${currentTheme.name}`}
            >
              <span className="text-lg">{currentTheme.preview}</span>
            </button>
            
            {/* Widget Customization Toggle */}
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`
                glass-card p-2 transition-all duration-200 hover:scale-105
                ${isCustomizing 
                  ? 'text-blue-400 bg-blue-500/20' 
                  : 'text-secondary hover:text-primary'
                }
              `}
              aria-label="Customize widgets"
              title="Customize widget layout"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="glass-card p-2 text-secondary hover:text-primary transition-all duration-200 hover:scale-105"
              aria-label="Open settings"
              title="Settings & Accessibility"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Theme Selector Menu */}
      {showThemeSelector && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99998]"
            onClick={() => setShowThemeSelector(false)}
          />
          
          {/* Theme Menu */}
          <div 
            className="fixed w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-xl p-4 shadow-2xl z-[99999]"
            style={{
              left: `${buttonPosition.x}px`,
              top: `${buttonPosition.y}px`,
            }}
          >
            <h3 className="text-primary font-semibold mb-3">Choose Theme</h3>
            
            {Object.entries(themeCategories).map(([category, themes]) => (
              <div key={category} className="mb-4">
                <h4 className="text-secondary text-sm font-medium mb-2 capitalize">
                  {category}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setEnhancedTheme(theme.id);
                        setShowThemeSelector(false);
                      }}
                      className={`
                        flex items-center space-x-2 p-2 rounded-lg text-sm transition-all duration-200
                        ${currentTheme.id === theme.id
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-gray-100/50 dark:bg-gray-800/50 text-muted hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                        }
                      `}
                    >
                      <span className="text-lg">{theme.preview}</span>
                      <span className="truncate">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-muted text-xs">
                Current: {currentTheme.name} • {currentTheme.category}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Customization Status */}
      {isCustomizing && (
        <div className="relative z-10 mx-4 mt-4">
          <div className="glass-card p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Squares2X2Icon className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Widget Customization Active</span>
              </div>
              <button
                onClick={() => setIsCustomizing(false)}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
              >
                Exit Customization
              </button>
            </div>
            <p className="text-muted text-xs mt-1">
              Drag widgets to reorder them, toggle visibility, or hide/show different components.
            </p>
          </div>
        </div>
      )}

      {/* Main Content - Draggable Widgets */}
      <main className="relative z-10 container mx-auto px-4 py-6">
        <DraggableWidgetContainer
          isCustomizing={isCustomizing}
          onToggleCustomization={() => setIsCustomizing(!isCustomizing)}
        >
          {(widgetId, widget) => {
            const renderedWidget = renderWidget(widgetId);
            return renderedWidget ? (
              <div key={widgetId} className="widget-container">
                {renderedWidget}
              </div>
            ) : null;
          }}
        </DraggableWidgetContainer>
      </main>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Accessibility Status */}
      <footer className="relative z-10 p-4">
        <div className="glass-card p-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-muted">
                Theme: {currentTheme.name} {currentTheme.preview}
              </span>
              <span className="text-muted">
                Season: {currentTheme.category === 'seasonal' ? currentTheme.name : 'Auto'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-muted">Accessibility:</span>
              {preferences.screenReaderOptimized && <span>🔊</span>}
              {preferences.highContrast && <span>🔆</span>}
              {preferences.largeText && <span>📖</span>}
              {preferences.reducedMotion && <span>⏸️</span>}
              {!preferences.screenReaderOptimized && !preferences.highContrast && !preferences.largeText && !preferences.reducedMotion && (
                <span>✨</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

