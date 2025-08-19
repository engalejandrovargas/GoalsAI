// Mock data for all dashboard components

// Financial Data
export const mockFinancialData = {
  currentSaved: 2500,
  targetAmount: 5000,
  monthlyIncome: 4500,
  monthlyExpenses: 3200,
  savingsRate: 28.9,
  expenses: [
    { category: 'Housing', amount: 1200, budget: 1300, color: '#3B82F6' },
    { category: 'Food', amount: 400, budget: 500, color: '#10B981' },
    { category: 'Transport', amount: 300, budget: 400, color: '#F59E0B' },
    { category: 'Entertainment', amount: 200, budget: 250, color: '#EF4444' },
    { category: 'Healthcare', amount: 150, budget: 200, color: '#8B5CF6' },
    { category: 'Other', amount: 250, budget: 300, color: '#6B7280' }
  ],
  recentExpenses: [
    { id: 1, description: 'Grocery Shopping', amount: 78.50, category: 'Food', date: '2024-12-15', type: 'expense' },
    { id: 2, description: 'Gas Station', amount: 45.00, category: 'Transport', date: '2024-12-14', type: 'expense' },
    { id: 3, description: 'Coffee', amount: 5.25, category: 'Food', date: '2024-12-14', type: 'expense' },
    { id: 4, description: 'Salary', amount: 4500, category: 'Income', date: '2024-12-01', type: 'income' }
  ],
  debts: [
    { id: 1, name: 'Credit Card', balance: 3200, minPayment: 95, interestRate: 18.9, type: 'credit' },
    { id: 2, name: 'Student Loan', balance: 12500, minPayment: 145, interestRate: 4.5, type: 'student' },
    { id: 3, name: 'Car Loan', balance: 8900, minPayment: 285, interestRate: 3.2, type: 'auto' }
  ]
};

// Investment Data
export const mockInvestmentData = {
  totalValue: 45230,
  totalInvested: 42000,
  totalGain: 3230,
  gainPercentage: 7.69,
  portfolio: [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 25, price: 185.20, value: 4630, gain: 12.5, color: '#3B82F6' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 15, price: 142.80, value: 2142, gain: -3.2, color: '#10B981' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 30, price: 378.85, value: 11365, gain: 8.7, color: '#F59E0B' },
    { symbol: 'TSLA', name: 'Tesla Inc.', shares: 12, price: 248.50, value: 2982, gain: -15.3, color: '#EF4444' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', shares: 100, price: 241.75, value: 24175, gain: 6.2, color: '#8B5CF6' }
  ],
  performance: [
    { month: 'Jan', value: 38500 },
    { month: 'Feb', value: 39200 },
    { month: 'Mar', value: 37800 },
    { month: 'Apr', value: 40100 },
    { month: 'May', value: 41500 },
    { month: 'Jun', value: 43200 },
    { month: 'Jul', value: 42800 },
    { month: 'Aug', value: 44100 },
    { month: 'Sep', value: 43500 },
    { month: 'Oct', value: 45230 }
  ]
};

// Progress Data
export const mockProgressData = {
  completionPercentage: 67,
  daysRemaining: 45,
  totalDays: 180,
  dailyProgress: [
    { date: '2024-12-01', value: 58 },
    { date: '2024-12-02', value: 59 },
    { date: '2024-12-03', value: 61 },
    { date: '2024-12-04', value: 62 },
    { date: '2024-12-05', value: 64 },
    { date: '2024-12-06', value: 65 },
    { date: '2024-12-07', value: 67 }
  ],
  milestones: [
    { id: 1, title: 'Research Phase', completed: true, date: '2024-01-15', description: 'Complete market research and feasibility study' },
    { id: 2, title: 'Planning Phase', completed: true, date: '2024-02-01', description: 'Finalize project plan and timeline' },
    { id: 3, title: 'Development Phase', completed: false, date: '2024-03-15', description: 'Build MVP and core features' },
    { id: 4, title: 'Testing Phase', completed: false, date: '2024-04-01', description: 'Comprehensive testing and bug fixes' },
    { id: 5, title: 'Launch Phase', completed: false, date: '2024-04-15', description: 'Public launch and marketing' }
  ]
};

