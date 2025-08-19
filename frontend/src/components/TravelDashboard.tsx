import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Thermometer,
  Umbrella,
  Sun,
  Hotel,
  Navigation,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Star,
  Globe,
  Camera,
  Utensils,
  Activity,
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface TravelDashboardProps {
  goalId: string;
}

interface TravelData {
  destination: {
    name: string;
    country: string;
    region: string;
    coordinates?: { lat: number; lng: number };
    timezone: string;
    currency: string;
  };
  itinerary: {
    departureDate: string;
    returnDate: string;
    duration: number;
    travelers: number;
  };
  budget: {
    total: number;
    breakdown: {
      flights: number;
      accommodation: number;
      food: number;
      activities: number;
      transportation: number;
      miscellaneous: number;
    };
    spent: number;
  };
  weather: {
    forecast: Array<{
      date: string;
      temp: { min: number; max: number };
      condition: string;
      icon: string;
      precipitation: number;
    }>;
    recommendations: string[];
  };
  bookings: {
    flights: Array<{
      id: string;
      airline: string;
      departure: string;
      arrival: string;
      price: number;
      status: 'booked' | 'pending' | 'searching';
    }>;
    accommodation: Array<{
      id: string;
      name: string;
      type: string;
      checkIn: string;
      checkOut: string;
      price: number;
      rating: number;
      status: 'booked' | 'pending' | 'searching';
    }>;
  };
  documents: {
    passport: { status: 'valid' | 'expires_soon' | 'expired' | 'missing'; expires?: string };
    visa: { status: 'not_required' | 'required' | 'applied' | 'approved' | 'rejected'; type?: string };
    insurance: { status: 'none' | 'basic' | 'comprehensive'; provider?: string };
    vaccinations: Array<{ name: string; required: boolean; completed: boolean }>;
  };
  activities: Array<{
    id: string;
    name: string;
    type: string;
    date: string;
    duration: string;
    price: number;
    rating: number;
    booked: boolean;
  }>;
  progress: {
    planning: number;
    booking: number;
    preparation: number;
    overall: number;
  };
}

