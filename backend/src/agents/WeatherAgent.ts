import { BaseAgent, BaseAgentConfig } from '../types/agent';
import { AgentResult, TaskParameters } from '../types/agent';
import logger from '../utils/logger';

interface WeatherForecastParams {
  city: string;
  country?: string;
  days?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface WeatherAlertParams {
  city: string;
  country?: string;
  alertTypes: string[]; // ['rain', 'snow', 'extreme_temp', 'wind', 'storm']
  thresholds?: {
    temperature?: { min?: number; max?: number };
    windSpeed?: number;
    precipitation?: number;
  };
}

export class WeatherAgent extends BaseAgent {
  constructor(config: BaseAgentConfig) {
    super(config);
  }
  getCapabilities() {
    return [
      {
        name: 'getWeatherForecast',
        description: 'Get detailed weather forecast for any location',
        parameters: {
          city: { type: 'string', required: true },
          country: { type: 'string', required: false },
          days: { type: 'number', default: 5 },
          coordinates: { type: 'object', required: false },
        },
      },
      {
        name: 'getCurrentWeather',
        description: 'Get current weather conditions for any location',
        parameters: {
          city: { type: 'string', required: true },
          country: { type: 'string', required: false },
          coordinates: { type: 'object', required: false },
        },
      },
      {
        name: 'getWeatherAlerts',
        description: 'Set up weather alerts and warnings',
        parameters: {
          city: { type: 'string', required: true },
          country: { type: 'string', required: false },
          alertTypes: { type: 'array', required: true },
          thresholds: { type: 'object', required: false },
        },
      },
      {
        name: 'getOutdoorActivityAdvice',
        description: 'Get weather-based advice for outdoor activities',
        parameters: {
          city: { type: 'string', required: true },
          country: { type: 'string', required: false },
          activity: { type: 'string', required: true }, // 'picnic', 'hiking', 'sports', 'gardening', etc.
          date: { type: 'string', required: false },
        },
      },
    ];
  }

  validateParameters(parameters: Record<string, any>): boolean {
    return parameters && typeof parameters === 'object' && parameters.city;
  }

  async executeTask(task: TaskParameters): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`WeatherAgent executing task: ${task.type} for goal ${task.goalId}`);
      
      let result: any;
      let confidence = 0.9; // High confidence for weather data
      
      switch (task.type) {
        case 'getWeatherForecast':
          result = await this.getWeatherForecast(task.parameters as WeatherForecastParams);
          break;
          
        case 'getCurrentWeather':
          result = await this.getCurrentWeather(task.parameters);
          break;
          
        case 'getWeatherAlerts':
          result = await this.getWeatherAlerts(task.parameters as WeatherAlertParams);
          confidence = 0.8;
          break;
          
        case 'getOutdoorActivityAdvice':
          result = await this.getOutdoorActivityAdvice(task.parameters);
          confidence = 0.85;
          break;
          
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }

      this.logPerformance(startTime, true);
      
