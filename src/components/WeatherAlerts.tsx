'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { type WeatherData } from "../lib/hooks/useWeatherData";

interface WeatherAlertsProps {
  weatherData: WeatherData;
}

const WeatherAlerts = ({ weatherData }: WeatherAlertsProps) => {
  if (!weatherData.alerts || weatherData.alerts.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card w-full max-w-4xl border-yellow-500/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-yellow-300 text-lg">
          <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          Weather Alerts
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        <div className="space-y-4">
          {weatherData.alerts.map((alert, index) => (
            <div 
              key={index}
              className="glass-card p-4 bg-yellow-500/10 border border-yellow-500/30"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-yellow-300 font-semibold text-lg">
                  {alert.event}
                </h3>
                <span className="text-yellow-200/70 text-sm">
                  {alert.sender_name}
                </span>
              </div>
              
              <p className="text-white/90 text-sm leading-relaxed mb-3">
                {alert.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-yellow-200/70">
                <span>
                  Start: {new Date(alert.start * 1000).toLocaleString()}
                </span>
                <span>
                  End: {new Date(alert.end * 1000).toLocaleString()}
                </span>
              </div>
              
              {alert.tags && alert.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {alert.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-2 py-1 bg-yellow-500/20 text-yellow-200 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherAlerts; 