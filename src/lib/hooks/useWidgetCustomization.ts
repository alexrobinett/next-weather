'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  category: 'weather' | 'forecast' | 'data' | 'location';
  icon: string;
  enabled: boolean;
  order: number;
  size: 'small' | 'medium' | 'large' | 'full';
  position?: { x: number; y: number };
}

export interface LayoutConfig {
  widgets: WidgetConfig[];
  layout: 'grid' | 'list' | 'masonry';
  columns: number;
  spacing: 'compact' | 'normal' | 'spacious';
  lastModified: number;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'current-weather',
    name: 'Current Weather',
    description: 'Main weather display with temperature and conditions',
    category: 'weather',
    icon: '🌤️',
    enabled: true,
    order: 0,
    size: 'large',
  },
  {
    id: 'favorite-cities',
    name: 'Favorite Cities',
    description: 'Quick weather overview for your saved cities',
    category: 'location',
    icon: '❤️',
    enabled: true,
    order: 1,
    size: 'full',
  },
  {
    id: 'weather-alerts',
    name: 'Weather Alerts',
    description: 'Severe weather warnings and advisories',
    category: 'weather',
    icon: '⚠️',
    enabled: true,
    order: 2,
    size: 'full',
  },
  {
    id: 'air-quality',
    name: 'Air Quality',
    description: 'Air quality index and pollutant levels',
    category: 'data',
    icon: '🌬️',
    enabled: true,
    order: 3,
    size: 'medium',
  },
  {
    id: 'hourly-forecast',
    name: 'Hourly Forecast',
    description: 'Next 12 hours weather forecast',
    category: 'forecast',
    icon: '⏰',
    enabled: true,
    order: 4,
    size: 'full',
  },
  {
    id: 'daily-forecast',
    name: '7-Day Forecast',
    description: 'Extended daily weather forecast',
    category: 'forecast',
    icon: '📅',
    enabled: true,
    order: 5,
    size: 'full',
  },
  {
    id: 'rain-forecast',
    name: 'Rain Forecast',
    description: '60-minute precipitation forecast with demo mode',
    category: 'forecast',
    icon: '🌧️',
    enabled: true,
    order: 6,
    size: 'medium',
  },
  {
    id: 'weather-radar',
    name: 'Weather Radar',
    description: 'Live precipitation and storm tracking',
    category: 'weather',
    icon: '🌦️',
    enabled: false,
    order: 7,
    size: 'large',
  },
  {
    id: 'historical-weather',
    name: 'Historical Data',
    description: 'Weather trends and historical comparisons',
    category: 'data',
    icon: '📊',
    enabled: false,
    order: 8,
    size: 'medium',
  },
  {
    id: 'weather-stats',
    name: 'Weather Statistics',
    description: 'Detailed weather metrics and measurements',
    category: 'data',
    icon: '📈',
    enabled: false,
    order: 9,
    size: 'medium',
  },
];

const DEFAULT_LAYOUT: LayoutConfig = {
  widgets: DEFAULT_WIDGETS,
  layout: 'grid',
  columns: 2,
  spacing: 'spacious',
  lastModified: Date.now(),
};

const STORAGE_KEY = 'weather-glass-widget-layout';

// Get layout config from localStorage
const getLayoutFromStorage = (): LayoutConfig => {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_LAYOUT;
    
    const parsed = JSON.parse(stored) as LayoutConfig;
    
    // Merge with default widgets to handle new widget additions
    const mergedWidgets = DEFAULT_WIDGETS.map(defaultWidget => {
      const stored = parsed.widgets.find(w => w.id === defaultWidget.id);
      return stored ? { ...defaultWidget, ...stored } : defaultWidget;
    });
    
    // Add any widgets that might have been removed from defaults
    const newWidgets = parsed.widgets.filter(
      widget => !DEFAULT_WIDGETS.some(dw => dw.id === widget.id)
    );
    
    return {
      ...DEFAULT_LAYOUT,
      ...parsed,
      widgets: [...mergedWidgets, ...newWidgets].sort((a, b) => a.order - b.order),
    };
  } catch (error) {
    console.error('Error reading layout from storage:', error);
    return DEFAULT_LAYOUT;
  }
};

// Save layout config to localStorage
const saveLayoutToStorage = (layout: LayoutConfig): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const toSave = {
      ...layout,
      lastModified: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving layout to storage:', error);
  }
};