// Health & Fitness Data
export const mockHealthData = {
  currentWeight: 175,
  targetWeight: 165,
  startWeight: 185,
  weightHistory: [
    { date: '2024-10-01', weight: 185 },
    { date: '2024-10-15', weight: 183 },
    { date: '2024-11-01', weight: 180 },
    { date: '2024-11-15', weight: 178 },
    { date: '2024-12-01', weight: 176 },
    { date: '2024-12-15', weight: 175 }
  ],
  workouts: [
    { id: 1, name: 'Morning Run', duration: 45, calories: 420, date: '2024-12-15', type: 'cardio' },
    { id: 2, name: 'Strength Training', duration: 60, calories: 380, date: '2024-12-14', type: 'strength' },
    { id: 3, name: 'Yoga Session', duration: 30, calories: 150, date: '2024-12-13', type: 'flexibility' },
    { id: 4, name: 'Bike Ride', duration: 90, calories: 650, date: '2024-12-12', type: 'cardio' }
  ],
  weeklyStats: {
    workoutsCompleted: 4,
    totalDuration: 225,
    totalCalories: 1600,
    averageHeartRate: 142
  }
};

// Learning Data
export const mockLearningData = {
  courses: [
    { id: 1, name: 'Spanish Fundamentals', progress: 78, totalLessons: 45, completedLessons: 35, provider: 'Duolingo' },
    { id: 2, name: 'React Development', progress: 45, totalLessons: 30, completedLessons: 14, provider: 'Udemy' },
    { id: 3, name: 'Data Science Basics', progress: 23, totalLessons: 60, completedLessons: 14, provider: 'Coursera' }
  ],
  skills: [
    { name: 'Spanish Speaking', level: 7, maxLevel: 10, category: 'Language' },
    { name: 'React', level: 6, maxLevel: 10, category: 'Programming' },
    { name: 'Python', level: 8, maxLevel: 10, category: 'Programming' },
    { name: 'Data Analysis', level: 4, maxLevel: 10, category: 'Analytics' }
  ],
  streaks: {
    currentStreak: 23,
    longestStreak: 45,
    weeklyGoal: 5,
    completedThisWeek: 4
  }
};

// Habit Tracking Data
export const mockHabitData = {
  habits: [
    { 
      id: 1, 
      name: 'Morning Exercise', 
      currentStreak: 15, 
      longestStreak: 28, 
      completionRate: 85,
      weeklyData: [true, true, false, true, true, true, true]
    },
    { 
      id: 2, 
      name: 'Read 30 minutes', 
      currentStreak: 8, 
      longestStreak: 21, 
      completionRate: 72,
      weeklyData: [true, false, true, true, true, false, true]
    },
    { 
      id: 3, 
      name: 'Meditation', 
      currentStreak: 12, 
      longestStreak: 15, 
      completionRate: 90,
      weeklyData: [true, true, true, true, true, true, false]
    }
  ],
  monthlyCalendar: generateHabitCalendar()
};

// Mood Data
export const mockMoodData = {
  currentMood: 4, // 1-5 scale
  moodHistory: [
    { date: '2024-12-15', mood: 4, note: 'Great workout today!' },
    { date: '2024-12-14', mood: 3, note: 'Busy day at work' },
    { date: '2024-12-13', mood: 5, note: 'Amazing progress on project' },
    { date: '2024-12-12', mood: 2, note: 'Feeling stressed' },
    { date: '2024-12-11', mood: 4, note: 'Good family time' },
    { date: '2024-12-10', mood: 3, note: 'Regular day' },
    { date: '2024-12-09', mood: 4, note: 'Productive morning' }
  ],
  weeklyAverage: 3.6,
  topTriggers: ['Work stress', 'Exercise', 'Sleep quality', 'Social time']
};

