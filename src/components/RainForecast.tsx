'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import useRainDemoMode from '../lib/hooks/useRainDemoMode';

interface RainDataPoint {
  time: string;
  precipitation: number; // mm/h
  timestamp: number;
}

interface RainForecastProps {
  lat?: number;
  lon?: number;
}

// Generate demo rain data for the next 60 minutes
const generateDemoRainData = (): RainDataPoint[] => {
  const data: RainDataPoint[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 12; i++) {
    const timestamp = now + (i * 5 * 60 * 1000);
    const time = new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
    
    // Create realistic rain pattern with guaranteed rain
    let precipitation = Math.random() * 2 + 0.5; // Always at least 0.5mm/h
    if (i < 2 || i > 8) {
      precipitation = 0;
    }
    
    data.push({
      time,
      precipitation: Math.round(precipitation * 10) / 10,
      timestamp
    });
  }
  
  return data;
};

// Fetch real rain forecast data (placeholder - you'd integrate with a real API)
const fetchRainForecast = async (lat: number, lon: number): Promise<RainDataPoint[]> => {
  // For testing: always return no rain in real mode
  return generateZeroRainData();
};

// Helper to generate zero rain data
const generateZeroRainData = (): RainDataPoint[] => {
  const data: RainDataPoint[] = [];
  const now = Date.now();
  for (let i = 0; i < 12; i++) {
    const timestamp = now + (i * 5 * 60 * 1000);
    const time = new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
    data.push({ time, precipitation: 0, timestamp });
  }
  return data;
};

const getRainIntensityColor = (precipitation: number): string => {
  if (precipitation === 0) return 'bg-gray-200 dark:bg-gray-700';
  if (precipitation < 0.5) return 'bg-blue-200 dark:bg-blue-800';
  if (precipitation < 1.0) return 'bg-blue-400 dark:bg-blue-600';
  if (precipitation < 2.0) return 'bg-blue-600 dark:bg-blue-500';
  return 'bg-blue-800 dark:bg-blue-400';
};

const getRainIntensityText = (precipitation: number): string => {
  if (precipitation === 0) return 'No rain';
  if (precipitation < 0.5) return 'Light';
  if (precipitation < 1.0) return 'Moderate';
  if (precipitation < 2.0) return 'Heavy';
  return 'Very heavy';
};

const RainForecast: React.FC<RainForecastProps> = ({ lat, lon }) => {
  const [rainData, setRainData] = useState<RainDataPoint[]>([]);
  const { isDemoMode, toggleDemoMode } = useRainDemoMode();

  // Query for real rain data
  const { data: realRainData, isPending: isRealDataPending } = useQuery({
    queryKey: ['rainForecast', lat, lon],
    queryFn: () => lat && lon ? fetchRainForecast(lat, lon) : Promise.resolve([]),
    enabled: !!lat && !!lon && !isDemoMode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Update rain data based on mode
  useEffect(() => {
    if (isDemoMode) {
      setRainData(generateDemoRainData());
    } else if (realRainData) {
      setRainData(realRainData);
    } else {
      setRainData([]);
    }
  }, [isDemoMode, realRainData]);

  const maxPrecipitation = Math.max(...rainData.map(d => d.precipitation), 1);
  const hasRain = rainData.some(d => d.precipitation > 0);

  if (!isDemoMode && !hasRain && !isRealDataPending) {
    return null; // Hide if no rain in real mode
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary font-semibold">🌧️ Rain Forecast</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${isDemoMode ? 'text-blue-400' : 'text-muted'}`}>
            Demo
          </span>
          <button
            onClick={toggleDemoMode}
            className={`
              relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200
              ${isDemoMode 
                ? 'bg-blue-500' 
                : 'bg-gray-300 dark:bg-gray-600'
              }
            `}
            aria-label="Toggle demo mode"
          >
            <span
              className={`
                inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200
                ${isDemoMode ? 'translate-x-5' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {isRealDataPending && !isDemoMode ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
          <span className="ml-3 text-muted text-sm">Loading rain forecast...</span>
        </div>
      ) : rainData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted">No rain forecast data available</p>
          <p className="text-muted text-sm mt-1">Try enabling demo mode to see a sample forecast</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="mb-6">
            {hasRain ? (
              <div className="flex items-center space-x-2">
                <span className="text-blue-500">💧</span>
                <span className="text-primary text-sm">
                  Rain expected in the next hour
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-green-500">☀️</span>
                <span className="text-primary text-sm">
                  No rain expected in the next hour
                </span>
              </div>
            )}
          </div>

          {/* Graph */}
          <div className="space-y-3">
            <div className="flex items-end justify-between h-32 px-2">
              {rainData.map((point, index) => {
                const height = (point.precipitation / maxPrecipitation) * 100;
                const barHeight = Math.max(height, 2); // Minimum height for visibility
                
                return (
                  <div key={index} className="flex flex-col items-center space-y-1 flex-1">
                    {/* Precipitation value (on hover/tap) */}
                    <div className="text-xs text-muted opacity-0 hover:opacity-100 transition-opacity duration-200">
                      {point.precipitation > 0 ? `${point.precipitation}mm` : ''}
                    </div>
                    
                    {/* Bar */}
                    <div
                      className={`
                        w-3 transition-all duration-300 rounded-t-sm
                        ${getRainIntensityColor(point.precipitation)}
                        hover:opacity-80
                      `}
                      style={{ height: `${barHeight}%` }}
                      title={`${point.time}: ${point.precipitation}mm/h (${getRainIntensityText(point.precipitation)})`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Time labels */}
            <div className="flex justify-between text-xs text-muted px-2">
              {rainData.map((point, index) => (
                <span key={index} className={index % 2 === 0 ? '' : 'opacity-50'}>
                  {index % 2 === 0 ? point.time : ''}
                </span>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <span className="text-muted">No rain</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-800"></div>
                    <span className="text-muted">Light</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded bg-blue-600 dark:bg-blue-500"></div>
                    <span className="text-muted">Heavy</span>
                  </div>
                </div>
                <span className="text-muted">Next 60 minutes</span>
              </div>
            </div>
          </div>

          {/* Additional info */}
          {isDemoMode && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                📊 Demo Mode: Showing sample rain forecast data
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RainForecast; 