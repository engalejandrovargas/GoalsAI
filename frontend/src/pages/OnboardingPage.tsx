import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, User, MapPin, Calendar, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { City, Country } from 'country-state-city';

interface OnboardingData {
  location: string;
  nationality: string; // New field for travel
  // ageRange: string; // Commented out - not needed for travel focus
  // currentSituation: string; // Commented out - not needed for travel focus
  // availableTime: string; // Commented out - not needed for travel focus
  // riskTolerance: string; // Commented out - not needed for travel focus
  // preferredApproach: string; // Commented out - not needed for travel focus
  travelBudget: string; // New field for travel
  travelStyle: string; // New field for travel
  firstGoal: string;
}

const OnboardingPage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nationalityDropdownRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<OnboardingData>({
    location: '',
    nationality: '',
    // ageRange: '', // Commented out for travel focus
    // currentSituation: '', // Commented out for travel focus
    // availableTime: '', // Commented out for travel focus
    // riskTolerance: '', // Commented out for travel focus
    // preferredApproach: '', // Commented out for travel focus
    travelBudget: '',
    travelStyle: '',
    firstGoal: '',
  });

  const totalSteps = 6; // Reduced from 7 to 6 for travel focus

  // COMMENTED OUT - Original onboarding options (keep for later expansion)
  // const ageRanges = [
  //   '18-24', '25-34', '35-44', '45-54', '55-64', '65+'
  // ];

  // const situationOptions = [
  //   'Student', 'Working full-time', 'Working part-time', 'Freelancer/Contractor', 
  //   'Stay-at-home parent', 'Unemployed/Job seeking', 'Retired', 'Business owner'
  // ];

  // const timeOptions = [
  //   'Very busy (1-2 hours/week)', 'Moderately busy (3-5 hours/week)', 
  //   'Some flexibility (6-10 hours/week)', 'Quite flexible (11+ hours/week)'
  // ];

  // const riskOptions = [
  //   'Conservative (prefer safe, proven methods)', 
  //   'Moderate (balanced approach)', 
  //   'Adventurous (willing to try new approaches)'
  // ];

  // const approachOptions = [
  //   'Step-by-step with clear instructions', 'Flexible with room for creativity', 
  //   'Fast-paced and intensive', 'Slow and steady progress'
  // ];

  // NEW TRAVEL-FOCUSED OPTIONS
  const budgetOptions = [
    'Budget traveler ($50-100/day)', 
    'Mid-range traveler ($100-200/day)', 
    'Luxury traveler ($200+/day)', 
    'Flexible budget (depends on destination)'
  ];

  const travelStyleOptions = [
    'Backpacker/Adventure seeker', 
    'Cultural explorer', 
    'Relaxation and leisure', 
    'Photography and nature',
    'Food and culinary experiences'
  ];

  // COMMENTED OUT - Original mixed goal suggestions (keep for later expansion)
  // const quickGoalSuggestions = [
  //   { emoji: '💰', text: 'Save $5,000 in 12 months', category: 'Financial' },
  //   { emoji: '🏃‍♀️', text: 'Run a 5K race in 3 months', category: 'Fitness' },
  //   { emoji: '🌍', text: 'Learn Spanish fluently in 6 months', category: 'Language' },
  //   { emoji: '✈️', text: 'Take a Japan trip in 8 months', category: 'Travel' },
  //   { emoji: '💻', text: 'Learn Python programming in 5 months', category: 'Tech' },
  // ];

  // NEW TRAVEL-ONLY GOAL SUGGESTIONS
  const travelGoalSuggestions = [
    { emoji: '🇯🇵', text: 'Explore Japan for 2 weeks', category: 'Cultural Adventure', budget: '$4000', duration: '14 days' },
    { emoji: '🇮🇹', text: 'Italian food and culture tour', category: 'Culinary Journey', budget: '$3500', duration: '10 days' },
    { emoji: '🇹🇭', text: 'Backpack through Southeast Asia', category: 'Adventure Travel', budget: '$2500', duration: '3 weeks' },
    { emoji: '🇫🇷', text: 'Romantic Paris getaway', category: 'City Break', budget: '$2800', duration: '1 week' },
    { emoji: '🇦🇺', text: 'Australian road trip adventure', category: 'Nature & Adventure', budget: '$5000', duration: '2 weeks' },
    { emoji: '🇵🇪', text: 'Hike Machu Picchu in Peru', category: 'Adventure & History', budget: '$3200', duration: '10 days' },
  ];

  // Get major cities (population-based filtering)
  const majorCities = useMemo(() => {
    const allCities = City.getAllCities();
    // Filter for major cities and format for display
    const filtered = allCities
      .filter(city => {
        const searchTerm = citySearch.toLowerCase();
        const cityName = city.name.toLowerCase();
        const countryName = Country.getCountryByCode(city.countryCode)?.name.toLowerCase() || '';
        return searchTerm === '' || 
               cityName.includes(searchTerm) || 
               countryName.includes(searchTerm);
      })
      .slice(0, 50) // Limit to 50 results for performance
      .map(city => ({
        id: `${city.name}-${city.countryCode}`,
        name: city.name,
        country: Country.getCountryByCode(city.countryCode)?.name || city.countryCode,
        displayName: `${city.name}, ${Country.getCountryByCode(city.countryCode)?.name || city.countryCode}`
      }));
    
    return filtered;
  }, [citySearch]);

  // Get countries for nationality dropdown - just use country names
  const filteredCountries = useMemo(() => {
    const allCountries = Country.getAllCountries();
    
    return allCountries
      .filter(country => {
        const searchTerm = nationalitySearch.toLowerCase();
        return searchTerm === '' || country.name.toLowerCase().includes(searchTerm);
      })
      .slice(0, 50) // Limit to 50 results for performance
      .map(country => ({
        id: country.isoCode,
        name: country.name,
        nationality: country.name, // Just use the country name
        flag: country.flag
      }));
  }, [nationalitySearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
      if (nationalityDropdownRef.current && !nationalityDropdownRef.current.contains(event.target as Node)) {
        setShowNationalityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const detectLocation = async () => {
    setIsLoadingLocation(true);
    try {
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              // Use a free geocoding service
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              const data = await response.json();
              const city = data.city || data.locality;
              const country = data.countryName;
              
              if (city && country) {
                const locationStr = `${city}, ${country}`;
                setData(prev => ({ ...prev, location: locationStr }));
                setCitySearch(locationStr);
              }
            } catch (error) {
              console.error('Geocoding failed:', error);
            } finally {
              setIsLoadingLocation(false);
            }
          },
          (error) => {
            console.error('Geolocation failed:', error);
            setIsLoadingLocation(false);
          }
        );
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      setIsLoadingLocation(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };




  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate data
      if (!data.location || !data.nationality || !data.travelBudget || !data.travelStyle || !data.firstGoal) {
        toast.error('Please complete all required fields');
        return;
      }

      const response = await apiService.completeOnboarding(data);
      
      if (response.createdGoal) {
        toast.success('Welcome to DreamPlan AI! 🎉 Your first goal has been created!');
      } else {
        toast.success('Welcome to DreamPlan AI! 🎉');
      }
      
      // Refresh user data and redirect
      await checkAuth();
      
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return true; // Welcome step
      case 2: return data.location.trim() !== '';
      case 3: return data.nationality.trim() !== '';
      case 4: return data.travelBudget !== '';
      case 5: return data.travelStyle !== '';
      case 6: return data.firstGoal.trim() !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to TravelPlan AI, {user?.name?.split(' ')[0]}! ✈️
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Let's plan your perfect travel adventure with AI-powered insights. 
                We'll create a personalized travel plan just for you!
              </p>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Where are you based?
              </h2>
              <p className="text-gray-600">
                This helps us provide location-relevant suggestions and opportunities.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-4">
                <button
                  onClick={detectLocation}
                  disabled={isLoadingLocation}
                  className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 mr-3"
                >
                  {isLoadingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Auto-detect
                    </>
                  )}
                </button>
                <span className="text-gray-400 text-sm">or choose from list</span>
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setShowCityDropdown(true);
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    placeholder="Search for your city (e.g., Paris, New York, Tokyo)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                {/* City Dropdown */}
                {showCityDropdown && majorCities.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {majorCities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          setData(prev => ({ ...prev, location: city.displayName }));
                          setCitySearch(city.displayName);
                          setShowCityDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                      >
                        <div className="font-medium text-gray-900">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.country}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {data.location && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Location confirmed: {data.location}
                  </p>
                )}
                
                <p className="mt-1 text-xs text-gray-500">
                  This helps us provide location-specific travel suggestions and costs
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Country
              </h2>
              <p className="text-gray-600">
                This helps us provide visa requirements, cultural tips, and travel restrictions specific to your passport.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative" ref={nationalityDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={nationalitySearch}
                    onChange={(e) => {
                      setNationalitySearch(e.target.value);
                      setShowNationalityDropdown(true);
                    }}
                    onFocus={() => setShowNationalityDropdown(true)}
                    placeholder="Search for your country (e.g., United States, Canada, Germany)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Nationality Dropdown */}
                {showNationalityDropdown && filteredCountries.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => {
                          setData(prev => ({ ...prev, nationality: country.name }));
                          setNationalitySearch(country.name);
                          setShowNationalityDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center space-x-2"
                      >
                        <span className="text-lg">{country.flag}</span>
                        <div>
                          <div className="font-medium text-gray-900">{country.name}</div>
                          <div className="text-sm text-gray-500">{country.isoCode || country.id}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {data.nationality && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Country confirmed: {data.nationality}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Used to determine visa requirements and travel restrictions for different destinations
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Travel Budget
              </h2>
              <p className="text-gray-600">
                This helps us suggest destinations and experiences that match your budget range.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your typical daily travel budget? *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {budgetOptions.map((budget) => (
                    <button
                      key={budget}
                      onClick={() => setData(prev => ({ ...prev, travelBudget: budget }))}
                      className={`py-3 px-4 rounded-lg border transition-all text-sm font-medium text-left ${
                        data.travelBudget === budget
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {budget}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎒</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Travel Style
              </h2>
              <p className="text-gray-600">
                What type of traveler are you? This helps us customize your travel planning.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What describes your travel style best? *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {travelStyleOptions.map((style) => (
                    <button
                      key={style}
                      onClick={() => setData(prev => ({ ...prev, travelStyle: style }))}
                      className={`py-3 px-4 rounded-lg border transition-all text-sm font-medium text-left ${
                        data.travelStyle === style
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      // COMMENTED OUT - Old case 6 (risk tolerance and preferences) - keep for later expansion
      // case 6:
      //   return (
      //     <motion.div
      //       key="step6"
      //       initial={{ opacity: 0, x: 20 }}
      //       animate={{ opacity: 1, x: 0 }}
      //       exit={{ opacity: 0, x: -20 }}
      //       className="max-w-lg mx-auto"
      //     >
      //       <div className="text-center mb-8">
      //         <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
      //           <span className="text-2xl">🎯</span>
      //         </div>
      //         <h2 className="text-2xl font-bold text-gray-900 mb-2">
      //           Your Preferences
      //         </h2>
      //         <p className="text-gray-600">
      //           Tell us how you like to approach challenges and what motivates you.
      //         </p>
      //       </div>
      //       <div className="space-y-6">
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-3">
      //             Risk Tolerance *
      //           </label>
      //           <div className="grid grid-cols-1 gap-2">
      //             {riskOptions.map((risk) => (
      //               <button
      //                 key={risk}
      //                 onClick={() => setData(prev => ({ ...prev, riskTolerance: risk }))}
      //                 className={`py-2 px-3 rounded-lg border transition-all text-sm font-medium text-left ${
      //                   data.riskTolerance === risk
      //                     ? 'bg-blue-500 text-white border-blue-500'
      //                     : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
      //                 }`}
      //               >
      //                 {risk}
      //               </button>
      //             ))}
      //           </div>
      //         </div>
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-3">
      //             Preferred Approach *
      //           </label>
      //           <div className="grid grid-cols-2 gap-2">
      //             {approachOptions.map((approach) => (
      //               <button
      //                 key={approach}
      //                 onClick={() => setData(prev => ({ ...prev, preferredApproach: approach }))}
      //                 className={`py-2 px-3 rounded-lg border transition-all text-sm font-medium text-left ${
      //                   data.preferredApproach === approach
      //                     ? 'bg-blue-500 text-white border-blue-500'
      //                     : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
      //                 }`}
      //               >
      //                 {approach}
      //               </button>
      //             ))}
      //           </div>
      //         </div>
      //       </div>
      //     </motion.div>
      //   );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-lg mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✈️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your First Travel Goal
              </h2>
              <p className="text-gray-600">
                Choose a travel destination to get started with AI-powered planning!
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Your Dream Destination ✨
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {travelGoalSuggestions.map((goal, index) => (
                    <button
                      key={index}
                      onClick={() => setData(prev => ({ ...prev, firstGoal: goal.text }))}
                      className={`p-4 rounded-lg border transition-all text-left hover:shadow-md ${
                        data.firstGoal === goal.text
                          ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl flex-shrink-0">{goal.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{goal.text}</p>
                            <p className={`text-xs ${
                              data.firstGoal === goal.text ? 'text-blue-100' : 'text-gray-500'
                            }`}>{goal.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            data.firstGoal === goal.text ? 'text-blue-100' : 'text-blue-600'
                          }`}>{goal.budget}</p>
                          <p className={`text-xs ${
                            data.firstGoal === goal.text ? 'text-blue-200' : 'text-gray-400'
                          }`}>{goal.duration}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="max-w-md mx-auto mt-12">
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  isStepValid(currentStep)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep) || isSubmitting}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  isStepValid(currentStep) && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Getting Started...' : 'Complete Setup'}
                {!isSubmitting && <span className="ml-2">🚀</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;