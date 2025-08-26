import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Compass,
  Calendar,
  MapPin,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Sunrise,
  Sunset,
  Umbrella,
  Shield,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    sunrise: string;
    sunset: string;
  };
  forecast: {
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitationChance: number;
    windSpeed: number;
  }[];
  hourly: {
    time: string;
    temperature: number;
    condition: string;
    icon: string;
    precipitationChance: number;
  }[];
  alerts?: {
    title: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe' | 'extreme';
    startTime: string;
    endTime: string;
  }[];
}

interface WeatherWidgetProps {
  goalId: string;
  location?: string;
  showForecast?: boolean;
  showHourly?: boolean;
  showAlerts?: boolean;
  compact?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  goalId,
  location = 'Tokyo, Japan',
  showForecast = true,
  showHourly = true,
  showAlerts = true,
  compact = false,
}) => {
  const [selectedView, setSelectedView] = useState<'current' | 'forecast' | 'hourly'>('current');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Enhanced mock weather data
  const weatherData: WeatherData = {
    current: {
      temperature: 18,
      feelsLike: 16,
      condition: 'Partly Cloudy',
      icon: 'partly-cloudy',
      humidity: 65,
      windSpeed: 12,
      windDirection: 225, // SW
      pressure: 1013,
      visibility: 10,
      uvIndex: 4,
      sunrise: '06:30',
      sunset: '17:45'
    },
    forecast: [
      {
        date: '2025-01-21',
        day: 'Today',
        high: 22,
        low: 15,
        condition: 'Partly Cloudy',
        icon: 'partly-cloudy',
        precipitationChance: 20,
        windSpeed: 12
      },
      {
        date: '2025-01-22',
        day: 'Tomorrow',
        high: 19,
        low: 12,
        condition: 'Cloudy',
        icon: 'cloudy',
        precipitationChance: 40,
        windSpeed: 15
      },
      {
        date: '2025-01-23',
        day: 'Wednesday',
        high: 24,
        low: 16,
        condition: 'Sunny',
        icon: 'sunny',
        precipitationChance: 5,
        windSpeed: 8
      },
      {
        date: '2025-01-24',
        day: 'Thursday',
        high: 21,
        low: 14,
        condition: 'Light Rain',
        icon: 'rainy',
        precipitationChance: 80,
        windSpeed: 18
      },
      {
        date: '2025-01-25',
        day: 'Friday',
        high: 17,
        low: 11,
        condition: 'Heavy Rain',
        icon: 'heavy-rain',
        precipitationChance: 95,
        windSpeed: 25
      }
    ],
    hourly: [
      { time: '12:00', temperature: 18, condition: 'Partly Cloudy', icon: 'partly-cloudy', precipitationChance: 20 },
      { time: '13:00', temperature: 20, condition: 'Partly Cloudy', icon: 'partly-cloudy', precipitationChance: 15 },
      { time: '14:00', temperature: 22, condition: 'Sunny', icon: 'sunny', precipitationChance: 10 },
      { time: '15:00', temperature: 21, condition: 'Partly Cloudy', icon: 'partly-cloudy', precipitationChance: 25 },
      { time: '16:00', temperature: 19, condition: 'Cloudy', icon: 'cloudy', precipitationChance: 30 },
      { time: '17:00', temperature: 17, condition: 'Cloudy', icon: 'cloudy', precipitationChance: 35 }
    ],
    alerts: [
      {
        title: 'Heavy Rain Warning',
        description: 'Heavy rain expected Friday with potential flooding in low-lying areas.',
        severity: 'moderate',
        startTime: '2025-01-25T06:00:00Z',
        endTime: '2025-01-25T18:00:00Z'
      }
    ]
  };

  const getWeatherIcon = (condition: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };

    const iconProps = {
      className: `${sizeClasses[size]} text-yellow-500`
    };

    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun {...iconProps} className={`${sizeClasses[size]} text-yellow-500`} />;
      case 'partly-cloudy':
      case 'partly cloudy':
        return <Cloud {...iconProps} className={`${sizeClasses[size]} text-gray-400`} />;
      case 'cloudy':
      case 'overcast':
        return <Cloud {...iconProps} className={`${sizeClasses[size]} text-gray-500`} />;
      case 'rainy':
      case 'light rain':
      case 'rain':
        return <CloudRain {...iconProps} className={`${sizeClasses[size]} text-blue-500`} />;
      case 'heavy-rain':
      case 'heavy rain':
        return <CloudRain {...iconProps} className={`${sizeClasses[size]} text-blue-700`} />;
      case 'snow':
      case 'snowy':
        return <CloudSnow {...iconProps} className={`${sizeClasses[size]} text-gray-300`} />;
      case 'thunderstorm':
      case 'storms':
        return <CloudLightning {...iconProps} className={`${sizeClasses[size]} text-purple-500`} />;
      default:
        return <Sun {...iconProps} className={`${sizeClasses[size]} text-yellow-500`} />;
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex <= 2) return 'text-green-600 bg-green-100';
    if (uvIndex <= 5) return 'text-yellow-600 bg-yellow-100';
    if (uvIndex <= 7) return 'text-orange-600 bg-orange-100';
    if (uvIndex <= 10) return 'text-red-600 bg-red-100';
    return 'text-purple-600 bg-purple-100';
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'moderate': return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'severe': return 'bg-orange-100 border-orange-300 text-orange-700';
      case 'extreme': return 'bg-red-100 border-red-300 text-red-700';
      default: return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const refreshWeather = () => {
    setLastUpdated(new Date());
    // In a real app, this would fetch new weather data
  };

  if (compact) {
    return (
      <motion.div
        className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4 rounded-xl shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weatherData.current.icon, 'md')}
            <div>
              <div className="text-2xl font-bold">{weatherData.current.temperature}°C</div>
              <div className="text-sm opacity-90">{weatherData.current.condition}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm opacity-90">
              <MapPin className="w-3 h-3" />
              {location}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Beautiful Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg">
            {getWeatherIcon(weatherData.current.icon, 'md')}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Weather
            </h1>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-500">Updated</div>
            <div className="text-xs text-gray-400">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <motion.button
            onClick={refreshWeather}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: 180 }}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
            title="Refresh weather"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Weather Alerts */}
      {showAlerts && weatherData.alerts && weatherData.alerts.length > 0 && (
        <div className="mb-6">
          {weatherData.alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border-l-4 ${getAlertSeverityColor(alert.severity)} mb-3`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">{alert.title}</h3>
                  <p className="text-sm mb-2">{alert.description}</p>
                  <div className="text-xs opacity-75">
                    {new Date(alert.startTime).toLocaleDateString()} - {new Date(alert.endTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Current Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 rounded-2xl shadow-xl mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm">
              {getWeatherIcon(weatherData.current.icon, 'lg')}
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{weatherData.current.temperature}°C</div>
              <div className="text-xl opacity-90 mb-1">{weatherData.current.condition}</div>
              <div className="text-sm opacity-75">Feels like {weatherData.current.feelsLike}°C</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Sunrise className="w-4 h-4" />
                <span>{weatherData.current.sunrise}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sunset className="w-4 h-4" />
                <span>{weatherData.current.sunset}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4" />
              <span className="text-sm opacity-75">Wind</span>
            </div>
            <div className="text-lg font-semibold">{weatherData.current.windSpeed} km/h</div>
            <div className="text-xs opacity-75">{getWindDirection(weatherData.current.windDirection)}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4" />
              <span className="text-sm opacity-75">Humidity</span>
            </div>
            <div className="text-lg font-semibold">{weatherData.current.humidity}%</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm opacity-75">Visibility</span>
            </div>
            <div className="text-lg font-semibold">{weatherData.current.visibility} km</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4" />
              <span className="text-sm opacity-75">UV Index</span>
            </div>
            <div className="text-lg font-semibold">{weatherData.current.uvIndex}</div>
            <div className={`text-xs px-2 py-1 rounded-full ${getUVIndexColor(weatherData.current.uvIndex)} text-center mt-1`}>
              {weatherData.current.uvIndex <= 2 ? 'Low' : weatherData.current.uvIndex <= 5 ? 'Moderate' : weatherData.current.uvIndex <= 7 ? 'High' : 'Very High'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Forecast Tabs */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'forecast', label: '5-Day Forecast', icon: Calendar },
            { id: 'hourly', label: 'Hourly', icon: Clock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedView(id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                selectedView === id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Forecast Content */}
      <div className="flex-1 overflow-auto">
        {selectedView === 'forecast' && showForecast && (
          <div className="space-y-3">
            {weatherData.forecast.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      {getWeatherIcon(day.icon, 'md')}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{day.day}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{day.condition}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div className="flex items-center gap-2">
                      <Umbrella className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-600">{day.precipitationChance}%</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{day.windSpeed} km/h</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                        <span className="font-semibold text-gray-900 dark:text-white">{day.high}°</span>
                      </div>
                      <span className="text-gray-400 mx-1">/</span>
                      <div className="flex items-center">
                        <TrendingDown className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-gray-600 dark:text-gray-400">{day.low}°</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedView === 'hourly' && showHourly && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {weatherData.hourly.map((hour, index) => (
              <motion.div
                key={hour.time}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{hour.time}</div>
                
                <div className="flex justify-center mb-3">
                  {getWeatherIcon(hour.icon, 'md')}
                </div>
                
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">{hour.temperature}°C</div>
                
                <div className="flex items-center justify-center gap-1 text-sm text-blue-600">
                  <Droplets className="w-3 h-3" />
                  <span>{hour.precipitationChance}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WeatherWidget;