const useWidgetCustomization = () => {
  const queryClient = useQueryClient();

  // Load layout configuration
  const { data: layoutConfig = DEFAULT_LAYOUT, isPending } = useQuery({
    queryKey: ['widgetLayout'],
    queryFn: getLayoutFromStorage,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Get enabled widgets in order
  const enabledWidgets = layoutConfig.widgets
    .filter(widget => widget.enabled)
    .sort((a, b) => a.order - b.order);

  // Get widgets by category
  const getWidgetsByCategory = () => {
    const categories = {
      weather: [] as WidgetConfig[],
      forecast: [] as WidgetConfig[],
      data: [] as WidgetConfig[],
      location: [] as WidgetConfig[],
    };
    
    layoutConfig.widgets.forEach(widget => {
      categories[widget.category].push(widget);
    });
    
    return categories;
  };

  // Toggle widget visibility
  const toggleWidget = (widgetId: string) => {
    const updatedWidgets = layoutConfig.widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, enabled: !widget.enabled }
        : widget
    );
    
    const updatedLayout = {
      ...layoutConfig,
      widgets: updatedWidgets,
    };
    
    queryClient.setQueryData(['widgetLayout'], updatedLayout);
    saveLayoutToStorage(updatedLayout);
    
    return { success: true, message: `Widget ${widgetId} toggled` };
  };

  // Reorder widgets (for drag and drop)
  const reorderWidgets = (startIndex: number, endIndex: number) => {
    if (startIndex < 0 || startIndex >= enabledWidgets.length || 
        endIndex < 0 || endIndex >= enabledWidgets.length) {
      return { success: false, message: 'Invalid widget indices' };
    }
    
    const enabledOnly = enabledWidgets.slice();
    const removed = enabledOnly.splice(startIndex, 1)[0];
    
    if (!removed) {
      return { success: false, message: 'Widget not found' };
    }
    
    enabledOnly.splice(endIndex, 0, removed);

    // Update order for all widgets
    const updatedWidgets = layoutConfig.widgets.map(widget => {
      if (!widget.enabled) return widget;
      
      const newIndex = enabledOnly.findIndex(w => w.id === widget.id);
      return { ...widget, order: newIndex };
    });

    const updatedLayout = {
      ...layoutConfig,
      widgets: updatedWidgets,
    };
    
    queryClient.setQueryData(['widgetLayout'], updatedLayout);
    saveLayoutToStorage(updatedLayout);
    
    return { success: true, message: 'Widgets reordered' };
  };

  // Update widget configuration
  const updateWidget = (widgetId: string, updates: Partial<WidgetConfig>) => {
    const updatedWidgets = layoutConfig.widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, ...updates }
        : widget
    );
    
    const updatedLayout = {
      ...layoutConfig,
      widgets: updatedWidgets,
    };
    
    queryClient.setQueryData(['widgetLayout'], updatedLayout);
    saveLayoutToStorage(updatedLayout);
    
    return { success: true, message: `Widget ${widgetId} updated` };
  };

  // Update layout settings
  const updateLayout = (updates: Partial<Omit<LayoutConfig, 'widgets'>>) => {
    const updatedLayout = {
      ...layoutConfig,
      ...updates,
    };
    
    queryClient.setQueryData(['widgetLayout'], updatedLayout);
    saveLayoutToStorage(updatedLayout);
    
    return { success: true, message: 'Layout updated' };
  };

  // Reset to default layout
  const resetLayout = () => {
    queryClient.setQueryData(['widgetLayout'], DEFAULT_LAYOUT);
    saveLayoutToStorage(DEFAULT_LAYOUT);
    
    return { success: true, message: 'Layout reset to defaults' };
  };

  // Get widget by ID
  const getWidget = (widgetId: string) => {
    return layoutConfig.widgets.find(widget => widget.id === widgetId);
  };

  // Check if widget is enabled
  const isWidgetEnabled = (widgetId: string) => {
    const widget = getWidget(widgetId);
    return widget?.enabled ?? false;
  };

  // Get layout classes for responsive design
  const getLayoutClasses = () => {
    const { layout, columns, spacing } = layoutConfig;
    
    const baseClasses = 'w-full';
    const gapSize = spacing === 'compact' ? '4' : spacing === 'spacious' ? '8' : '6';
    
    const layoutClasses = {
      grid: `grid gap-${gapSize} grid-cols-1 md:grid-cols-${Math.min(columns, 2)} lg:grid-cols-${columns}`,
      list: `space-y-${gapSize}`,
      masonry: `columns-1 md:columns-${Math.min(columns, 2)} lg:columns-${columns} gap-${gapSize}`,
    };
    
    return `${baseClasses} ${layoutClasses[layout]}`;
  };

  // Get widget size classes
  const getWidgetSizeClasses = (widget: WidgetConfig) => {
    const sizeClasses = {
      small: 'col-span-1',
      medium: 'col-span-1 md:col-span-1',
      large: 'col-span-1 md:col-span-2',
      full: 'col-span-full',
    };
    
    return sizeClasses[widget.size];
  };

  return {
    layoutConfig,
    enabledWidgets,
    isPending,
    
    // Widget management
    toggleWidget,
    updateWidget,
    getWidget,
    isWidgetEnabled,
    getWidgetsByCategory,
    
    // Layout management
    updateLayout,
    resetLayout,
    reorderWidgets,
    
    // UI helpers
    getLayoutClasses,
    getWidgetSizeClasses,
    
    // Stats
    totalWidgets: layoutConfig.widgets.length,
    enabledCount: enabledWidgets.length,
    lastModified: new Date(layoutConfig.lastModified),
  };
};

export default useWidgetCustomization; 