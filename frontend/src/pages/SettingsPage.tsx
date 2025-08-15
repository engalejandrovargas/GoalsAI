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
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  goalReminders: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  currency: string;
  defaultGoalCategory: string;
  privacyLevel: 'public' | 'private';
}

const SettingsPage: React.FC = () => {
  const { user, logout, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    ageRange: user?.ageRange || '',
    annualIncome: user?.annualIncome || '',
    currentSavings: user?.currentSavings || '',
    riskTolerance: user?.riskTolerance || 'medium',
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: user?.emailNotifications ?? true,
    pushNotifications: user?.pushNotifications ?? false,
    weeklyReports: user?.weeklyReports ?? true,
    goalReminders: user?.goalReminders ?? true,
    theme: user?.theme || 'light',
    language: user?.language || 'en',
    timezone: user?.timezone || 'America/New_York',
    currency: user?.currency || 'USD',
    defaultGoalCategory: user?.defaultGoalCategory || 'personal',
    privacyLevel: user?.privacyLevel || 'private',
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'account', label: 'Account', icon: Target },
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
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

  const categories = [
    { value: 'personal', label: 'Personal Development' },
    { value: 'career', label: 'Career & Business' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'finance', label: 'Financial' },
    { value: 'education', label: 'Education & Learning' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'creative', label: 'Creative & Hobbies' },
    { value: 'travel', label: 'Travel & Adventure' },
  ];

  // Update state when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        ageRange: user.ageRange || '',
        annualIncome: user.annualIncome?.toString() || '',
        currentSavings: user.currentSavings?.toString() || '',
        riskTolerance: user.riskTolerance || 'medium',
      });

      setPreferences({
        emailNotifications: user.emailNotifications ?? true,
        pushNotifications: user.pushNotifications ?? false,
        weeklyReports: user.weeklyReports ?? true,
        goalReminders: user.goalReminders ?? true,
        theme: user.theme || 'light',
        language: user.language || 'en',
        timezone: user.timezone || 'America/New_York',
        currency: user.currency || 'USD',
        defaultGoalCategory: user.defaultGoalCategory || 'personal',
        privacyLevel: user.privacyLevel || 'private',
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

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Prepare data to save
      const dataToSave = {
        location: profileData.location,
        ageRange: profileData.ageRange,
        annualIncome: profileData.annualIncome ? parseInt(profileData.annualIncome) : null,
        currentSavings: profileData.currentSavings ? parseInt(profileData.currentSavings) : null,
        riskTolerance: profileData.riskTolerance,
        timezone: preferences.timezone,
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        weeklyReports: preferences.weeklyReports,
        goalReminders: preferences.goalReminders,
        theme: preferences.theme,
        language: preferences.language,
        currency: preferences.currency,
        defaultGoalCategory: preferences.defaultGoalCategory,
        privacyLevel: preferences.privacyLevel,
      };

      // Save both profile data and preferences
      const response = await apiService.request<any>('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(dataToSave),
      });

      if (response.success) {
        setHasChanges(false);
        toast.success('Settings saved successfully!');
        // Refresh the user data in auth context
        await checkAuth();
        
        // Also update local state with the new user data if available
        if (response.user) {
          setProfileData({
            name: response.user.name || '',
            email: response.user.email || '',
            location: response.user.location || '',
            ageRange: response.user.ageRange || '',
            annualIncome: response.user.annualIncome?.toString() || '',
            currentSavings: response.user.currentSavings?.toString() || '',
            riskTolerance: response.user.riskTolerance || 'medium',
          });

          setPreferences({
            emailNotifications: response.user.emailNotifications ?? true,
            pushNotifications: response.user.pushNotifications ?? false,
            weeklyReports: response.user.weeklyReports ?? true,
            goalReminders: response.user.goalReminders ?? true,
            theme: response.user.theme || 'light',
            language: response.user.language || 'en',
            timezone: response.user.timezone || 'America/New_York',
            currency: response.user.currency || 'USD',
            defaultGoalCategory: response.user.defaultGoalCategory || 'personal',
            privacyLevel: response.user.privacyLevel || 'private',
          });
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await logout();
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profileData.name}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Managed by Google OAuth</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Managed by Google OAuth</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleProfileChange('location', e.target.value)}
              placeholder="City, Country"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Age Range
            </label>
            <select
              value={profileData.ageRange}
              onChange={(e) => handleProfileChange('ageRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Annual Income
            </label>
            <input
              type="number"
              value={profileData.annualIncome}
              onChange={(e) => handleProfileChange('annualIncome', e.target.value)}
              placeholder="50000"
              key={`annualIncome-${user?.id}-${user?.annualIncome}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Used for AI financial recommendations</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Savings
            </label>
            <input
              type="number"
              value={profileData.currentSavings}
              onChange={(e) => handleProfileChange('currentSavings', e.target.value)}
              placeholder="10000"
              key={`currentSavings-${user?.id}-${user?.currentSavings}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Tolerance
            </label>
            <select
              value={profileData.riskTolerance}
              onChange={(e) => handleProfileChange('riskTolerance', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low - I prefer safe investments</option>
              <option value="medium">Medium - Balanced approach</option>
              <option value="high">High - I'm comfortable with risk</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-600">Receive updates via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Goal Reminders</h4>
            <p className="text-sm text-gray-600">Regular reminders about your goals</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.goalReminders}
              onChange={(e) => handlePreferenceChange('goalReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Weekly Reports</h4>
            <p className="text-sm text-gray-600">Summary of your weekly progress</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.weeklyReports}
              onChange={(e) => handlePreferenceChange('weeklyReports', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">App Preferences</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Palette className="w-4 h-4 inline mr-1" />
            Theme
          </label>
          <select
            value={preferences.theme}
            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {themes.map(theme => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Language
          </label>
          <select
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={preferences.currency}
            onChange={(e) => handlePreferenceChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map(currency => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Goal Category
          </label>
          <select
            value={preferences.defaultGoalCategory}
            onChange={(e) => handlePreferenceChange('defaultGoalCategory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h3>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Data Security</h4>
              <p className="text-blue-800 text-sm">
                Your data is encrypted and securely stored. We never share your personal information with third parties.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Privacy Level
          </label>
          <select
            value={preferences.privacyLevel}
            onChange={(e) => handlePreferenceChange('privacyLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="private">Private - Only you can see your data</option>
            <option value="public">Public - Allow anonymous analytics</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Public setting only allows anonymous usage statistics to improve our AI
          </p>
        </div>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Management</h3>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Account Type:</strong> Google OAuth</p>
            <p><strong>Member Since:</strong> {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
            <p><strong>Last Login:</strong> Today</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-4">Danger Zone</h4>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
          <p className="text-xs text-gray-500 mt-2">
            You'll need to sign in again to access your account
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
            {activeTab === 'privacy' && renderPrivacyTab()}
            {activeTab === 'account' && renderAccountTab()}
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && activeTab !== 'account' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
          >
            <div className="flex items-center space-x-3">
              <p className="text-sm text-gray-600">You have unsaved changes</p>
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
    </div>
  );
};

export default SettingsPage;