export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  location?: string;
  ageRange?: string;
  onboardingCompleted: boolean;
  // Onboarding data
  currentSituation?: string;
  availableTime?: string;
  riskTolerance?: string;
  preferredApproach?: string;
  firstGoal?: string;
  // Financial data
  annualIncome?: number;
  currentSavings?: number;
  // Notification preferences
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyReports?: boolean;
  goalReminders?: boolean;
  // App preferences
  theme?: string;
  language?: string;
  currency?: string;
  defaultGoalCategory?: string;
  privacyLevel?: string;
  // AI settings
  aiInstructions?: string;
  aiTone?: string;
  aiDetailLevel?: string;
  aiApproachStyle?: string;
  // Extended profile
  occupation?: string;
  workSchedule?: string;
  personalityType?: string;
  learningStyle?: string;
  decisionMakingStyle?: string;
  communicationStyle?: string;
  motivationalFactors?: string;
  lifePriorities?: string;
  previousExperiences?: string;
  skillsAndStrengths?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (redirectTo?: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}