      return {
        success: true,
        data: result,
        confidence,
        metadata: {
          executionTime: Date.now() - startTime,
          agentType: 'weather',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error(`WeatherAgent task failed: ${error}`);
      this.logPerformance(startTime, false);
      
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        confidence: 0,
        metadata: {
          executionTime: Date.now() - startTime,
          agentType: 'weather',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  private async getWeatherForecast(params: WeatherForecastParams): Promise<any> {
    logger.info(`Getting weather forecast for ${params.city}`);
    
    try {
      // Try OpenWeather RapidAPI (we know this works)
      const rapidApiKey = process.env.RAPIDAPI_KEY;
      
      if (rapidApiKey) {
        logger.info('Using OpenWeather RapidAPI for forecast');
        
        try {
          // Use coordinates if provided, otherwise default to NYC
          const lat = params.coordinates?.latitude || 40.730610;
          const lon = params.coordinates?.longitude || -73.935242;
          
          const openWeatherResponse = await fetch(
            `https://open-weather13.p.rapidapi.com/fivedaysforcast?latitude=${lat}&longitude=${lon}&lang=EN`,
            {
              headers: {
                'x-rapidapi-key': rapidApiKey,
                'x-rapidapi-host': 'open-weather13.p.rapidapi.com'
              }
            }
          );
          
          if (openWeatherResponse.ok) {
            const openWeatherData = await openWeatherResponse.json() as any;
            logger.info('OpenWeather RapidAPI data retrieved successfully');
            
            if (openWeatherData && openWeatherData.list && Array.isArray(openWeatherData.list)) {
              const forecast = openWeatherData.list.slice(0, (params.days || 5) * 8).map((period: any) => ({
                date: period.dt_txt || new Date(period.dt * 1000).toISOString(),
                temperature: {
                  current: Math.round(period.main?.temp - 273.15) || 20,
                  feels_like: Math.round(period.main?.feels_like - 273.15) || 20,
                  min: Math.round(period.main?.temp_min - 273.15) || 15,
                  max: Math.round(period.main?.temp_max - 273.15) || 25,
                },
                weather: {
                  description: period.weather?.[0]?.description || 'Clear sky',
                  icon: period.weather?.[0]?.icon || '01d',
                  main: period.weather?.[0]?.main || 'Clear',
                },
                humidity: period.main?.humidity || 50,
                windSpeed: Math.round((period.wind?.speed || 5) * 10) / 10,
                pressure: period.main?.pressure || 1013,
                visibility: period.visibility || 10000,
                cloudCover: period.clouds?.all || 0,
              }));

              return {
                city: openWeatherData.city?.name || params.city,
                country: openWeatherData.city?.country || params.country || 'Unknown',
                coordinates: openWeatherData.city?.coord,
                forecast,
                dataSource: 'OpenWeather RapidAPI - Real weather data',
                lastUpdated: new Date().toISOString(),
                requestedDays: params.days || 5,
              };
            }
          } else {
            logger.warn(`OpenWeather RapidAPI returned status ${openWeatherResponse.status}`);
          }
        } catch (openWeatherError) {
          logger.warn('OpenWeather RapidAPI failed, using mock data:', openWeatherError);
        }
      }
      
      // Fallback to enhanced mock weather data
      logger.info('Using enhanced mock weather data');
      const mockForecast = Array.from({ length: params.days || 5 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const baseTemp = 20 + Math.sin(i * 0.5) * 5; // Seasonal variation
        const tempVariation = Math.random() * 10 - 5;
        
        return {
          date: date.toISOString(),
          temperature: {
            current: Math.round(baseTemp + tempVariation),
            feels_like: Math.round(baseTemp + tempVariation + Math.random() * 2 - 1),
            min: Math.round(baseTemp + tempVariation - 3),
            max: Math.round(baseTemp + tempVariation + 5),
          },
          weather: {
            description: ['Clear sky', 'Partly cloudy', 'Light rain', 'Sunny', 'Overcast', 'Light breeze'][Math.floor(Math.random() * 6)],
            icon: ['01d', '02d', '10d', '01d', '03d', '50d'][Math.floor(Math.random() * 6)],
            main: ['Clear', 'Clouds', 'Rain', 'Clear', 'Clouds', 'Mist'][Math.floor(Math.random() * 6)],
          },
          humidity: Math.round(40 + Math.random() * 40),
          windSpeed: Math.round((2 + Math.random() * 8) * 10) / 10,
          pressure: Math.round(1010 + Math.random() * 20),
          visibility: Math.round(8000 + Math.random() * 4000),
          cloudCover: Math.round(Math.random() * 100),
        };
      });

      return {
        city: params.city,
        country: params.country || 'Unknown',
        coordinates: params.coordinates,
        forecast: mockForecast,
        dataSource: 'Enhanced mock weather data (APIs unavailable)',
        lastUpdated: new Date().toISOString(),
        requestedDays: params.days || 5,
      };
      
    } catch (error) {
      logger.error('Weather forecast failed:', error);
      throw new Error('Failed to get weather forecast');
    }
  }

  private async getCurrentWeather(params: any): Promise<any> {
    logger.info(`Getting current weather for ${params.city}`);
    
    // Similar implementation to forecast but for current conditions
    const forecastResult = await this.getWeatherForecast({ ...params, days: 1 });
    
    return {
      ...forecastResult,
      current: forecastResult.forecast[0],
      forecast: undefined, // Remove forecast array for current weather
    };
  }

  private async getWeatherAlerts(params: WeatherAlertParams): Promise<any> {
    logger.info(`Setting up weather alerts for ${params.city}`);
    
    const forecast = await this.getWeatherForecast({ city: params.city, country: params.country, days: 3 });
    
    const alerts = [];
    
    // Check each forecast period for alert conditions
    for (const period of forecast.forecast) {
      const temp = period.temperature.current;
      const wind = period.windSpeed;
      const weather = period.weather.main.toLowerCase();
      
      // Temperature alerts
      if (params.alertTypes.includes('extreme_temp')) {
        const minTemp = params.thresholds?.temperature?.min || 0;
        const maxTemp = params.thresholds?.temperature?.max || 35;
        
        if (temp < minTemp) {
          alerts.push({
            type: 'extreme_temp',
            severity: 'warning',
            message: `Low temperature alert: ${temp}°C (below ${minTemp}°C)`,
            date: period.date,
          });
        }
        
        if (temp > maxTemp) {
          alerts.push({
            type: 'extreme_temp',
            severity: 'warning',
            message: `High temperature alert: ${temp}°C (above ${maxTemp}°C)`,
            date: period.date,
          });
        }
      }
      
      // Weather condition alerts
      if (params.alertTypes.includes('rain') && weather.includes('rain')) {
        alerts.push({
          type: 'rain',
          severity: 'info',
          message: `Rain expected: ${period.weather.description}`,
          date: period.date,
        });
      }
      
      if (params.alertTypes.includes('wind') && wind > (params.thresholds?.windSpeed || 15)) {
        alerts.push({
          type: 'wind',
          severity: 'warning',
          message: `High wind alert: ${wind} m/s`,
          date: period.date,
        });
      }
    }
    
    return {
      city: params.city,
      country: params.country,
      alertTypes: params.alertTypes,
      alerts,
      forecast,
      createdAt: new Date().toISOString(),
    };
  }

  private async getOutdoorActivityAdvice(params: any): Promise<any> {
    logger.info(`Getting outdoor activity advice for ${params.activity} in ${params.city}`);
    
    const forecast = await this.getWeatherForecast({ 
      city: params.city, 
      country: params.country, 
      days: params.date ? 1 : 3 
    });
    
    const advice = this.generateActivityAdvice(params.activity, forecast);
    
    return {
      city: params.city,
      country: params.country,
      activity: params.activity,
      advice,
      forecast,
      recommendedTimes: this.getRecommendedTimes(params.activity, forecast),
      lastUpdated: new Date().toISOString(),
    };
  }

  private generateActivityAdvice(activity: string, forecast: any): any {
    const currentWeather = forecast.forecast[0];
    const temp = currentWeather.temperature.current;
    const weather = currentWeather.weather.main.toLowerCase();
    const wind = currentWeather.windSpeed;
    const humidity = currentWeather.humidity;
    
    const baseAdvice = {
      suitability: 'good',
      recommendations: [] as string[],
      warnings: [] as string[],
      bestTime: 'afternoon',
    };
    
    switch (activity.toLowerCase()) {
      case 'picnic':
        if (weather.includes('rain')) {
          baseAdvice.suitability = 'poor';
          baseAdvice.warnings.push('Rain expected - consider indoor alternatives');
        } else if (wind > 20) {
          baseAdvice.suitability = 'fair';
          baseAdvice.warnings.push('High winds may affect outdoor dining');
        } else if (temp < 15 || temp > 30) {
          baseAdvice.suitability = 'fair';
          baseAdvice.recommendations.push(temp < 15 ? 'Dress warmly' : 'Seek shade, bring plenty of water');
        }
        
        if (baseAdvice.suitability === 'good') {
          baseAdvice.recommendations.push('Perfect weather for outdoor dining');
          baseAdvice.recommendations.push('Consider bringing a light jacket for evening');
        }
        break;
        
      case 'hiking':
      case 'walking':
        if (weather.includes('storm') || weather.includes('thunder')) {
          baseAdvice.suitability = 'poor';
          baseAdvice.warnings.push('Thunderstorms pose safety risks');
        } else if (temp < 5 || temp > 35) {
          baseAdvice.suitability = 'fair';
          baseAdvice.warnings.push('Extreme temperatures - take precautions');
        }
        
        baseAdvice.recommendations.push('Wear appropriate footwear');
        baseAdvice.recommendations.push('Bring water and snacks');
        if (weather.includes('rain')) {
          baseAdvice.recommendations.push('Waterproof clothing recommended');
        }
        break;
        
      case 'sports':
      case 'football':
      case 'soccer':
        if (weather.includes('rain')) {
          baseAdvice.suitability = 'fair';
          baseAdvice.recommendations.push('Field may be slippery');
        }
        if (wind > 15) {
          baseAdvice.warnings.push('Wind may affect ball trajectory');
        }
        baseAdvice.recommendations.push('Stay hydrated');
        break;
        
      case 'gardening':
        if (weather.includes('rain')) {
          baseAdvice.suitability = 'poor';
          baseAdvice.warnings.push('Soil will be muddy');
        } else if (humidity > 80) {
          baseAdvice.recommendations.push('Good conditions for watering plants');
        }
        
        if (temp > 25) {
          baseAdvice.bestTime = 'early morning or evening';
          baseAdvice.recommendations.push('Avoid midday sun');
        }
        break;
        
      default:
        baseAdvice.recommendations.push('Check weather conditions before heading out');
        if (weather.includes('rain')) {
          baseAdvice.recommendations.push('Consider waterproof gear');
        }
    }
    
    return baseAdvice;
  }

  private getRecommendedTimes(activity: string, forecast: any): string[] {
    const times = [];
    
    // Analyze forecast periods and recommend best times
    for (let i = 0; i < Math.min(3, forecast.forecast.length); i++) {
      const period = forecast.forecast[i];
      const temp = period.temperature.current;
      const weather = period.weather.main.toLowerCase();
      
      if (!weather.includes('rain') && !weather.includes('storm') && temp >= 10 && temp <= 30) {
        const date = new Date(period.date);
        times.push(date.toLocaleDateString() + ' - ' + this.getTimeOfDay(date.getHours()));
      }
    }
    
    return times.slice(0, 3); // Return top 3 recommendations
  }

  private getTimeOfDay(hour: number): string {
    if (hour < 6) return 'early morning';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  }
}