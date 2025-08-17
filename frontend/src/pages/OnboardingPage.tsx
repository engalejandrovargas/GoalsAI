import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, User, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface OnboardingData {
  location: string;
  ageRange: string;
  currentSituation: string;
  availableTime: string;
  riskTolerance: string;
  preferredApproach: string;
  firstGoal: string;
}

const OnboardingPage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    location: '',
    ageRange: '',
    currentSituation: '',
    availableTime: '',
    riskTolerance: '',
    preferredApproach: '',
    firstGoal: '',
  });

  const totalSteps = 7;

  const ageRanges = [
    '18-24', '25-34', '35-44', '45-54', '55-64', '65+'
  ];

  const situationOptions = [
    'Student', 'Working full-time', 'Working part-time', 'Freelancer/Contractor', 
    'Stay-at-home parent', 'Unemployed/Job seeking', 'Retired', 'Business owner'
  ];

  const timeOptions = [
    'Very busy (1-2 hours/week)', 'Moderately busy (3-5 hours/week)', 
    'Some flexibility (6-10 hours/week)', 'Quite flexible (11+ hours/week)'
  ];

  const riskOptions = [
    'Conservative (prefer safe, proven methods)', 
    'Moderate (balanced approach)', 
    'Adventurous (willing to try new approaches)'
  ];

  const approachOptions = [
    'Step-by-step with clear instructions', 'Flexible with room for creativity', 
    'Fast-paced and intensive', 'Slow and steady progress'
  ];

  const quickGoalSuggestions = [
    { emoji: '🌍', text: 'Learn Spanish', category: 'Language' },
    { emoji: '🏃‍♀️', text: 'Run a 5K', category: 'Fitness' },
    { emoji: '💰', text: 'Save $5,000', category: 'Financial' },
    { emoji: '📚', text: 'Read 12 books this year', category: 'Learning' },
    { emoji: '🍳', text: 'Learn to cook Italian food', category: 'Skill' },
    { emoji: '✈️', text: 'Travel to Japan', category: 'Travel' },
    { emoji: '💻', text: 'Learn Python programming', category: 'Tech' },
    { emoji: '🎸', text: 'Learn to play guitar', category: 'Creative' },
    { emoji: '🏠', text: 'Buy my first home', category: 'Major Purchase' },
    { emoji: '🚗', text: 'Buy a car', category: 'Transportation' },
    { emoji: '🎨', text: 'Start a side business', category: 'Business' },
    { emoji: '🧘‍♀️', text: 'Meditate daily for 6 months', category: 'Wellness' },
  ];


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
                setData(prev => ({ ...prev, location: `${city}, ${country}` }));
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
      if (!data.location || !data.ageRange || !data.currentSituation || !data.availableTime || !data.riskTolerance || !data.preferredApproach) {
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
      case 3: return data.ageRange !== '';
      case 4: return data.currentSituation !== '';
      case 5: return data.availableTime !== '';
      case 6: return data.riskTolerance !== '' && data.preferredApproach !== '';
      case 7: return data.firstGoal.trim() !== '';
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
                Welcome to DreamPlan AI, {user?.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Let's personalize your experience and help you achieve your goals. 
                This will only take a few minutes.
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
                  className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  {isLoadingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Auto-detect my location
                    </>
                  )}
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => setData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., New York, NY or London, UK"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {data.location && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Location confirmed: {data.location}
                  </p>
                )}
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
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                About You
              </h2>
              <p className="text-gray-600">
                Help us understand your life stage so we can suggest age-appropriate goals and timelines.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Age Range *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ageRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setData(prev => ({ ...prev, ageRange: range }))}
                      className={`py-2 px-3 rounded-lg border transition-all text-sm font-medium ${
                        data.ageRange === range
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
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
                <span className="text-2xl">💼</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Current Situation
              </h2>
              <p className="text-gray-600">
                This helps us understand your schedule and lifestyle for better planning.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What describes you best? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {situationOptions.map((situation) => (
                    <button
                      key={situation}
                      onClick={() => setData(prev => ({ ...prev, currentSituation: situation }))}
                      className={`py-2 px-3 rounded-lg border transition-all text-sm font-medium text-left ${
                        data.currentSituation === situation
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {situation}
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
                <span className="text-2xl">⏰</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Available Time
              </h2>
              <p className="text-gray-600">
                We'll use this to suggest realistic timelines for your goals.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How much time do you typically have for personal goals? *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {timeOptions.map((time) => (
                    <button
                      key={time}
                      onClick={() => setData(prev => ({ ...prev, availableTime: time }))}
                      className={`py-2 px-3 rounded-lg border transition-all text-sm font-medium text-left ${
                        data.availableTime === time
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

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
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Preferences
              </h2>
              <p className="text-gray-600">
                Tell us how you like to approach challenges and what motivates you.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Risk Tolerance *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {riskOptions.map((risk) => (
                    <button
                      key={risk}
                      onClick={() => setData(prev => ({ ...prev, riskTolerance: risk }))}
                      className={`py-2 px-3 rounded-lg border transition-all text-sm font-medium text-left ${
                        data.riskTolerance === risk
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Approach *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {approachOptions.map((approach) => (
                    <button
                      key={approach}
                      onClick={() => setData(prev => ({ ...prev, preferredApproach: approach }))}
                      className={`py-2 px-3 rounded-lg border transition-all text-sm font-medium text-left ${
                        data.preferredApproach === approach
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {approach}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            key="step7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-lg mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your First Goal
              </h2>
              <p className="text-gray-600">
                Choose a goal to get started, or write your own. You can add more goals later!
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Popular Goals ✨
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {quickGoalSuggestions.map((goal, index) => (
                    <button
                      key={index}
                      onClick={() => setData(prev => ({ ...prev, firstGoal: goal.text }))}
                      className={`p-3 rounded-lg border transition-all text-left hover:shadow-md ${
                        data.firstGoal === goal.text
                          ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{goal.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{goal.text}</p>
                          <p className={`text-xs ${
                            data.firstGoal === goal.text ? 'text-blue-100' : 'text-gray-500'
                          }`}>{goal.category}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or write your own</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Goal
                </label>
                <textarea
                  value={data.firstGoal}
                  onChange={(e) => setData(prev => ({ ...prev, firstGoal: e.target.value }))}
                  placeholder="e.g., 'Write a novel', 'Start a podcast', 'Learn photography'"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
                <p className="mt-2 text-xs text-gray-500">
                  💡 Keep it simple - our AI will help you break it down and make it SMART
                </p>
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