// Travel Data
export const mockTravelData = {
  destination: 'Tokyo, Japan',
  departureDate: '2024-06-15',
  returnDate: '2024-06-30',
  budget: 5000,
  spent: 1200,
  checklist: [
    { id: 1, item: 'Passport', completed: true, category: 'Documents' },
    { id: 2, item: 'Visa', completed: false, category: 'Documents' },
    { id: 3, item: 'Flight Booking', completed: true, category: 'Travel' },
    { id: 4, item: 'Hotel Reservation', completed: false, category: 'Accommodation' },
    { id: 5, item: 'Travel Insurance', completed: false, category: 'Insurance' }
  ],
  weather: {
    current: { temp: 18, condition: 'Sunny', humidity: 65 },
    forecast: [
      { day: 'Mon', high: 22, low: 15, condition: 'Sunny' },
      { day: 'Tue', high: 19, low: 12, condition: 'Cloudy' },
      { day: 'Wed', high: 24, low: 16, condition: 'Partly Cloudy' }
    ]
  }
};

// Career Data
export const mockCareerData = {
  applications: [
    { id: 1, company: 'Google', position: 'Senior Developer', status: 'Interview', appliedDate: '2024-11-15' },
    { id: 2, company: 'Microsoft', position: 'Full Stack Engineer', status: 'Applied', appliedDate: '2024-11-20' },
    { id: 3, company: 'Amazon', position: 'Software Engineer', status: 'Rejected', appliedDate: '2024-10-28' },
    { id: 4, company: 'Netflix', position: 'Frontend Developer', status: 'Pending', appliedDate: '2024-12-01' }
  ],
  interviews: [
    { date: '2024-12-20', company: 'Google', type: 'Technical', status: 'Scheduled' },
    { date: '2024-12-18', company: 'Spotify', type: 'HR', status: 'Completed' }
  ],
  networkConnections: 127,
  skillsToImprove: ['System Design', 'Leadership', 'Public Speaking']
};

// Business Data
export const mockBusinessData = {
  revenue: {
    current: 125000,
    target: 200000,
    growth: 15.8
  },
  customers: {
    total: 450,
    newThisMonth: 32,
    churnRate: 5.2
  },
  metrics: [
    { name: 'Monthly Revenue', value: '$12,500', change: '+15.8%', positive: true },
    { name: 'Active Users', value: '450', change: '+7.1%', positive: true },
    { name: 'Churn Rate', value: '5.2%', change: '-1.3%', positive: true },
    { name: 'Customer Acquisition Cost', value: '$45', change: '-8.5%', positive: true }
  ],
  revenueHistory: [
    { month: 'Jan', revenue: 8500 },
    { month: 'Feb', revenue: 9200 },
    { month: 'Mar', revenue: 10100 },
    { month: 'Apr', revenue: 11200 },
    { month: 'May', revenue: 12500 }
  ]
};

// Reading Data
export const mockReadingData = {
  currentBook: { title: 'Atomic Habits', author: 'James Clear', progress: 65, totalPages: 320 },
  booksRead: [
    { title: 'The Lean Startup', author: 'Eric Ries', rating: 5, completedDate: '2024-11-15' },
    { title: 'Deep Work', author: 'Cal Newport', rating: 4, completedDate: '2024-10-28' },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', rating: 5, completedDate: '2024-09-20' }
  ],
  yearlyGoal: 25,
  booksCompleted: 12,
  pagesRead: 3250,
  readingStreak: 18
};

// Market Data
export const mockMarketData = {
  indices: [
    { name: 'S&P 500', value: 4785.32, change: +1.2, symbol: 'SPX' },
    { name: 'NASDAQ', value: 15234.56, change: -0.8, symbol: 'IXIC' },
    { name: 'Dow Jones', value: 36890.12, change: +0.5, symbol: 'DJI' }
  ],
  crypto: [
    { name: 'Bitcoin', symbol: 'BTC', price: 45230.50, change: +3.2 },
    { name: 'Ethereum', symbol: 'ETH', price: 3156.80, change: -1.5 },
    { name: 'Cardano', symbol: 'ADA', price: 1.24, change: +5.8 }
  ],
  commodities: [
    { name: 'Gold', price: 1950.25, change: +0.3, unit: '/oz' },
    { name: 'Silver', price: 24.85, change: -0.8, unit: '/oz' },
    { name: 'Oil', price: 78.45, change: +1.2, unit: '/barrel' }
  ]
};

