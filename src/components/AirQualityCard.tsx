'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

import useAirQuality from '../lib/hooks/useAirQuality';

interface AirQualityCardProps {
  lat?: number;
  lon?: number;
  className?: string;
}

const AirQualityCard = ({ lat, lon, className = '' }: AirQualityCardProps) => {
  const { aqiInfo, pollutants, isPending, error, isError, lastUpdated } = useAirQuality(lat, lon);

  if (!lat || !lon) {
    return null;
  }

  if (isError) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardContent className="p-6 text-center">
          <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-secondary text-sm">
            Unable to load air quality data
          </p>
          <p className="text-muted text-xs mt-1">
            {error?.message || 'Please try again later'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-primary text-lg">
          <div className="w-5 h-5 mr-2 text-accent">
            {isPending ? (
              <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            ) : aqiInfo?.index === 1 ? (
              <CheckCircleIcon className="text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="text-orange-500" />
            )}
          </div>
          Air Quality Index
        </CardTitle>
        
        {lastUpdated && !isPending && (
          <div className="flex items-center text-muted text-xs">
            <ClockIcon className="w-3 h-3 mr-1" />
            Updated {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardHeader>

      <CardContent className="px-6 pb-6">
        {isPending ? (
          // Loading state
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full shimmer" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-24 shimmer" />
                <Skeleton className="h-4 w-32 shimmer" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full shimmer" />
              <Skeleton className="h-4 w-3/4 shimmer" />
            </div>
          </div>
        ) : aqiInfo ? (
          <div className="space-y-6">
            {/* Main AQI Display */}
            <div className="flex items-center space-x-4">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center text-2xl
                ${aqiInfo.bgColor}
              `}>
                <span>{aqiInfo.icon}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-primary">
                    {aqiInfo.index}
                  </span>
                  <span className={`text-lg font-semibold ${aqiInfo.color}`}>
                    {aqiInfo.level}
                  </span>
                </div>
                <p className="text-secondary text-sm mt-1">
                  {aqiInfo.description}
                </p>
              </div>
            </div>

            {/* Health Recommendations */}
            <div className={`p-4 rounded-lg border ${aqiInfo.bgColor}`}>
              <div className="flex items-center mb-3">
                <InformationCircleIcon className={`w-4 h-4 mr-2 ${aqiInfo.color}`} />
                <h3 className={`font-semibold text-sm ${aqiInfo.color}`}>
                  Health Recommendations
                </h3>
              </div>
              <ul className="space-y-1">
                {aqiInfo.healthRecommendations.map((recommendation, index) => (
                  <li key={index} className="text-secondary text-sm flex items-start">
                    <span className="text-muted mr-2">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pollutant Details */}
            {pollutants && (
              <div>
                <h3 className="text-primary font-semibold text-sm mb-3">
                  Pollutant Levels
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(pollutants).map(([key, pollutant]) => {
                    const isHigh = pollutant.level === 'High' || pollutant.level === 'Very High' || pollutant.level === 'Extremely High';
                    
                    return (
                      <div 
                        key={key}
                        className={`
                          p-3 rounded-lg border transition-colors
                          ${isHigh 
                            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50' 
                            : 'glass-card'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-primary font-medium text-sm">
                            {pollutant.name}
                          </span>
                          <span className={`
                            text-xs font-medium px-2 py-1 rounded-full
                            ${isHigh 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            }
                          `}>
                            {pollutant.level}
                          </span>
                        </div>
                        <div className="text-secondary text-xs">
                          {Math.round(pollutant.value)} {pollutant.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AQI Scale Reference */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-primary font-semibold text-sm mb-3">
                AQI Scale
              </h3>
              <div className="space-y-2">
                {[
                  { range: '1', level: 'Good', color: 'text-green-600', bg: 'bg-green-100' },
                  { range: '2', level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' },
                  { range: '3', level: 'Moderate', color: 'text-orange-600', bg: 'bg-orange-100' },
                  { range: '4', level: 'Poor', color: 'text-red-600', bg: 'bg-red-100' },
                  { range: '5', level: 'Very Poor', color: 'text-purple-600', bg: 'bg-purple-100' },
                ].map((scale) => (
                  <div key={scale.range} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${scale.bg}`} />
                    <span className="text-xs text-secondary">
                      <span className="font-medium">{scale.range}</span> - {scale.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // No data state
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
              <InformationCircleIcon className="w-6 h-6 text-muted" />
            </div>
            <p className="text-secondary text-sm">
              Air quality data not available
            </p>
            <p className="text-muted text-xs mt-1">
              Please check your connection and try again
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AirQualityCard; 