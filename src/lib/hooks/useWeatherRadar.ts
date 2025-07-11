'use client'
import { useQuery } from '@tanstack/react-query';

export interface RadarLayer {
  id: string;
  name: string;
  description: string;
  opacity: number;
  visible: boolean;
  zIndex: number;
}

export interface RadarTile {
  url: string;
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface WeatherRadarData {
  tiles: RadarTile[];
  layers: RadarLayer[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    lat: number;
    lon: number;
  };
  zoom: number;
  lastUpdated: Date;
}

export interface RadarSettings {
  autoPlay: boolean;
  playSpeed: number; // frames per second
  showTimestamps: boolean;
  loopAnimation: boolean;
  maxFrames: number;
}

const AVAILABLE_LAYERS: RadarLayer[] = [
  {
    id: 'precipitation_new',
    name: 'Precipitation',
    description: 'Live precipitation intensity',
    opacity: 0.8,
    visible: true,
    zIndex: 2,
  },
  {
    id: 'clouds_new',
    name: 'Clouds',
    description: 'Cloud coverage',
    opacity: 0.6,
    visible: false,
    zIndex: 1,
  },
  {
    id: 'pressure_new',
    name: 'Pressure',
    description: 'Sea level pressure',
    opacity: 0.7,
    visible: false,
    zIndex: 1,
  },
  {
    id: 'wind_new',
    name: 'Wind',
    description: 'Wind speed and direction',
    opacity: 0.7,
    visible: false,
    zIndex: 1,
  },
  {
    id: 'temp_new',
    name: 'Temperature',
    description: 'Surface temperature',
    opacity: 0.7,
    visible: false,
    zIndex: 1,
  },
];

const DEFAULT_RADAR_SETTINGS: RadarSettings = {
  autoPlay: false,
  playSpeed: 2,
  showTimestamps: true,
  loopAnimation: true,
  maxFrames: 10,
};

// Get tile coordinates for given lat/lon and zoom level
const getTileCoordinates = (lat: number, lon: number, zoom: number) => {
  const x = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
  const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
  return { x, y, z: zoom };
};

// Generate radar tiles for given bounds and zoom
const generateRadarTiles = (
  lat: number, 
  lon: number, 
  zoom: number, 
  layer: string,
  apiKey: string,
  timestamps: number[] = []
): RadarTile[] => {
  const tiles: RadarTile[] = [];
  const center = getTileCoordinates(lat, lon, zoom);
  
  // Generate tiles in a 3x3 grid around center
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const x = center.x + dx;
      const y = center.y + dy;
      
      if (timestamps.length > 0) {
        // Generate tiles for each timestamp (animation frames)
        timestamps.forEach(timestamp => {
          tiles.push({
            url: `https://tile.openweathermap.org/map/${layer}/${zoom}/${x}/${y}.png?appid=${apiKey}&date=${timestamp}`,
            x,
            y,
            z: zoom,
            timestamp,
          });
        });
      } else {
        // Current weather tile
        tiles.push({
          url: `https://tile.openweathermap.org/map/${layer}/${zoom}/${x}/${y}.png?appid=${apiKey}`,
          x,
          y,
          z: zoom,
          timestamp: Date.now(),
        });
      }
    }
  }
  
  return tiles;
};

// Generate timestamps for animation (last N hours)
const generateTimestamps = (maxFrames: number): number[] => {
  const timestamps: number[] = [];
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  
  for (let i = maxFrames - 1; i >= 0; i--) {
    timestamps.push(now - (i * hourInMs));
  }
  
  return timestamps;
};

