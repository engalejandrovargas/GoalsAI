export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  location?: string;
  ageRange?: string;
  onboardingCompleted: boolean;
  annualIncome?: number;
  currentSavings?: number;
  riskTolerance?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyReports?: boolean;
  goalReminders?: boolean;
  theme?: string;
  language?: string;
  currency?: string;
  defaultGoalCategory?: string;
  privacyLevel?: string;
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