// Utility function to generate habit calendar
function generateHabitCalendar() {
  const calendar = [];
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendar.push({
      date: day,
      completed: Math.random() > 0.3 // 70% completion rate
    });
  }
  
  return calendar;
}

// Task/Project Data
export const mockTaskData = {
  tasks: [
    { id: 1, title: 'Complete market research', completed: true, priority: 'high', dueDate: '2024-12-10' },
    { id: 2, title: 'Design user interface mockups', completed: false, priority: 'high', dueDate: '2024-12-20' },
    { id: 3, title: 'Set up development environment', completed: true, priority: 'medium', dueDate: '2024-12-05' },
    { id: 4, title: 'Write technical documentation', completed: false, priority: 'low', dueDate: '2024-12-25' }
  ],
  projectPhases: [
    { name: 'Planning', startDate: '2024-01-01', endDate: '2024-02-15', progress: 100 },
    { name: 'Design', startDate: '2024-02-01', endDate: '2024-03-15', progress: 80 },
    { name: 'Development', startDate: '2024-03-01', endDate: '2024-05-15', progress: 35 },
    { name: 'Testing', startDate: '2024-05-01', endDate: '2024-06-15', progress: 0 }
  ]
};

// Resources Data
export const mockResourcesData = {
  resources: [
    { id: 1, title: 'React Documentation', type: 'docs', url: '#', category: 'Programming' },
    { id: 2, title: 'JavaScript: The Good Parts', type: 'book', url: '#', category: 'Programming' },
    { id: 3, title: 'Design Patterns Course', type: 'course', url: '#', category: 'Design' },
    { id: 4, title: 'System Design Interview', type: 'video', url: '#', category: 'Interviews' }
  ],
  categories: ['Programming', 'Design', 'Business', 'Health', 'Finance']
};

// Currency Data
export const mockCurrencyData = {
  rates: {
    'USD': 1.0,
    'EUR': 0.85,
    'GBP': 0.73,
    'JPY': 110.25,
    'CAD': 1.28,
    'AUD': 1.42
  },
  favorites: ['USD', 'EUR', 'JPY'],
  history: [
    { date: '2024-12-01', rate: 0.84 },
    { date: '2024-12-05', rate: 0.85 },
    { date: '2024-12-10', rate: 0.86 },
    { date: '2024-12-15', rate: 0.85 }
  ]
};

// Social/Motivation Data
export const mockSocialData = {
  accountabilityPartners: [
    { name: 'Sarah Johnson', progress: 78, lastUpdate: '2 hours ago', avatar: 'SJ' },
    { name: 'Mike Chen', progress: 65, lastUpdate: '1 day ago', avatar: 'MC' },
    { name: 'Emma Wilson', progress: 82, lastUpdate: '3 hours ago', avatar: 'EW' }
  ],
  achievements: [
    { title: '7-Day Streak', description: 'Completed tasks for 7 days straight', date: '2024-12-10', icon: '🔥' },
    { title: 'First Milestone', description: 'Reached your first major milestone', date: '2024-12-05', icon: '🎯' },
    { title: 'Early Bird', description: 'Completed morning routine 5 days in a row', date: '2024-12-01', icon: '🌅' }
  ],
  motivationalQuotes: [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
  ]
};

export default {
  financial: mockFinancialData,
  investment: mockInvestmentData,
  progress: mockProgressData,
  health: mockHealthData,
  learning: mockLearningData,
  habits: mockHabitData,
  mood: mockMoodData,
  travel: mockTravelData,
  career: mockCareerData,
  business: mockBusinessData,
  reading: mockReadingData,
  market: mockMarketData,
  tasks: mockTaskData,
  resources: mockResourcesData,
  currency: mockCurrencyData,
  social: mockSocialData
};