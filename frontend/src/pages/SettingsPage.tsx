import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette,
  Save,
  Check,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  LogOut,
  AlertCircle,
  Brain,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Heart,
  Star,
  Trophy,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { useConfirmation } from '../hooks/useConfirmation';
import toast from 'react-hot-toast';

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  goalReminders: boolean;
  theme: 'light' | 'dark' | 'mixed';
  language: string;
  timezone: string;
  currency: string;
}

interface AISettings {
  aiInstructions: string;
  aiTone: 'helpful' | 'casual' | 'formal' | 'motivational';
  aiDetailLevel: 'brief' | 'balanced' | 'detailed';
  aiApproachStyle: 'structured' | 'adaptive' | 'creative';
}

interface ExtendedProfile {
  nationality: string;
  occupation: string;
  workSchedule: string;
  personalityType: string;
  learningStyle: string;
  decisionMakingStyle: string;
  communicationStyle: string;
  motivationalFactors: string[];
  lifePriorities: string[];
  previousExperiences: string[];
  skillsAndStrengths: string[];
}

const SettingsPage: React.FC = () => {
  const { user, logout, checkAuth } = useAuth();
  const { theme, setTheme, colors } = useTheme();
  const { confirm, ConfirmationDialog } = useConfirmation();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    ageRange: user?.ageRange || '',
    currentSituation: user?.currentSituation || '',
    availableTime: user?.availableTime || '',
    riskTolerance: user?.riskTolerance || 'medium',
    preferredApproach: user?.preferredApproach || '',
    annualIncome: user?.annualIncome ? user.annualIncome.toString() : '',
    currentSavings: user?.currentSavings ? user.currentSavings.toString() : '',
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: user?.emailNotifications ?? true,
    pushNotifications: user?.pushNotifications ?? false,
    weeklyReports: user?.weeklyReports ?? true,
    goalReminders: user?.goalReminders ?? true,
    theme: (user?.theme as 'light' | 'dark' | 'mixed') || 'mixed',
    language: user?.language || 'en',
    timezone: 'America/New_York',
    currency: user?.currency || 'USD',
  });

  const [aiSettings, setAiSettings] = useState<AISettings>({
    aiInstructions: user?.aiInstructions || '',
    aiTone: (user?.aiTone as 'helpful' | 'casual' | 'formal' | 'motivational') || 'helpful',
    aiDetailLevel: (user?.aiDetailLevel as 'brief' | 'balanced' | 'detailed') || 'balanced',
    aiApproachStyle: (user?.aiApproachStyle as 'structured' | 'adaptive' | 'creative') || 'adaptive',
  });

  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile>({
    nationality: user?.nationality || '',
    occupation: user?.occupation || '',
    workSchedule: user?.workSchedule || '',
    personalityType: user?.personalityType || '',
    learningStyle: user?.learningStyle || '',
    decisionMakingStyle: user?.decisionMakingStyle || '',
    communicationStyle: user?.communicationStyle || '',
    motivationalFactors: user?.motivationalFactors ? (
      typeof user.motivationalFactors === 'string' ? JSON.parse(user.motivationalFactors) : user.motivationalFactors
    ) : [],
    lifePriorities: user?.lifePriorities ? (
      typeof user.lifePriorities === 'string' ? JSON.parse(user.lifePriorities) : user.lifePriorities
    ) : [],
    previousExperiences: user?.previousExperiences ? (
      typeof user.previousExperiences === 'string' ? JSON.parse(user.previousExperiences) : user.previousExperiences
    ) : [],
    skillsAndStrengths: user?.skillsAndStrengths ? (
      typeof user.skillsAndStrengths === 'string' ? JSON.parse(user.skillsAndStrengths) : user.skillsAndStrengths
    ) : [],
  });

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    motivationalFactors: false,
    lifePriorities: false,
    skillsAndStrengths: false,
    previousExperiences: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'onboarding', label: 'Goal Preferences', icon: Target },
    { id: 'ai-settings', label: 'AI Assistant', icon: Brain },
    { id: 'preferences', label: 'App Settings', icon: Settings },
  ];

  const themes = [
    { value: 'light', label: 'Light Theme', description: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark Theme', description: 'Fully dark and beautiful' },
    { value: 'mixed', label: 'Mixed Theme', description: 'Dark sidebar, light content (Default)' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'pt', label: 'Português' },
  ];

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
  ];


  const occupations = [
    { value: '', label: 'Select occupation' },
    { value: 'Software Engineer', label: 'Software Engineer' },
    { value: 'Teacher', label: 'Teacher' },
    { value: 'Doctor', label: 'Doctor' },
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Entrepreneur', label: 'Entrepreneur' },
    { value: 'Student', label: 'Student' },
    { value: 'Consultant', label: 'Consultant' },
    { value: 'Designer', label: 'Designer' },
    { value: 'Marketing Professional', label: 'Marketing Professional' },
    { value: 'Sales Representative', label: 'Sales Representative' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'Lawyer', label: 'Lawyer' },
    { value: 'Engineer', label: 'Engineer' },
    { value: 'Artist', label: 'Artist' },
    { value: 'Writer', label: 'Writer' },
    { value: 'Retired', label: 'Retired' },
    { value: 'Unemployed', label: 'Unemployed' },
    { value: 'Other', label: 'Other' },
  ];

  const workSchedules = [
    { value: '', label: 'Select work schedule' },
    { value: '9-5 Traditional', label: '9-5 Traditional' },
    { value: 'Flexible Hours', label: 'Flexible Hours' },
    { value: 'Remote Work', label: 'Remote Work' },
    { value: 'Shift Work', label: 'Shift Work' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Freelance/Contract', label: 'Freelance/Contract' },
    { value: 'Student', label: 'Student' },
    { value: 'Retired', label: 'Retired' },
  ];

  const personalityTypes = [
    { value: '', label: 'Select personality type' },
    { value: 'INTJ', label: 'INTJ - The Architect' },
    { value: 'INTP', label: 'INTP - The Thinker' },
    { value: 'ENTJ', label: 'ENTJ - The Commander' },
    { value: 'ENTP', label: 'ENTP - The Debater' },
    { value: 'INFJ', label: 'INFJ - The Advocate' },
    { value: 'INFP', label: 'INFP - The Mediator' },
    { value: 'ENFJ', label: 'ENFJ - The Protagonist' },
    { value: 'ENFP', label: 'ENFP - The Campaigner' },
    { value: 'ISTJ', label: 'ISTJ - The Logistician' },
    { value: 'ISFJ', label: 'ISFJ - The Protector' },
    { value: 'ESTJ', label: 'ESTJ - The Executive' },
    { value: 'ESFJ', label: 'ESFJ - The Consul' },
    { value: 'ISTP', label: 'ISTP - The Virtuoso' },
    { value: 'ISFP', label: 'ISFP - The Adventurer' },
    { value: 'ESTP', label: 'ESTP - The Entrepreneur' },
    { value: 'ESFP', label: 'ESFP - The Entertainer' },
    { value: 'Type A', label: 'Type A - Competitive, Time-urgent' },
    { value: 'Type B', label: 'Type B - Relaxed, Creative' },
    { value: 'Introvert', label: 'Introvert' },
    { value: 'Extrovert', label: 'Extrovert' },
    { value: 'Ambivert', label: 'Ambivert' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
  ];

  const learningStyles = [
    { value: '', label: 'Select learning style' },
    { value: 'Visual', label: 'Visual - Learn through seeing' },
    { value: 'Auditory', label: 'Auditory - Learn through hearing' },
    { value: 'Kinesthetic', label: 'Kinesthetic - Learn through doing' },
    { value: 'Reading/Writing', label: 'Reading/Writing - Learn through text' },
    { value: 'Multimodal', label: 'Multimodal - Combination of styles' },
  ];

  const decisionMakingStyles = [
    { value: '', label: 'Select decision style' },
    { value: 'Analytical', label: 'Analytical - Data-driven decisions' },
    { value: 'Intuitive', label: 'Intuitive - Gut feeling decisions' },
    { value: 'Collaborative', label: 'Collaborative - Seek input from others' },
    { value: 'Quick', label: 'Quick - Fast decision maker' },
    { value: 'Deliberate', label: 'Deliberate - Careful consideration' },
  ];

  const communicationStyles = [
    { value: '', label: 'Select communication style' },
    { value: 'Direct', label: 'Direct - Straight to the point' },
    { value: 'Diplomatic', label: 'Diplomatic - Tactful and considerate' },
    { value: 'Expressive', label: 'Expressive - Emotional and animated' },
    { value: 'Reserved', label: 'Reserved - Quiet and thoughtful' },
    { value: 'Supportive', label: 'Supportive - Encouraging and empathetic' },
  ];

  const motivationalFactorsOptions = [
    'Achievement', 'Recognition', 'Financial Security', 'Helping Others', 'Personal Growth', 
    'Work-Life Balance', 'Creativity', 'Independence', 'Leadership', 'Learning', 'Adventure',
    'Stability', 'Social Impact', 'Competition', 'Collaboration', 'Innovation', 'Tradition',
    'Excellence', 'Freedom', 'Purpose'
  ];

  const lifePrioritiesOptions = [
    'Family', 'Health', 'Career Growth', 'Work-Life Balance', 'Financial Security', 
    'Personal Relationships', 'Education', 'Travel', 'Spirituality', 'Community Service',
    'Creativity', 'Adventure', 'Stability', 'Independence', 'Legacy', 'Fun and Recreation',
    'Professional Development', 'Environmental Impact', 'Cultural Experiences', 'Self-Improvement'
  ];

  const skillsAndStrengthsOptions = [
    'Problem Solving', 'Communication', 'Leadership', 'Technical Skills', 'Creativity',
    'Organization', 'Time Management', 'Teamwork', 'Analytical Thinking', 'Adaptability',
    'Public Speaking', 'Writing', 'Research', 'Project Management', 'Negotiation',
    'Mentoring', 'Strategic Thinking', 'Detail-Oriented', 'Multitasking', 'Emotional Intelligence'
  ];

  const previousExperiencesOptions = [
    'Started a Business', 'Changed Careers', 'Traveled Solo', 'Learned New Language',
    'Completed Marathon', 'Led a Team', 'Earned Degree', 'Lived Abroad', 'Volunteered',
    'Published Work', 'Won Competition', 'Overcame Challenge', 'Taught Others', 'Built Something',
    'Saved Money', 'Lost Weight', 'Quit Bad Habit', 'Learned Instrument', 'Public Speaking',
    'Mentored Someone'
  ];

  // Update state when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        ageRange: user.ageRange || '',
        currentSituation: user.currentSituation || '',
        availableTime: user.availableTime || '',
        riskTolerance: user.riskTolerance || 'medium',
        preferredApproach: user.preferredApproach || '',
        annualIncome: user.annualIncome ? user.annualIncome.toString() : '',
        currentSavings: user.currentSavings ? user.currentSavings.toString() : '',
      });

      setPreferences({
        emailNotifications: user.emailNotifications ?? true,
        pushNotifications: user.pushNotifications ?? false,
        weeklyReports: user.weeklyReports ?? true,
        goalReminders: user.goalReminders ?? true,
        theme: (user.theme as 'light' | 'dark' | 'mixed') || 'mixed',
        language: user.language || 'en',
        timezone: 'America/New_York',
        currency: user.currency || 'USD',
      });

      setAiSettings({
        aiInstructions: user.aiInstructions || '',
        aiTone: (user.aiTone as 'helpful' | 'casual' | 'formal' | 'motivational') || 'helpful',
        aiDetailLevel: (user.aiDetailLevel as 'brief' | 'balanced' | 'detailed') || 'balanced',
        aiApproachStyle: (user.aiApproachStyle as 'structured' | 'adaptive' | 'creative') || 'adaptive',
      });

      setExtendedProfile({
        nationality: user.nationality || '',
        occupation: user.occupation || '',
        workSchedule: user.workSchedule || '',
        personalityType: user.personalityType || '',
        learningStyle: user.learningStyle || '',
        decisionMakingStyle: user.decisionMakingStyle || '',
        communicationStyle: user.communicationStyle || '',
        motivationalFactors: user.motivationalFactors ? (
          typeof user.motivationalFactors === 'string' ? JSON.parse(user.motivationalFactors) : user.motivationalFactors
        ) : [],
        lifePriorities: user.lifePriorities ? (
          typeof user.lifePriorities === 'string' ? JSON.parse(user.lifePriorities) : user.lifePriorities
        ) : [],
        previousExperiences: user.previousExperiences ? (
          typeof user.previousExperiences === 'string' ? JSON.parse(user.previousExperiences) : user.previousExperiences
        ) : [],
        skillsAndStrengths: user.skillsAndStrengths ? (
          typeof user.skillsAndStrengths === 'string' ? JSON.parse(user.skillsAndStrengths) : user.skillsAndStrengths
        ) : [],
      });
      
      // Reset hasChanges when user data updates
      setHasChanges(false);
    }
  }, [user]);

  const handleProfileChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAiSettingsChange = (field: string, value: any) => {
    setAiSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleExtendedProfileChange = (field: string, value: any) => {
    setExtendedProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Check if user is authenticated first
      if (!user) {
        toast.error('Please sign in to save your settings');
        setIsLoading(false);
        return;
      }

      // Prepare data to save
      const dataToSave = {
        location: profileData.location,
        ageRange: profileData.ageRange,
        currentSituation: profileData.currentSituation,
        availableTime: profileData.availableTime,
        riskTolerance: profileData.riskTolerance,
        preferredApproach: profileData.preferredApproach,
        annualIncome: profileData.annualIncome ? parseInt(profileData.annualIncome) : null,
        currentSavings: profileData.currentSavings ? parseInt(profileData.currentSavings) : null,
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        weeklyReports: preferences.weeklyReports,
        goalReminders: preferences.goalReminders,
        theme: preferences.theme,
        language: preferences.language,
        currency: preferences.currency,
        // AI Settings
        aiInstructions: aiSettings.aiInstructions,
        aiTone: aiSettings.aiTone,
        aiDetailLevel: aiSettings.aiDetailLevel,
        aiApproachStyle: aiSettings.aiApproachStyle,
        // Extended Profile
        nationality: extendedProfile.nationality,
        occupation: extendedProfile.occupation,
        workSchedule: extendedProfile.workSchedule,
        personalityType: extendedProfile.personalityType,
        learningStyle: extendedProfile.learningStyle,
        decisionMakingStyle: extendedProfile.decisionMakingStyle,
        communicationStyle: extendedProfile.communicationStyle,
        motivationalFactors: JSON.stringify(extendedProfile.motivationalFactors),
        lifePriorities: JSON.stringify(extendedProfile.lifePriorities),
        previousExperiences: JSON.stringify(extendedProfile.previousExperiences),
        skillsAndStrengths: JSON.stringify(extendedProfile.skillsAndStrengths),
      };

      // Save both profile data and preferences
      const response = await apiService.updateUserProfile(dataToSave);

      if (response.success) {
        setHasChanges(false);
        toast.success('Settings saved successfully!');
        
        // Update local state first with the new user data if available
        if (response.user) {
          setProfileData({
            name: response.user.name || '',
            email: response.user.email || '',
            location: response.user.location || '',
            ageRange: response.user.ageRange || '',
            currentSituation: response.user.currentSituation || '',
            availableTime: response.user.availableTime || '',
            riskTolerance: response.user.riskTolerance || 'medium',
            preferredApproach: response.user.preferredApproach || '',
            annualIncome: response.user.annualIncome ? response.user.annualIncome.toString() : '',
            currentSavings: response.user.currentSavings ? response.user.currentSavings.toString() : '',
          });

          setPreferences({
            emailNotifications: response.user.emailNotifications ?? true,
            pushNotifications: response.user.pushNotifications ?? false,
            weeklyReports: response.user.weeklyReports ?? true,
            goalReminders: response.user.goalReminders ?? true,
            theme: response.user.theme || 'mixed',
            language: response.user.language || 'en',
            timezone: response.user.timezone || 'America/New_York',
            currency: response.user.currency || 'USD',
          });

          setAiSettings({
            aiInstructions: response.user.aiInstructions || '',
            aiTone: response.user.aiTone || 'helpful',
            aiDetailLevel: response.user.aiDetailLevel || 'balanced',
            aiApproachStyle: response.user.aiApproachStyle || 'adaptive',
          });

          setExtendedProfile({
            nationality: response.user.nationality || '',
            occupation: response.user.occupation || '',
            workSchedule: response.user.workSchedule || '',
            personalityType: response.user.personalityType || '',
            learningStyle: response.user.learningStyle || '',
            decisionMakingStyle: response.user.decisionMakingStyle || '',
            communicationStyle: response.user.communicationStyle || '',
            motivationalFactors: response.user.motivationalFactors ? (
              typeof response.user.motivationalFactors === 'string' ? JSON.parse(response.user.motivationalFactors) : response.user.motivationalFactors
            ) : [],
            lifePriorities: response.user.lifePriorities ? (
              typeof response.user.lifePriorities === 'string' ? JSON.parse(response.user.lifePriorities) : response.user.lifePriorities
            ) : [],
            previousExperiences: response.user.previousExperiences ? (
              typeof response.user.previousExperiences === 'string' ? JSON.parse(response.user.previousExperiences) : response.user.previousExperiences
            ) : [],
            skillsAndStrengths: response.user.skillsAndStrengths ? (
              typeof response.user.skillsAndStrengths === 'string' ? JSON.parse(response.user.skillsAndStrengths) : response.user.skillsAndStrengths
            ) : [],
          });
        }
        
        // Update theme context if theme changed
        if (preferences.theme !== theme) {
          setTheme(preferences.theme as 'light' | 'dark' | 'mixed');
        }
        
        // Refresh the user data in auth context
        await checkAuth();
      } else {
        toast.error('Failed to save settings - server returned an error');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      
      // Handle specific authentication errors
      if (error.message?.includes('Authentication') || error.message?.includes('401')) {
        toast.error('Your session has expired. Please sign in again to save settings.');
        // Optionally redirect to login
        // logout();
      } else {
        toast.error(`Failed to save settings: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out? You will need to log in again to access your goals.',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      type: 'warning',
      icon: 'logout'
    });

    if (confirmed) {
      await logout();
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Full Name
            </label>
            <input
              type="text"
              value={profileData.name}
              disabled
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} opacity-60`}
            />
            <p className={`text-xs ${colors.textTertiary} mt-1`}>Managed by Google OAuth</p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} opacity-60`}
            />
            <p className={`text-xs ${colors.textTertiary} mt-1`}>Managed by Google OAuth</p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleProfileChange('location', e.target.value)}
              placeholder="City, Country"
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              Age Range
            </label>
            <select
              value={profileData.ageRange}
              onChange={(e) => handleProfileChange('ageRange', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select age range</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45-54">45-54</option>
              <option value="55-64">55-64</option>
              <option value="65+">65+</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              <Globe className="w-4 h-4 inline mr-1" />
              Nationality
            </label>
            <input
              type="text"
              value={extendedProfile.nationality}
              onChange={(e) => handleExtendedProfileChange('nationality', e.target.value)}
              placeholder="e.g., American, Brazilian, German"
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <p className={`text-xs ${colors.textTertiary} mt-1`}>Helps AI provide culturally relevant recommendations</p>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div>
        <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Occupation
            </label>
            <select
              value={extendedProfile.occupation}
              onChange={(e) => handleExtendedProfileChange('occupation', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {occupations.map(occupation => (
                <option key={occupation.value} value={occupation.value}>
                  {occupation.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Work Schedule
            </label>
            <select
              value={extendedProfile.workSchedule}
              onChange={(e) => handleExtendedProfileChange('workSchedule', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {workSchedules.map(schedule => (
                <option key={schedule.value} value={schedule.value}>
                  {schedule.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>


      {/* Personality & Learning Styles */}
      <div>
        <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Personality & Learning Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Personality Type
            </label>
            <select
              value={extendedProfile.personalityType}
              onChange={(e) => handleExtendedProfileChange('personalityType', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {personalityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Learning Style
            </label>
            <select
              value={extendedProfile.learningStyle}
              onChange={(e) => handleExtendedProfileChange('learningStyle', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {learningStyles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Personal Insights with Beautiful Collapsible Sections */}
      <div className={`${colors.cardBackground} border ${colors.cardBorder} rounded-xl p-6`}>
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Personal Insights</h3>
          <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            {extendedProfile.motivationalFactors.length + extendedProfile.lifePriorities.length + 
             extendedProfile.skillsAndStrengths.length + extendedProfile.previousExperiences.length} selected
          </span>
        </div>
        
        <div className="space-y-4">
          {/* Motivational Factors */}
          <div className={`${colors.cardBackground} rounded-lg border ${colors.cardBorder} shadow-sm overflow-hidden`}>
            <button
              onClick={() => toggleSection('motivationalFactors')}
              className={`w-full flex items-center justify-between p-4 hover:${colors.backgroundSecondary} transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-red-500" />
                <span className={`font-medium ${colors.textPrimary}`}>Motivational Factors</span>
                <span className={`text-sm ${colors.textTertiary} ${colors.backgroundSecondary} px-2 py-1 rounded-full`}>
                  {extendedProfile.motivationalFactors.length} selected
                </span>
              </div>
              {expandedSections.motivationalFactors ? 
                <ChevronUp className={`w-5 h-5 ${colors.textTertiary}`} /> : 
                <ChevronDown className={`w-5 h-5 ${colors.textTertiary}`} />
              }
            </button>
            {expandedSections.motivationalFactors && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`border-t ${colors.border} p-4 ${colors.backgroundSecondary}`}
              >
                <div className="grid grid-cols-2 gap-3">
                  {motivationalFactorsOptions.map(factor => (
                    <label key={factor} className={`flex items-center space-x-3 p-3 ${colors.cardBackground} rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border ${colors.cardBorder}`}>
                      <input
                        type="checkbox"
                        checked={extendedProfile.motivationalFactors.includes(factor)}
                        onChange={(e) => {
                          const current = extendedProfile.motivationalFactors;
                          const updated = e.target.checked
                            ? [...current, factor]
                            : current.filter(item => item !== factor);
                          handleExtendedProfileChange('motivationalFactors', updated);
                        }}
                        className={`w-4 h-4 text-blue-600 ${colors.inputBorder} rounded focus:ring-blue-500`}
                      />
                      <span className={`text-sm ${colors.textPrimary} font-medium`}>{factor}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Life Priorities */}
          <div className={`${colors.cardBackground} rounded-lg border ${colors.cardBorder} shadow-sm overflow-hidden`}>
            <button
              onClick={() => toggleSection('lifePriorities')}
              className={`w-full flex items-center justify-between p-4 hover:${colors.backgroundSecondary} transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className={`font-medium ${colors.textPrimary}`}>Life Priorities</span>
                <span className={`text-sm ${colors.textTertiary} ${colors.backgroundSecondary} px-2 py-1 rounded-full`}>
                  {extendedProfile.lifePriorities.length} selected
                </span>
              </div>
              {expandedSections.lifePriorities ? 
                <ChevronUp className={`w-5 h-5 ${colors.textTertiary}`} /> : 
                <ChevronDown className={`w-5 h-5 ${colors.textTertiary}`} />
              }
            </button>
            {expandedSections.lifePriorities && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`border-t ${colors.border} p-4 ${colors.backgroundSecondary}`}
              >
                <div className="grid grid-cols-2 gap-3">
                  {lifePrioritiesOptions.map(priority => (
                    <label key={priority} className={`flex items-center space-x-3 p-3 ${colors.cardBackground} rounded-lg hover:${colors.backgroundSecondary} cursor-pointer transition-colors border ${colors.cardBorder}`}>
                      <input
                        type="checkbox"
                        checked={extendedProfile.lifePriorities.includes(priority)}
                        onChange={(e) => {
                          const current = extendedProfile.lifePriorities;
                          const updated = e.target.checked
                            ? [...current, priority]
                            : current.filter(item => item !== priority);
                          handleExtendedProfileChange('lifePriorities', updated);
                        }}
                        className={`w-4 h-4 text-yellow-600 ${colors.inputBorder} rounded focus:ring-yellow-500`}
                      />
                      <span className={`text-sm ${colors.textPrimary} font-medium`}>{priority}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Skills & Strengths */}
          <div className={`${colors.cardBackground} rounded-lg border ${colors.cardBorder} shadow-sm overflow-hidden`}>
            <button
              onClick={() => toggleSection('skillsAndStrengths')}
              className={`w-full flex items-center justify-between p-4 hover:${colors.backgroundSecondary} transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5 text-green-500" />
                <span className={`font-medium ${colors.textPrimary}`}>Skills & Strengths</span>
                <span className={`text-sm ${colors.textTertiary} ${colors.backgroundSecondary} px-2 py-1 rounded-full`}>
                  {extendedProfile.skillsAndStrengths.length} selected
                </span>
              </div>
              {expandedSections.skillsAndStrengths ? 
                <ChevronUp className={`w-5 h-5 ${colors.textTertiary}`} /> : 
                <ChevronDown className={`w-5 h-5 ${colors.textTertiary}`} />
              }
            </button>
            {expandedSections.skillsAndStrengths && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`border-t ${colors.border} p-4 ${colors.backgroundSecondary}`}
              >
                <div className="grid grid-cols-2 gap-3">
                  {skillsAndStrengthsOptions.map(skill => (
                    <label key={skill} className={`flex items-center space-x-3 p-3 ${colors.cardBackground} rounded-lg hover:${colors.backgroundSecondary} cursor-pointer transition-colors border ${colors.cardBorder}`}>
                      <input
                        type="checkbox"
                        checked={extendedProfile.skillsAndStrengths.includes(skill)}
                        onChange={(e) => {
                          const current = extendedProfile.skillsAndStrengths;
                          const updated = e.target.checked
                            ? [...current, skill]
                            : current.filter(item => item !== skill);
                          handleExtendedProfileChange('skillsAndStrengths', updated);
                        }}
                        className={`w-4 h-4 text-green-600 ${colors.inputBorder} rounded focus:ring-green-500`}
                      />
                      <span className={`text-sm ${colors.textPrimary} font-medium`}>{skill}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Previous Experiences */}
          <div className={`${colors.cardBackground} rounded-lg border ${colors.cardBorder} shadow-sm overflow-hidden`}>
            <button
              onClick={() => toggleSection('previousExperiences')}
              className={`w-full flex items-center justify-between p-4 hover:${colors.backgroundSecondary} transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <span className={`font-medium ${colors.textPrimary}`}>Previous Experiences</span>
                <span className={`text-sm ${colors.textTertiary} ${colors.backgroundSecondary} px-2 py-1 rounded-full`}>
                  {extendedProfile.previousExperiences.length} selected
                </span>
              </div>
              {expandedSections.previousExperiences ? 
                <ChevronUp className={`w-5 h-5 ${colors.textTertiary}`} /> : 
                <ChevronDown className={`w-5 h-5 ${colors.textTertiary}`} />
              }
            </button>
            {expandedSections.previousExperiences && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`border-t ${colors.border} p-4 ${colors.backgroundSecondary}`}
              >
                <div className="grid grid-cols-2 gap-3">
                  {previousExperiencesOptions.map(experience => (
                    <label key={experience} className={`flex items-center space-x-3 p-3 ${colors.cardBackground} rounded-lg hover:${colors.backgroundSecondary} cursor-pointer transition-colors border ${colors.cardBorder}`}>
                      <input
                        type="checkbox"
                        checked={extendedProfile.previousExperiences.includes(experience)}
                        onChange={(e) => {
                          const current = extendedProfile.previousExperiences;
                          const updated = e.target.checked
                            ? [...current, experience]
                            : current.filter(item => item !== experience);
                          handleExtendedProfileChange('previousExperiences', updated);
                        }}
                        className={`w-4 h-4 text-purple-600 ${colors.inputBorder} rounded focus:ring-purple-500`}
                      />
                      <span className={`text-sm ${colors.textPrimary} font-medium`}>{experience}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className={`${colors.cardBackground} border ${colors.cardBorder} rounded-lg p-4`}>
        <h4 className={`font-medium ${colors.textPrimary} mb-2 flex items-center`}>
          <Brain className="w-4 h-4 mr-2 text-blue-500" />
          How This Helps Your AI Assistant
        </h4>
        <ul className={`text-sm ${colors.textSecondary} space-y-2`}>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2 mt-0.5">•</span>
            <span><strong className={colors.textPrimary}>Professional Info:</strong> Tailors time management and goal planning to your work life</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2 mt-0.5">•</span>
            <span><strong className={colors.textPrimary}>Learning Style:</strong> Suggests resources that match how you learn best</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2 mt-0.5">•</span>
            <span><strong className={colors.textPrimary}>Communication Style:</strong> Adapts how the AI communicates with you</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2 mt-0.5">•</span>
            <span><strong className={colors.textPrimary}>Motivational Factors:</strong> Connects goals to what drives you personally</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2 mt-0.5">•</span>
            <span><strong className={colors.textPrimary}>Life Priorities:</strong> Ensures recommendations align with what matters most</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2 mt-0.5">•</span>
            <span><strong className={colors.textPrimary}>Skills & Experiences:</strong> Leverages your strengths and past successes</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderOnboardingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Goal Planning Information</h3>
        <p className={`${colors.textSecondary} mb-6`}>
          This information helps our AI create better, more personalized goal plans for you.
        </p>
        

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Current Situation
            </label>
            <select
              value={profileData.currentSituation}
              onChange={(e) => handleProfileChange('currentSituation', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select your current situation</option>
              <option value="Student">Student</option>
              <option value="Working full-time">Working full-time</option>
              <option value="Working part-time">Working part-time</option>
              <option value="Freelancer/Contractor">Freelancer/Contractor</option>
              <option value="Stay-at-home parent">Stay-at-home parent</option>
              <option value="Unemployed/Job seeking">Unemployed/Job seeking</option>
              <option value="Retired">Retired</option>
              <option value="Business owner">Business owner</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Available Time for Goals
            </label>
            <select
              value={profileData.availableTime}
              onChange={(e) => handleProfileChange('availableTime', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select available time</option>
              <option value="Very busy (1-2 hours/week)">Very busy (1-2 hours/week)</option>
              <option value="Moderately busy (3-5 hours/week)">Moderately busy (3-5 hours/week)</option>
              <option value="Some flexibility (6-10 hours/week)">Some flexibility (6-10 hours/week)</option>
              <option value="Quite flexible (11+ hours/week)">Quite flexible (11+ hours/week)</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Preferred Approach
            </label>
            <select
              value={profileData.preferredApproach}
              onChange={(e) => handleProfileChange('preferredApproach', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select your preferred approach</option>
              <option value="Step-by-step with clear instructions">Step-by-step with clear instructions</option>
              <option value="Flexible with room for creativity">Flexible with room for creativity</option>
              <option value="Fast-paced and intensive">Fast-paced and intensive</option>
              <option value="Slow and steady progress">Slow and steady progress</option>
            </select>
          </div>


        </div>
      </div>

      {/* Financial Information for Goal Planning */}
      <div>
        <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Financial Information</h3>
        <p className={`${colors.textSecondary} mb-6`}>
          This helps our AI suggest realistic budgets and timelines for your financial goals.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              Annual Income
            </label>
            <input
              type="number"
              value={profileData.annualIncome}
              onChange={(e) => handleProfileChange('annualIncome', e.target.value)}
              placeholder="50000"
              key={`annualIncome-${user?.id}-${user?.annualIncome}`}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <p className={`text-xs ${colors.textTertiary} mt-1`}>Used for AI financial recommendations</p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Current Savings
            </label>
            <input
              type="number"
              value={profileData.currentSavings}
              onChange={(e) => handleProfileChange('currentSavings', e.target.value)}
              placeholder="10000"
              key={`currentSavings-${user?.id}-${user?.currentSavings}`}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Financial Risk Tolerance
            </label>
            <select
              value={profileData.riskTolerance}
              onChange={(e) => handleProfileChange('riskTolerance', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select your risk tolerance</option>
              <option value="low">Low - I prefer safe investments</option>
              <option value="medium">Medium - Balanced approach</option>
              <option value="high">High - I'm comfortable with risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Decision Making & Communication Preferences */}
      <div>
        <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Planning Preferences</h3>
        <p className={`${colors.textSecondary} mb-6`}>
          These preferences help our AI adapt its goal planning approach to match your style.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Decision Making Style
            </label>
            <select
              value={extendedProfile.decisionMakingStyle}
              onChange={(e) => handleExtendedProfileChange('decisionMakingStyle', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {decisionMakingStyles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Communication Style
            </label>
            <select
              value={extendedProfile.communicationStyle}
              onChange={(e) => handleExtendedProfileChange('communicationStyle', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {communicationStyles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );


  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>App Settings</h3>
      
      {/* Notifications Section */}
      <div>
        <h4 className={`text-md font-semibold ${colors.textPrimary} mb-4 flex items-center`}>
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </h4>
        <div className="space-y-4">
          <div className={`flex items-center justify-between p-4 ${colors.backgroundSecondary} rounded-lg`}>
            <div>
              <h5 className={`font-medium ${colors.textPrimary}`}>Email Notifications</h5>
              <p className={`text-sm ${colors.textSecondary}`}>Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 ${colors.backgroundTertiary} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
            </label>
          </div>

          <div className={`flex items-center justify-between p-4 ${colors.backgroundSecondary} rounded-lg`}>
            <div>
              <h5 className={`font-medium ${colors.textPrimary}`}>Goal Reminders</h5>
              <p className={`text-sm ${colors.textSecondary}`}>Regular reminders about your goals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.goalReminders}
                onChange={(e) => handlePreferenceChange('goalReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 ${colors.backgroundTertiary} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
            </label>
          </div>

          <div className={`flex items-center justify-between p-4 ${colors.backgroundSecondary} rounded-lg`}>
            <div>
              <h5 className={`font-medium ${colors.textPrimary}`}>Weekly Reports</h5>
              <p className={`text-sm ${colors.textSecondary}`}>Summary of your weekly progress</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.weeklyReports}
                onChange={(e) => handlePreferenceChange('weeklyReports', e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 ${colors.backgroundTertiary} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
            </label>
          </div>
        </div>
      </div>

      {/* App Preferences Section */}
      <div>
        <h4 className={`text-md font-semibold ${colors.textPrimary} mb-4 flex items-center`}>
          <Settings className="w-4 h-4 mr-2" />
          App Preferences
        </h4>
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
              <Palette className="w-4 h-4 inline mr-1" />
              Theme
            </label>
            <div className="grid grid-cols-1 gap-3">
              {themes.map((themeOption) => (
                <label key={themeOption.value} className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  preferences.theme === themeOption.value 
                    ? `border-blue-500 ${colors.backgroundSecondary}` 
                    : `${colors.cardBorder} hover:${colors.backgroundSecondary} ${colors.cardBackground}`
                }`}>
                  <input
                    type="radio"
                    name="theme"
                    value={themeOption.value}
                    checked={preferences.theme === themeOption.value}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    className={`w-4 h-4 text-blue-600 ${colors.inputBorder} focus:ring-blue-500`}
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${colors.textPrimary}`}>{themeOption.label}</div>
                    <div className={`text-sm ${colors.textSecondary}`}>{themeOption.description}</div>
                  </div>
                  <div className="flex space-x-1">
                    {themeOption.value === 'light' && (
                      <>
                        <div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div>
                        <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded-sm"></div>
                        <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded-sm"></div>
                      </>
                    )}
                    {themeOption.value === 'dark' && (
                      <>
                        <div className="w-4 h-4 bg-gray-900 border border-gray-700 rounded-sm"></div>
                        <div className="w-4 h-4 bg-gray-800 border border-gray-700 rounded-sm"></div>
                        <div className="w-4 h-4 bg-gray-700 border border-gray-700 rounded-sm"></div>
                      </>
                    )}
                    {themeOption.value === 'mixed' && (
                      <>
                        <div className="w-4 h-4 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-sm"></div>
                        <div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div>
                        <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded-sm"></div>
                      </>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              <Globe className="w-4 h-4 inline mr-1" />
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {currencies.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Account Management Section */}
      <div>
        <h4 className={`text-md font-semibold ${colors.textPrimary} mb-4 flex items-center`}>
          <User className="w-4 h-4 mr-2" />
          Account Management
        </h4>
        <div className="space-y-4">
          <div className={`p-4 ${colors.backgroundSecondary} rounded-lg`}>
            <h5 className={`font-medium ${colors.textPrimary} mb-2`}>Account Information</h5>
            <div className={`space-y-2 text-sm ${colors.textSecondary}`}>
              <p><strong>Account Type:</strong> Google OAuth</p>
              <p><strong>Member Since:</strong> {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
              <p><strong>Last Login:</strong> Today</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h5 className={`font-medium ${colors.textPrimary} mb-4`}>Danger Zone</h5>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
            <p className={`text-xs ${colors.textTertiary} mt-2`}>
              You'll need to sign in again to access your account
            </p>
          </div>
        </div>
      </div>
    </div>
  );


  const renderAiSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4 flex items-center`}>
          <Brain className="w-5 h-5 mr-2 text-blue-600" />
          AI Assistant Settings
        </h3>
        <p className="text-gray-300 mb-6">
          Customize how your AI assistant communicates and provides goal guidance. These settings help the AI adapt to your personal preferences and learning style.
        </p>

        <div className="space-y-6">
          {/* AI Tone */}
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Communication Tone
            </label>
            <select
              value={aiSettings.aiTone}
              onChange={(e) => handleAiSettingsChange('aiTone', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="helpful">Helpful - Professional and supportive</option>
              <option value="casual">Casual - Friendly and conversational</option>
              <option value="formal">Formal - Structured and professional</option>
              <option value="motivational">Motivational - Energetic and inspiring</option>
            </select>
            <p className={`text-xs ${colors.textTertiary} mt-1`}>
              Affects how the AI communicates with you in chat and recommendations
            </p>
          </div>

          {/* Detail Level */}
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Response Detail Level
            </label>
            <select
              value={aiSettings.aiDetailLevel}
              onChange={(e) => handleAiSettingsChange('aiDetailLevel', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="brief">Brief - Concise and to the point</option>
              <option value="balanced">Balanced - Good detail without overwhelming</option>
              <option value="detailed">Detailed - Comprehensive explanations and options</option>
            </select>
            <p className={`text-xs ${colors.textTertiary} mt-1`}>
              Controls how much detail the AI provides in responses and plans
            </p>
          </div>

          {/* Approach Style */}
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Planning Approach Style
            </label>
            <select
              value={aiSettings.aiApproachStyle}
              onChange={(e) => handleAiSettingsChange('aiApproachStyle', e.target.value)}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="structured">Structured - Clear frameworks and step-by-step processes</option>
              <option value="adaptive">Adaptive - Flexible approach based on your specific needs</option>
              <option value="creative">Creative - Innovative and unconventional solutions</option>
            </select>
            <p className={`text-xs ${colors.textTertiary} mt-1`}>
              Influences how the AI approaches goal planning and problem-solving
            </p>
          </div>

          {/* Custom Instructions */}
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Custom Instructions (Optional)
            </label>
            <textarea
              value={aiSettings.aiInstructions}
              onChange={(e) => handleAiSettingsChange('aiInstructions', e.target.value)}
              placeholder="e.g., Always include cost breakdowns, focus on eco-friendly options, consider my busy schedule..."
              rows={4}
              maxLength={1000}
              className={`w-full px-3 py-2 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Give the AI specific guidance on how to help you better
              </p>
              <span className="text-xs text-gray-400">
                {aiSettings.aiInstructions.length}/1000
              </span>
            </div>
          </div>

          {/* AI Capabilities Info */}
          <div className={`${colors.cardBackground} border ${colors.cardBorder} rounded-lg p-4`}>
            <h4 className={`font-medium ${colors.textPrimary} mb-2 flex items-center`}>
              <Brain className="w-4 h-4 mr-2 text-blue-500" />
              Enhanced AI Features
            </h4>
            <ul className={`text-sm ${colors.textSecondary} space-y-2`}>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>Analyzes goal complexity and adapts recommendations accordingly</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>Considers your financial situation for budget-appropriate suggestions</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>Adapts to your learning style (visual, auditory, kinesthetic, reading)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>Uses your personality type and motivational factors for personalization</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>Provides domain-specific expertise recommendations when needed</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>Adjusts support level based on goal difficulty and your preferences</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${colors.textPrimary} mb-2 flex items-center`}>
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-300">Manage your account and preferences</p>
        </div>

        {/* Authentication Warning */}
        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <h4 className="font-medium text-yellow-800">Authentication Required</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  Please sign in to view and modify your settings. Your changes will not be saved without authentication.
                </p>
                <button 
                  onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google`}
                  className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Sign In with Google
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`${colors.cardBackground} rounded-xl shadow-sm border ${colors.cardBorder} overflow-hidden`}>
          {/* Tab Navigation */}
          <div className={`border-b ${colors.border}`}>
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
                        : `${colors.textSecondary} hover:${colors.textPrimary} hover:${colors.backgroundSecondary}`
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'onboarding' && renderOnboardingTab()}
            {activeTab === 'ai-settings' && renderAiSettingsTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
          >
            <div className="flex items-center space-x-3">
              <p className="text-sm text-gray-800">You have unsaved changes</p>
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <ConfirmationDialog />
    </div>
  );
};

export default SettingsPage;