const useWeatherRadar = (
  lat?: number,
  lon?: number,
  options: {
    zoom?: number;
    enableAnimation?: boolean;
    refreshInterval?: number;
  } = {}
) => {
  const {
    zoom = 8,
    enableAnimation = false,
    refreshInterval = 10 * 60 * 1000, // 10 minutes
  } = options;

  // Get radar data
  const { 
    data: radarData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['weatherRadar', lat, lon, zoom, enableAnimation],
    queryFn: async (): Promise<WeatherRadarData> => {
      if (!lat || !lon) {
        throw new Error('Location coordinates are required for radar data');
      }

      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
      if (!apiKey) {
        throw new Error('OpenWeatherMap API key is required');
      }

      const timestamps = enableAnimation ? generateTimestamps(DEFAULT_RADAR_SETTINGS.maxFrames) : [];
      const tiles: RadarTile[] = [];

      // Generate tiles for all visible layers
      AVAILABLE_LAYERS.forEach(layer => {
        if (layer.visible) {
          const layerTiles = generateRadarTiles(lat, lon, zoom, layer.id, apiKey, timestamps);
          tiles.push(...layerTiles);
        }
      });

      // Calculate bounds
      const latRange = 0.1 * Math.pow(2, 10 - zoom);
      const lonRange = 0.1 * Math.pow(2, 10 - zoom);

      return {
        tiles,
        layers: AVAILABLE_LAYERS,
        bounds: {
          north: lat + latRange,
          south: lat - latRange,
          east: lon + lonRange,
          west: lon - lonRange,
        },
        center: { lat, lon },
        zoom,
        lastUpdated: new Date(),
      };
    },
    enabled: Boolean(lat && lon),
    staleTime: refreshInterval,
    gcTime: refreshInterval * 2,
    refetchInterval: refreshInterval,
  });

  // Get current precipitation intensity at location
  const { data: precipitationIntensity } = useQuery({
    queryKey: ['precipitationIntensity', lat, lon],
    queryFn: async (): Promise<{
      intensity: number;
      type: 'none' | 'light' | 'moderate' | 'heavy' | 'extreme';
      description: string;
    }> => {
      if (!lat || !lon) {
        throw new Error('Location coordinates required');
      }

      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
      if (!apiKey) {
        throw new Error('API key required');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch precipitation data');
      }

      const data = await response.json();
      const rain = data.rain?.['1h'] || 0;
      const snow = data.snow?.['1h'] || 0;
      const total = rain + snow;

      let type: 'none' | 'light' | 'moderate' | 'heavy' | 'extreme';
      let description: string;

      if (total === 0) {
        type = 'none';
        description = 'No precipitation';
      } else if (total < 0.5) {
        type = 'light';
        description = 'Light precipitation';
      } else if (total < 2.5) {
        type = 'moderate';
        description = 'Moderate precipitation';
      } else if (total < 10) {
        type = 'heavy';
        description = 'Heavy precipitation';
      } else {
        type = 'extreme';
        description = 'Extreme precipitation';
      }

      return {
        intensity: total,
        type,
        description,
      };
    },
    enabled: Boolean(lat && lon),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    const layer = AVAILABLE_LAYERS.find(l => l.id === layerId);
    if (layer) {
      layer.visible = !layer.visible;
      refetch();
    }
  };

  // Update layer opacity
  const updateLayerOpacity = (layerId: string, opacity: number) => {
    const layer = AVAILABLE_LAYERS.find(l => l.id === layerId);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity));
    }
  };

  // Get layer by ID
  const getLayer = (layerId: string) => {
    return AVAILABLE_LAYERS.find(l => l.id === layerId);
  };

  // Get visible layers
  const getVisibleLayers = () => {
    return AVAILABLE_LAYERS.filter(l => l.visible);
  };

  // Get tiles for specific layer and timestamp
  const getTilesForLayer = (layerId: string, timestamp?: number) => {
    if (!radarData) return [];
    
    return radarData.tiles.filter(tile => 
      tile.url.includes(layerId) && 
      (!timestamp || tile.timestamp === timestamp)
    );
  };

  // Get available timestamps for animation
  const getAnimationTimestamps = () => {
    if (!radarData) return [];
    
    const timestamps = [...new Set(radarData.tiles.map(tile => tile.timestamp))];
    return timestamps.sort((a, b) => a - b);
  };

  // Check if radar data is available
  const isRadarAvailable = Boolean(radarData && radarData.tiles.length > 0);

  // Get radar coverage status
  const getCoverageStatus = () => {
    if (!radarData) return 'unknown';
    
    const visibleTiles = radarData.tiles.filter(tile => 
      AVAILABLE_LAYERS.some(layer => layer.visible && tile.url.includes(layer.id))
    );
    
    if (visibleTiles.length === 0) return 'no-data';
    if (visibleTiles.length < radarData.tiles.length / 2) return 'partial';
    return 'full';
  };

  return {
    // Data
    radarData,
    precipitationIntensity,
    
    // State
    isLoading,
    error,
    isRadarAvailable,
    
    // Layer management
    layers: AVAILABLE_LAYERS,
    toggleLayer,
    updateLayerOpacity,
    getLayer,
    getVisibleLayers,
    
    // Tile management
    getTilesForLayer,
    getAnimationTimestamps,
    
    // Status
    getCoverageStatus: getCoverageStatus(),
    lastUpdated: radarData?.lastUpdated,
    
    // Actions
    refetch,
    refresh: () => refetch(),
    
    // Settings
    settings: DEFAULT_RADAR_SETTINGS,
  };
};

export default useWeatherRadar; 