const TravelDashboard: React.FC<TravelDashboardProps> = ({ goalId }) => {
  const [travelData, setTravelData] = useState<TravelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'weather' | 'documents' | 'activities'>('overview');
  const [executingSearch, setExecutingSearch] = useState(false);

  useEffect(() => {
    fetchTravelData();
  }, [goalId]);

  const fetchTravelData = async () => {
    try {
      setLoading(true);
      
      // Execute travel agent tasks to get comprehensive travel data
      const tasks = [
        { type: 'searchFlights', priority: 'high' },
        { type: 'searchHotels', priority: 'high' },
        { type: 'getWeatherForecast', priority: 'medium' },
        { type: 'checkVisaRequirements', priority: 'high' },
        { type: 'calculateTravelBudget', priority: 'medium' },
      ];

      const results = await Promise.allSettled(
        tasks.map(task =>
          apiService.executeAgentTask({
            goalId,
            taskType: task.type,
            priority: task.priority as 'high' | 'medium' | 'low',
            parameters: {
              destination: 'Tokyo, Japan',
              origin: 'New York, NY',
              departureDate: '2024-04-01',
              returnDate: '2024-04-14',
              travelers: 2,
              currency: 'USD',
            },
          })
        )
      );

      // Mock travel data (in production, this would be populated from agent results)
      const mockData: TravelData = {
        destination: {
          name: 'Tokyo',
          country: 'Japan',
          region: 'Kanto',
          coordinates: { lat: 35.6762, lng: 139.6503 },
          timezone: 'Asia/Tokyo',
          currency: 'JPY',
        },
        itinerary: {
          departureDate: '2024-04-01',
          returnDate: '2024-04-14',
          duration: 14,
          travelers: 2,
        },
        budget: {
          total: 8000,
          breakdown: {
            flights: 2400,
            accommodation: 2800,
            food: 1200,
            activities: 800,
            transportation: 400,
            miscellaneous: 400,
          },
          spent: 3200,
        },
        weather: {
          forecast: [
            { date: '2024-04-01', temp: { min: 8, max: 18 }, condition: 'Partly Cloudy', icon: '⛅', precipitation: 10 },
            { date: '2024-04-02', temp: { min: 10, max: 20 }, condition: 'Sunny', icon: '☀️', precipitation: 0 },
            { date: '2024-04-03', temp: { min: 12, max: 22 }, condition: 'Sunny', icon: '☀️', precipitation: 0 },
            { date: '2024-04-04', temp: { min: 9, max: 16 }, condition: 'Light Rain', icon: '🌦️', precipitation: 60 },
            { date: '2024-04-05', temp: { min: 11, max: 19 }, condition: 'Cloudy', icon: '☁️', precipitation: 20 },
          ],
          recommendations: [
            'Pack layers for varying temperatures',
            'Bring a light rain jacket',
            'Cherry blossom season - perfect for hanami!',
          ],
        },
        bookings: {
          flights: [
            {
              id: 'fl1',
              airline: 'Japan Airlines',
              departure: '2024-04-01T10:00:00Z',
              arrival: '2024-04-02T14:30:00Z',
              price: 1200,
              status: 'booked',
            },
            {
              id: 'fl2',
              airline: 'Japan Airlines',
              departure: '2024-04-14T18:00:00Z',
              arrival: '2024-04-14T22:45:00Z',
              price: 1200,
              status: 'booked',
            },
          ],
          accommodation: [
            {
              id: 'acc1',
              name: 'Hotel New Otani Tokyo',
              type: 'Hotel',
              checkIn: '2024-04-02',
              checkOut: '2024-04-14',
              price: 2800,
              rating: 4.5,
              status: 'booked',
            },
          ],
        },
        documents: {
          passport: { status: 'valid', expires: '2026-08-15' },
          visa: { status: 'not_required' },
          insurance: { status: 'comprehensive', provider: 'World Nomads' },
          vaccinations: [
            { name: 'Routine vaccinations', required: true, completed: true },
            { name: 'Japanese Encephalitis', required: false, completed: false },
          ],
        },
        activities: [
          {
            id: 'act1',
            name: 'Tokyo City Tour',
            type: 'Sightseeing',
            date: '2024-04-03',
            duration: '8 hours',
            price: 120,
            rating: 4.8,
            booked: true,
          },
          {
            id: 'act2',
            name: 'Mount Fuji Day Trip',
            type: 'Nature',
            date: '2024-04-06',
            duration: '10 hours',
            price: 180,
            rating: 4.9,
            booked: false,
          },
          {
            id: 'act3',
            name: 'Sushi Making Class',
            type: 'Cultural',
            date: '2024-04-08',
            duration: '3 hours',
            price: 85,
            rating: 4.7,
            booked: true,
          },
        ],
        progress: {
          planning: 95,
          booking: 80,
          preparation: 60,
          overall: 78,
        },
      };

      setTravelData(mockData);
    } catch (error) {
      console.error('Error fetching travel data:', error);
      toast.error('Failed to load travel data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFlights = async () => {
    setExecutingSearch(true);
    try {
      await apiService.executeAgentTask({
        goalId,
        taskType: 'searchFlights',
        priority: 'high',
        parameters: {
          origin: 'New York, NY',
          destination: 'Tokyo, Japan',
          departureDate: '2024-04-01',
          returnDate: '2024-04-14',
          passengers: 2,
        },
      });
      toast.success('Flight search updated!');
      await fetchTravelData();
    } catch (error) {
      toast.error('Flight search failed');
    } finally {
      setExecutingSearch(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading || !travelData) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plane className="w-8 h-8 text-white animate-pulse" />
        </div>
        <p className="text-gray-600">Loading travel dashboard...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'bookings', label: 'Bookings', icon: CreditCard },
    { id: 'weather', label: 'Weather', icon: Sun },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'activities', label: 'Activities', icon: Activity },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <Globe className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{travelData.destination.name} Adventure</h1>
              <p className="text-blue-100">
                {travelData.destination.country} • {travelData.itinerary.duration} days • {travelData.itinerary.travelers} travelers
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{travelData.progress.overall}%</div>
            <div className="text-blue-100 text-sm">Complete</div>
          </div>
        </div>
        
        {/* Progress Bars */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {Object.entries(travelData.progress).filter(([key]) => key !== 'overall').map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{key}</span>
                <span>{value}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Departure</div>
                        <div className="font-semibold">{formatDate(travelData.itinerary.departureDate)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Budget</div>
                        <div className="font-semibold">{formatCurrency(travelData.budget.total)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-purple-600 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Travelers</div>
                        <div className="font-semibold">{travelData.itinerary.travelers}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-orange-600 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Duration</div>
                        <div className="font-semibold">{travelData.itinerary.duration} days</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Breakdown */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Budget Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(travelData.budget.breakdown).map(([category, amount]) => (
                      <div key={category} className="bg-white p-3 rounded-lg">
                        <div className="text-sm text-gray-600 capitalize">{category}</div>
                        <div className="text-lg font-semibold">{formatCurrency(amount)}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(amount / travelData.budget.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Agent Recommendations */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                    AI Agent Insights
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start p-3 bg-white rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Perfect timing for cherry blossoms!</div>
                        <div className="text-sm text-gray-600">Weather Agent detected optimal hanami season during your visit.</div>
                      </div>
                    </div>
                    <div className="flex items-start p-3 bg-white rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Consider travel insurance upgrade</div>
                        <div className="text-sm text-gray-600">Financial Agent suggests comprehensive coverage for international travel.</div>
                      </div>
                    </div>
                    <div className="flex items-start p-3 bg-white rounded-lg">
                      <Star className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Book activities early</div>
                        <div className="text-sm text-gray-600">Research Agent found high demand for cultural experiences during your dates.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'bookings' && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Flights */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Plane className="w-5 h-5 mr-2 text-blue-600" />
                      Flights
                    </h3>
                    <button
                      onClick={handleSearchFlights}
                      disabled={executingSearch}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      <Navigation className={`w-4 h-4 mr-2 ${executingSearch ? 'animate-spin' : ''}`} />
                      Search Flights
                    </button>
                  </div>
                  <div className="space-y-3">
                    {travelData.bookings.flights.map((flight) => (
                      <div key={flight.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                              <Plane className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold">{flight.airline}</div>
                              <div className="text-sm text-gray-600">
                                {formatDate(flight.departure)} → {formatDate(flight.arrival)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(flight.price)}</div>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              flight.status === 'booked' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {flight.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accommodation */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Hotel className="w-5 h-5 mr-2 text-green-600" />
                    Accommodation
                  </h3>
                  <div className="space-y-3">
                    {travelData.bookings.accommodation.map((hotel) => (
                      <div key={hotel.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                              <Hotel className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold">{hotel.name}</div>
                              <div className="text-sm text-gray-600">
                                {hotel.type} • {hotel.rating} ⭐
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatDate(hotel.checkIn)} → {formatDate(hotel.checkOut)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(hotel.price)}</div>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              hotel.status === 'booked' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {hotel.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'weather' && (
              <motion.div
                key="weather"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Weather Forecast */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Thermometer className="w-5 h-5 mr-2 text-orange-600" />
                    5-Day Forecast
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {travelData.weather.forecast.map((day, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm font-medium mb-2">{formatDate(day.date)}</div>
                        <div className="text-3xl mb-2">{day.icon}</div>
                        <div className="text-sm text-gray-600 mb-2">{day.condition}</div>
                        <div className="text-sm">
                          <div className="font-semibold">{day.temp.max}°C</div>
                          <div className="text-gray-500">{day.temp.min}°C</div>
                        </div>
                        {day.precipitation > 0 && (
                          <div className="flex items-center justify-center mt-2 text-xs text-blue-600">
                            <Umbrella className="w-3 h-3 mr-1" />
                            {day.precipitation}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weather Recommendations */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Sun className="w-5 h-5 mr-2 text-blue-600" />
                    Packing Recommendations
                  </h4>
                  <div className="space-y-2">
                    {travelData.weather.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Document Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Passport</h4>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: Valid until {travelData.documents.passport.expires}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Visa</h4>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-sm text-gray-600">
                      Not required for US citizens
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Travel Insurance</h4>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-sm text-gray-600">
                      {travelData.documents.insurance.status} - {travelData.documents.insurance.provider}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Health</h4>
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-sm text-gray-600">
                      Optional vaccinations available
                    </div>
                  </div>
                </div>

                {/* Vaccination Details */}
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Health Requirements</h4>
                  <div className="space-y-2">
                    {travelData.documents.vaccinations.map((vacc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <div className="text-sm font-medium">{vacc.name}</div>
                          <div className="text-xs text-gray-600">
                            {vacc.required ? 'Required' : 'Optional'}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {vacc.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'activities' && (
              <motion.div
                key="activities"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {travelData.activities.map((activity) => (
                  <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-4">
                          <Camera className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{activity.name}</div>
                          <div className="text-sm text-gray-600">
                            {activity.type} • {formatDate(activity.date)} • {activity.duration}
                          </div>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-gray-600">{activity.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(activity.price)}</div>
                        {activity.booked ? (
                          <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Booked
                          </span>
                        ) : (
                          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
                            Book Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Discover More Activities</h3>
                  <p className="text-gray-600 mb-4">Let our AI agents find personalized experiences for you</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Get AI Recommendations
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TravelDashboard;