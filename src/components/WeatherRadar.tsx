'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  MapIcon,
  Squares2X2Icon as LayersIcon,
  ClockIcon,
  MagnifyingGlassPlusIcon as ZoomInIcon,
  MagnifyingGlassMinusIcon as ZoomOutIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

import useWeatherRadar from '../lib/hooks/useWeatherRadar';
import useUserLocation from '../lib/hooks/useUserLocation';
import useUserPreferences from '../lib/hooks/useUserPreferences';

interface WeatherRadarProps {
  lat?: number;
  lon?: number;
  className?: string;
}

const WeatherRadar = ({ lat, lon, className = '' }: WeatherRadarProps) => {
  const { data: location } = useUserLocation();
  const { shouldReduceMotion } = useUserPreferences();
  
  // Use provided coordinates or fall back to user location
  const radarLat = lat || location?.latitude;
  const radarLon = lon || location?.longitude;
  
  const [zoom, setZoom] = useState(8);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState('precipitation_new');
  
  const animationRef = useRef<NodeJS.Timeout>();

  const {
    radarData,
    precipitationIntensity,
    isLoading,
    error,
    isRadarAvailable,
    layers,
    toggleLayer,
    updateLayerOpacity,
    getVisibleLayers,
    getTilesForLayer,
    getAnimationTimestamps,
    getCoverageStatus: coverageStatus,
    lastUpdated,
    refresh,
  } = useWeatherRadar(radarLat, radarLon, {
    zoom,
    enableAnimation: true,
    refreshInterval: 10 * 60 * 1000,
  });

  const animationTimestamps = getAnimationTimestamps();
  const visibleLayers = getVisibleLayers();

  // Handle animation
  useEffect(() => {
    if (isAnimating && animationTimestamps.length > 0 && !shouldReduceMotion) {
      animationRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % animationTimestamps.length);
      }, 1000); // 1 second per frame
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isAnimating, animationTimestamps.length, shouldReduceMotion]);

  const handlePlayPause = () => {
    if (shouldReduceMotion) return;
    setIsAnimating(!isAnimating);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 12));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 4));
  };

  const handleLayerToggle = (layerId: string) => {
    toggleLayer(layerId);
  };

  const getCurrentTimestamp = () => {
    if (animationTimestamps.length === 0) return Date.now();
    return animationTimestamps[currentFrame] || animationTimestamps[0];
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPrecipitationColor = (type: string) => {
    switch (type) {
      case 'none': return 'text-gray-500';
      case 'light': return 'text-blue-400';
      case 'moderate': return 'text-blue-600';
      case 'heavy': return 'text-blue-800';
      case 'extreme': return 'text-purple-600';
      default: return 'text-gray-500';
    }
  };

  const getRadarTileStyle = (opacity: number) => ({
    opacity: opacity,
    mixBlendMode: 'multiply' as const,
    pointerEvents: 'none' as const,
  });

  if (error) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="text-center">
          <MapIcon className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-primary font-semibold mb-2">Radar Unavailable</h3>
          <p className="text-muted text-sm mb-4">
            Unable to load weather radar data. This might be due to location permissions or API limitations.
          </p>
          <button
            onClick={refresh}
            className="glass-card px-4 py-2 text-sm text-primary hover:bg-white/20 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-primary font-semibold">Weather Radar</h3>
            {precipitationIntensity && (
              <span className={`text-xs px-2 py-1 rounded-full bg-black/20 ${getPrecipitationColor(precipitationIntensity.type)}`}>
                {precipitationIntensity.description}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowControls(!showControls)}
              className="glass-card p-2 text-secondary hover:text-primary transition-colors duration-200"
              aria-label="Toggle controls"
            >
              <LayersIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={refresh}
              className="glass-card p-2 text-secondary hover:text-primary transition-colors duration-200"
              aria-label="Refresh radar"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {lastUpdated && (
          <p className="text-muted text-xs mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Radar Display */}
      <div className="relative bg-gray-900 aspect-square overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-white">
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading radar...</span>
            </div>
          </div>
        ) : isRadarAvailable ? (
          <>
            {/* Base Map Tiles */}
            <div className="absolute inset-0">
              {getTilesForLayer('precipitation_new', getCurrentTimestamp()).map((tile, index) => (
                <div
                  key={`${tile.x}-${tile.y}-${tile.timestamp}`}
                  className="absolute inset-0"
                  style={getRadarTileStyle(0.8)}
                >
                  <Image
                    src={tile.url}
                    alt="Weather radar tile"
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => {
                      // Handle tile load error silently
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Location Marker */}
            {radarLat && radarLon && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
              </div>
            )}

            {/* Coverage Status */}
            <div className="absolute top-2 left-2">
              <div className={`
                px-2 py-1 rounded text-xs font-medium
                ${coverageStatus === 'full' ? 'bg-green-500/80 text-white' :
                  coverageStatus === 'partial' ? 'bg-yellow-500/80 text-white' :
                  'bg-red-500/80 text-white'}
              `}>
                {coverageStatus === 'full' ? 'Full Coverage' :
                 coverageStatus === 'partial' ? 'Partial Coverage' :
                 'No Data'}
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-2 right-2 flex flex-col space-y-1">
              <button
                onClick={handleZoomIn}
                className="glass-card p-1 text-white hover:bg-white/20 transition-colors duration-200"
                aria-label="Zoom in"
              >
                <ZoomInIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="glass-card p-1 text-white hover:bg-white/20 transition-colors duration-200"
                aria-label="Zoom out"
              >
                <ZoomOutIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Animation Controls */}
            {animationTimestamps.length > 0 && (
              <div className="absolute bottom-2 left-2 right-2">
                <div className="glass-card p-2">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={handlePlayPause}
                      className={`
                        flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors duration-200
                        ${shouldReduceMotion 
                          ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' 
                          : 'bg-blue-500/80 text-white hover:bg-blue-600/80'
                        }
                      `}
                      disabled={shouldReduceMotion}
                    >
                      {isAnimating ? (
                        <PauseIcon className="w-4 h-4" />
                      ) : (
                        <PlayIcon className="w-4 h-4" />
                      )}
                      <span>{isAnimating ? 'Pause' : 'Play'}</span>
                    </button>
                    
                    <div className="flex items-center space-x-1 text-white text-xs">
                      <ClockIcon className="w-3 h-3" />
                      <span>{formatTimestamp(getCurrentTimestamp() || Date.now())}</span>
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div className="flex space-x-1">
                    {animationTimestamps.map((timestamp, index) => (
                      <button
                        key={timestamp}
                        onClick={() => setCurrentFrame(index)}
                        className={`
                          flex-1 h-1 rounded transition-colors duration-200
                          ${index === currentFrame ? 'bg-blue-400' : 'bg-white/30 hover:bg-white/50'}
                        `}
                        aria-label={`Go to frame ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <MapIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No radar data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Layer Controls */}
      {showControls && (
        <div className="p-4 border-t border-white/10">
          <h4 className="text-primary text-sm font-medium mb-3">Radar Layers</h4>
          
          <div className="grid grid-cols-2 gap-2">
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => handleLayerToggle(layer.id)}
                className={`
                  flex items-center justify-between p-2 rounded-lg text-sm transition-all duration-200
                  ${layer.visible 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-black/10 text-muted border border-transparent hover:bg-black/20'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  {layer.visible ? (
                    <EyeIcon className="w-4 h-4" />
                  ) : (
                    <EyeSlashIcon className="w-4 h-4" />
                  )}
                  <span className="truncate">{layer.name}</span>
                </div>
                
                {layer.visible && (
                  <div className="w-2 h-2 bg-current rounded-full opacity-80" />
                )}
              </button>
            ))}
          </div>

          {precipitationIntensity && precipitationIntensity.intensity > 0 && (
            <div className="mt-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400">Current Intensity</span>
                <span className="text-primary font-medium">
                  {precipitationIntensity.intensity.toFixed(1)} mm/h
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-300 rounded-full" />
              <span className="text-muted">Light</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span className="text-muted">Moderate</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-800 rounded-full" />
              <span className="text-muted">Heavy</span>
            </div>
          </div>
          
          <span className="text-muted">Zoom: {zoom}x</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherRadar; 