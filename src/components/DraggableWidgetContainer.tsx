'use client';

import { ReactNode } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Bars3Icon, 
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

import useWidgetCustomization, { type WidgetConfig } from '../lib/hooks/useWidgetCustomization';
import useUserPreferences from '../lib/hooks/useUserPreferences';

interface DraggableWidgetProps {
  widget: WidgetConfig;
  children: ReactNode;
  isCustomizing: boolean;
  onToggleVisibility: (widgetId: string) => void;
}

const DraggableWidget = ({ 
  widget, 
  children, 
  isCustomizing, 
  onToggleVisibility 
}: DraggableWidgetProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const { shouldReduceMotion } = useUserPreferences();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: shouldReduceMotion ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group transition-all duration-200
        ${isDragging ? 'z-50' : 'z-auto'}
        ${isCustomizing ? 'ring-2 ring-blue-400/50 ring-offset-2 ring-offset-transparent' : ''}
      `}
    >
      {/* Customization Overlay */}
      {isCustomizing && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="glass-card p-2 text-white hover:bg-white/30 transition-colors duration-200 cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            
            {/* Toggle Visibility */}
            <button
              onClick={() => onToggleVisibility(widget.id)}
              className={`
                glass-card p-2 transition-colors duration-200
                ${widget.enabled 
                  ? 'text-green-400 hover:bg-green-400/20' 
                  : 'text-red-400 hover:bg-red-400/20'
                }
              `}
              aria-label={widget.enabled ? 'Hide widget' : 'Show widget'}
            >
              {widget.enabled ? (
                <EyeIcon className="w-5 h-5" />
              ) : (
                <EyeSlashIcon className="w-5 h-5" />
              )}
            </button>
            
            {/* Widget Info */}
            <div className="glass-card px-3 py-2 text-white">
              <div className="text-sm font-medium">{widget.name}</div>
              <div className="text-xs text-white/70">{widget.icon} {widget.category}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Widget Content */}
      <div className={`${isCustomizing ? 'pointer-events-none' : ''}`}>
        {children}
      </div>
    </div>
  );
};

interface DraggableWidgetContainerProps {
  children: (widgetId: string, widget: WidgetConfig) => ReactNode;
  isCustomizing: boolean;
  onToggleCustomization: () => void;
}

const DraggableWidgetContainer = ({
  children,
  isCustomizing,
  onToggleCustomization,
}: DraggableWidgetContainerProps) => {
  const {
    enabledWidgets,
    layoutConfig,
    reorderWidgets,
    toggleWidget,
    getLayoutClasses,
    getWidgetSizeClasses,
  } = useWidgetCustomization();

  const { shouldReduceMotion } = useUserPreferences();

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = enabledWidgets.findIndex(widget => widget.id === active.id);
      const newIndex = enabledWidgets.findIndex(widget => widget.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderWidgets(oldIndex, newIndex);
      }
    }
  };

  const handleToggleVisibility = (widgetId: string) => {
    toggleWidget(widgetId);
  };

  if (!isCustomizing) {
    // Normal view - just render widgets with proper spacing
    return (
      <div className="space-y-8">
        {enabledWidgets.map((widget) => (
          <div key={widget.id} className="w-full">
            {children(widget.id, widget)}
          </div>
        ))}
      </div>
    );
  }

  // Customization view with drag and drop
  return (
    <div className="space-y-4">
      {/* Customization Header */}
      <div className="glass-card p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cog6ToothIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-primary font-semibold">Widget Customization</h3>
          </div>
          
          <button
            onClick={onToggleCustomization}
            className="text-sm text-secondary hover:text-primary px-3 py-1 rounded-lg transition-colors duration-200"
          >
            Done
          </button>
        </div>
        
        <p className="text-muted text-sm mt-2">
          Drag widgets to reorder them, toggle visibility, or adjust layout settings.
        </p>
      </div>

      {/* Draggable Widgets Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={enabledWidgets.map(w => w.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {enabledWidgets.map((widget) => (
              <DraggableWidget
                key={widget.id}
                widget={widget}
                isCustomizing={isCustomizing}
                onToggleVisibility={handleToggleVisibility}
              >
                <div className="transition-opacity duration-200">
                  {children(widget.id, widget)}
                </div>
              </DraggableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Disabled Widgets */}
      <div className="space-y-4">
        <h4 className="text-secondary font-medium text-sm">Hidden Widgets</h4>
        {(() => {
          const hiddenWidgets = layoutConfig.widgets.filter(widget => !widget.enabled);
          
          if (enabledWidgets.length === 0) {
            return (
              <div className="glass-card p-6 text-center">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-primary font-medium">All widgets are currently hidden</p>
                <p className="text-muted text-sm mt-1">Enable some widgets to customize your dashboard</p>
              </div>
            );
          }
          
          if (hiddenWidgets.length === 0) {
            return (
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">✨</div>
                <p className="text-primary font-medium text-sm">All widgets are currently visible</p>
                <p className="text-muted text-xs mt-1">Great! You're using all available widgets</p>
              </div>
            );
          }
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hiddenWidgets.map((widget) => (
                <div
                  key={widget.id}
                  className="glass-card p-4 opacity-50 border-dashed border-2 border-gray-400 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{widget.icon}</span>
                      <div>
                        <h5 className="text-primary font-medium text-sm">{widget.name}</h5>
                        <p className="text-muted text-xs">{widget.description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleToggleVisibility(widget.id)}
                      className="glass-card p-2 text-green-400 hover:bg-green-400/20 transition-colors duration-200"
                      aria-label="Show widget"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default DraggableWidgetContainer; 