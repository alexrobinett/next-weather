'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Cog6ToothIcon,
  EyeIcon,
  SpeakerWaveIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import useUserPreferences, { type UserPreferences } from '../lib/hooks/useUserPreferences';

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

const ToggleSwitch = ({ enabled, onToggle, label, description, disabled = false }: ToggleSwitchProps) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0">
        <label className="text-sm font-medium text-primary cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => !disabled && onToggle(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50
          ${enabled 
            ? 'bg-blue-600' 
            : 'bg-gray-300 dark:bg-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={label}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
};

interface SelectInputProps {
  value: string;
  onSelect: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
  description?: string;
}

const SelectInput = ({ value, onSelect, options, label, description }: SelectInputProps) => {
  return (
    <div className="py-3">
      <label className="text-sm font-medium text-primary block mb-2">
        {label}
      </label>
      {description && (
        <p className="text-xs text-muted mb-2">{description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onSelect(e.target.value)}
        className="glass-card w-full px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface SliderInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  description?: string;
  unit?: string;
}

const SliderInput = ({ value, onChange, min, max, step, label, description, unit }: SliderInputProps) => {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-primary">
          {label}
        </label>
        <span className="text-sm text-secondary">
          {value}{unit}
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted mb-2">{description}</p>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );
};

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const { 
    preferences, 
    updatePreference, 
    resetPreferences,
    shouldReduceMotion,
    isAccessibilityMode 
  } = useUserPreferences();

  const [activeTab, setActiveTab] = useState<'accessibility' | 'display' | 'weather' | 'notifications' | 'privacy'>('accessibility');

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      resetPreferences();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'accessibility', label: 'Accessibility', icon: EyeIcon },
    { id: 'display', label: 'Display', icon: Cog6ToothIcon },
    { id: 'weather', label: 'Weather', icon: ArrowPathIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center text-primary text-xl">
            <Cog6ToothIcon className="w-6 h-6 mr-3 text-accent" />
            Settings
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="text-xs text-muted hover:text-secondary px-3 py-1 rounded-lg transition-colors duration-200"
            >
              Reset All
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted hover:text-primary transition-colors duration-200"
              aria-label="Close settings"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <div className="flex flex-col sm:flex-row h-full">
          {/* Tabs */}
          <div className="sm:w-48 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700">
            <nav className="flex sm:flex-col overflow-x-auto sm:overflow-x-visible p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:block">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <CardContent className="p-6">
              {activeTab === 'accessibility' && (
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Accessibility & Motion
                  </h3>
                  
                  <ToggleSwitch
                    enabled={preferences.reducedMotion}
                    onToggle={(value) => updatePreference('reducedMotion', value)}
                    label="Reduce Motion"
                    description="Minimizes animations and transitions for better accessibility"
                  />
                  
                  <ToggleSwitch
                    enabled={preferences.disableAnimations}
                    onToggle={(value) => updatePreference('disableAnimations', value)}
                    label="Disable All Animations"
                    description="Completely removes all animations and transitions"
                  />
                  
                  <SelectInput
                    value={preferences.animationSpeed}
                    onSelect={(value) => updatePreference('animationSpeed', value as 'slow' | 'normal' | 'fast')}
                    options={[
                      { value: 'slow', label: 'Slow' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'fast', label: 'Fast' },
                    ]}
                    label="Animation Speed"
                    description="Adjust the speed of animations when enabled"
                  />
                  
                  <ToggleSwitch
                    enabled={preferences.highContrast}
                    onToggle={(value) => updatePreference('highContrast', value)}
                    label="High Contrast Mode"
                    description="Increases contrast for better visibility"
                  />
                  
                  <ToggleSwitch
                    enabled={preferences.largeText}
                    onToggle={(value) => updatePreference('largeText', value)}
                    label="Large Text"
                    description="Increases text size throughout the app"
                  />
                  
                  <ToggleSwitch
                    enabled={preferences.screenReaderOptimized}
                    onToggle={(value) => updatePreference('screenReaderOptimized', value)}
                    label="Screen Reader Optimized"
                    description="Optimizes the interface for screen readers"
                  />
                </div>
              )}

              {activeTab === 'display' && (
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Display Preferences
                  </h3>
                  
                  <ToggleSwitch
                    enabled={preferences.compactMode}
                    onToggle={(value) => updatePreference('compactMode', value)}
                    label="Compact Mode"
                    description="Reduces spacing for more information on screen"
                  />
                  
                  <ToggleSwitch
                    enabled={preferences.showSeconds}
                    onToggle={(value) => updatePreference('showSeconds', value)}
                    label="Show Seconds"
                    description="Display seconds in time formats"
                  />
                  
                  <ToggleSwitch
                    enabled={preferences.autoRefresh}
                    onToggle={(value) => updatePreference('autoRefresh', value)}
                    label="Auto Refresh"
                    description="Automatically update weather data"
                  />
                  
                  {preferences.autoRefresh && (
                    <SliderInput
                      value={preferences.refreshInterval}
                      onChange={(value) => updatePreference('refreshInterval', value)}
                      min={1}
                      max={60}
                      step={1}
                      label="Refresh Interval"
                      description="How often to update weather data"
                      unit=" min"
                    />
                  )}
                </div>
              )}

              {activeTab === 'weather' && (
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Weather Display
                  </h3>
                  
                  <SelectInput
                    value={preferences.temperatureUnit}
                    onSelect={(value) => updatePreference('temperatureUnit', value as 'celsius' | 'fahrenheit')}
                    options={[
                      { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
                      { value: 'celsius', label: 'Celsius (°C)' },
                    ]}
                    label="Temperature Unit"
                    description="Choose your preferred temperature scale"
                  />
                  
                  <SelectInput
                    value={preferences.windUnit}
                    onSelect={(value) => updatePreference('windUnit', value as 'mph' | 'kph' | 'ms')}
                    options={[
                      { value: 'mph', label: 'Miles per hour (mph)' },
                      { value: 'kph', label: 'Kilometers per hour (kph)' },
                      { value: 'ms', label: 'Meters per second (m/s)' },
                    ]}
                    label="Wind Speed Unit"
                    description="Choose your preferred wind speed measurement"
                  />
                  
                  <SelectInput
                    value={preferences.pressureUnit}
                    onSelect={(value) => updatePreference('pressureUnit', value as 'hPa' | 'inHg' | 'mmHg')}
                    options={[
                      { value: 'hPa', label: 'Hectopascals (hPa)' },
                      { value: 'inHg', label: 'Inches of mercury (inHg)' },
                      { value: 'mmHg', label: 'Millimeters of mercury (mmHg)' },
                    ]}
                    label="Pressure Unit"
                    description="Choose your preferred pressure measurement"
                  />
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Notifications & Alerts
                  </h3>
                  
                  <ToggleSwitch
                    enabled={preferences.weatherAlerts}
                    onToggle={(value) => updatePreference('weatherAlerts', value)}
                    label="Weather Alerts"
                    description="Show severe weather warnings and advisories"
                  />
                  
                  <ToggleSwitch
                    enabled={preferences.soundEnabled}
                    onToggle={(value) => updatePreference('soundEnabled', value)}
                    label="Sound Effects"
                    description="Play sounds for notifications and interactions"
                  />
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Privacy & Data
                  </h3>
                  
                  <ToggleSwitch
                    enabled={preferences.saveLocation}
                    onToggle={(value) => updatePreference('saveLocation', value)}
                    label="Save Location"
                    description="Remember your location for faster weather updates"
                  />
                  
                  <ToggleSwitch
                    enabled={preferences.shareUsageData}
                    onToggle={(value) => updatePreference('shareUsageData', value)}
                    label="Share Usage Data"
                    description="Help improve the app by sharing anonymous usage statistics"
                  />
                  
                  <div className="mt-6 p-4 glass-card border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-primary mb-2">Data Storage</h4>
                    <p className="text-xs text-muted">
                      Your preferences and favorite cities are stored locally on your device. 
                      No personal data is sent to external servers beyond weather API requests.
                    </p>
                  </div>
                </div>
              )}

              {/* Status indicators */}
              {(shouldReduceMotion || isAccessibilityMode) && (
                <div className="mt-6 p-4 glass-card border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
                    Accessibility Features Active
                  </h4>
                  <ul className="text-xs text-muted space-y-1">
                    {shouldReduceMotion && <li>• Reduced motion enabled</li>}
                    {preferences.highContrast && <li>• High contrast mode enabled</li>}
                    {preferences.largeText && <li>• Large text enabled</li>}
                    {preferences.screenReaderOptimized && <li>• Screen reader optimizations enabled</li>}
                  </ul>
                </div>
              )}
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel; 