import type { GoalContext } from './GoalEstimationService';

export interface ComponentData {
  [componentId: string]: any;
}

class ComponentDataGenerator {
  
  /**
   * Generate realistic data for all dashboard components based on goal context
   */
  generateComponentData(
    context: GoalContext,
    estimatedCost: number,
    targetDate: Date,
    smartGoalData: any
  ): ComponentData {
    const currentDate = new Date();
    const totalDays = Math.ceil((targetDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
    const progress = Math.min(0.3, Math.random() * 0.6); // 0-60% progress, avg 30%
    const elapsedDays = Math.floor(totalDays * progress);

    return {
      // === CORE COMPONENTS ===
      agent_info: this.generateAgentInfo(context),
      task_manager: this.generateTaskManager(context, totalDays, progress),
      completion_meter: this.generateCompletionMeter(progress),
      
      // === FINANCIAL COMPONENTS ===
      financial_calculator: this.generateFinancialCalculator(estimatedCost, totalDays, progress),
      simple_savings_tracker: this.generateSavingsTracker(estimatedCost, progress),
      budget_breakdown: this.generateBudgetBreakdown(context, estimatedCost),
      expense_tracker: this.generateExpenseTracker(context, estimatedCost, elapsedDays),
      investment_tracker: this.generateInvestmentTracker(context, estimatedCost, progress),
      debt_payoff_tracker: this.generateDebtPayoffTracker(estimatedCost, progress, totalDays),
      currency_converter: this.generateCurrencyConverter(context),
      
      // === PROGRESS COMPONENTS ===
      progress_chart: this.generateProgressChart(elapsedDays, progress),
      milestone_timeline: this.generateMilestoneTimeline(context, targetDate, progress),
      progress_dashboard: this.generateProgressDashboard(context, progress, totalDays),
      smart_action_timeline: this.generateSmartActionTimeline(context, targetDate, progress),
      
      // === TRACKING COMPONENTS ===
      habit_tracker: this.generateHabitTracker(context, elapsedDays),
      streak_counter: this.generateStreakCounter(elapsedDays, progress),
      mood_tracker: this.generateMoodTracker(elapsedDays),
      skill_assessment: this.generateSkillAssessment(context, progress),
      reading_tracker: this.generateReadingTracker(context, progress),
      workout_tracker: this.generateWorkoutTracker(context, elapsedDays),
      
      // === PLANNING COMPONENTS ===
      calendar_widget: this.generateCalendarWidget(targetDate, totalDays),
      project_timeline: this.generateProjectTimeline(context, targetDate, progress),
      resource_library: this.generateResourceLibrary(context),
      document_checklist: this.generateDocumentChecklist(context, progress),
      weather_widget: this.generateWeatherWidget(context),
      
      // === SPECIALIZED DASHBOARDS ===
      health_dashboard: this.generateHealthDashboard(context, progress, elapsedDays),
      learning_dashboard: this.generateLearningDashboard(context, progress, elapsedDays),
      business_dashboard: this.generateBusinessDashboard(context, progress, estimatedCost),
      career_dashboard: this.generateCareerDashboard(context, progress, elapsedDays)
    };
  }

  // === CORE COMPONENTS ===
  private generateAgentInfo(context: GoalContext) {
    const agentTypes = {
      'financial': { name: 'Financial Advisor AI', usage: Math.floor(Math.random() * 50) + 20 },
      'health': { name: 'Health Coach AI', usage: Math.floor(Math.random() * 40) + 15 },
      'learning': { name: 'Learning Assistant AI', usage: Math.floor(Math.random() * 60) + 25 },
      'travel': { name: 'Travel Planner AI', usage: Math.floor(Math.random() * 30) + 10 },
      'business': { name: 'Business Advisor AI', usage: Math.floor(Math.random() * 45) + 20 },
      'research': { name: 'Research Assistant AI', usage: Math.floor(Math.random() * 35) + 15 }
    };

    return {
      activeAgents: Object.entries(agentTypes).slice(0, 2).map(([key, value]) => ({
        id: key,
        name: value.name,
        status: 'active',
        apiUsage: value.usage,
        lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      })),
      totalApiCalls: Math.floor(Math.random() * 200) + 50,
      costThisMonth: Math.round((Math.random() * 15 + 5) * 100) / 100
    };
  }

  private generateTaskManager(context: GoalContext, totalDays: number, progress: number) {
    const totalTasks = Math.floor(Math.random() * 15) + 10;
    const completedTasks = Math.floor(totalTasks * progress);
    
    const sampleTasks = this.generateSampleTasks(context.category);
    
    return {
      tasks: sampleTasks.slice(0, totalTasks).map((task, index) => ({
        id: `task-${index}`,
        title: task.title,
        description: task.description,
        completed: index < completedTasks,
        priority: task.priority,
        dueDate: new Date(Date.now() + (Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: task.category
      })),
      completedCount: completedTasks,
      totalCount: totalTasks,
      overdueTasks: Math.floor(Math.random() * 3)
    };
  }

  private generateCompletionMeter(progress: number) {
    return {
      currentProgress: Math.round(progress * 100),
      targetProgress: 100,
      progressSegments: [
        { label: 'Planning', value: Math.min(100, progress * 400), color: '#10B981' },
        { label: 'Execution', value: Math.min(100, Math.max(0, (progress - 0.25) * 400)), color: '#3B82F6' },
        { label: 'Refinement', value: Math.min(100, Math.max(0, (progress - 0.5) * 400)), color: '#8B5CF6' },
        { label: 'Completion', value: Math.min(100, Math.max(0, (progress - 0.75) * 400)), color: '#F59E0B' }
      ]
    };
  }

  // === FINANCIAL COMPONENTS ===
  private generateFinancialCalculator(estimatedCost: number, totalDays: number, progress: number) {
    const dailySavings = estimatedCost / totalDays;
    const weeklySavings = dailySavings * 7;
    const monthlySavings = dailySavings * 30;
    const currentSaved = estimatedCost * progress;

    return {
      targetAmount: estimatedCost,
      currentSaved: Math.round(currentSaved),
      remainingAmount: Math.round(estimatedCost - currentSaved),
      dailyNeeded: Math.round(dailySavings * 100) / 100,
      weeklyNeeded: Math.round(weeklySavings * 100) / 100,
      monthlyNeeded: Math.round(monthlySavings * 100) / 100,
      daysRemaining: Math.max(0, totalDays - Math.floor(totalDays * progress)),
      projectedCompletion: new Date(Date.now() + (totalDays * (1 - progress)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  private generateSavingsTracker(estimatedCost: number, progress: number) {
    return {
      goalAmount: estimatedCost,
      currentAmount: Math.round(estimatedCost * progress),
      progressPercentage: Math.round(progress * 100),
      monthlyContributions: Array.from({ length: 6 }, (_, i) => ({
        month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
        amount: Math.round((estimatedCost / 12) * (0.8 + Math.random() * 0.4))
      }))
    };
  }

  private generateBudgetBreakdown(context: GoalContext, estimatedCost: number) {
    const categories = this.getBudgetCategories(context.category);
    return {
      totalBudget: estimatedCost,
      categories: categories.map(cat => ({
        name: cat.name,
        allocated: Math.round(estimatedCost * cat.percentage),
        spent: Math.round(estimatedCost * cat.percentage * (0.3 + Math.random() * 0.4)),
        color: cat.color
      }))
    };
  }

  private generateExpenseTracker(context: GoalContext, estimatedCost: number, elapsedDays: number) {
    const dailyAverage = estimatedCost / 365;
    const expenses = [];
    
    for (let i = 0; i < Math.min(30, elapsedDays); i++) {
      if (Math.random() > 0.3) { // Not every day has expenses
        expenses.push({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: Math.round((dailyAverage * (0.5 + Math.random())) * 100) / 100,
          category: this.getRandomExpenseCategory(context.category),
          description: this.getExpenseDescription(context.category)
        });
      }
    }

    return {
      recentExpenses: expenses.slice(0, 10),
      totalThisMonth: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      avgDailySpend: Math.round(dailyAverage * 100) / 100,
      topCategories: this.getTopExpenseCategories(expenses)
    };
  }

  private generateInvestmentTracker(context: GoalContext, estimatedCost: number, progress: number) {
    const currentValue = Math.round(estimatedCost * progress);
    const returnRate = 0.05 + Math.random() * 0.15; // 5-20% return
    
    return {
      portfolioValue: currentValue,
      targetValue: estimatedCost,
      totalReturn: Math.round(currentValue * returnRate),
      ytdReturn: Math.round((returnRate * 100) * 10) / 10,
      monthlyContribution: Math.round(estimatedCost / 24), // 2 year plan
      riskLevel: this.assessRiskLevel(context),
      topHoldings: [
        { symbol: 'VTI', name: 'Total Stock Market ETF', allocation: 40, value: currentValue * 0.4 },
        { symbol: 'VTIAX', name: 'International Stock ETF', allocation: 30, value: currentValue * 0.3 },
        { symbol: 'BND', name: 'Total Bond Market ETF', allocation: 30, value: currentValue * 0.3 }
      ]
    };
  }

  private generateDebtPayoffTracker(estimatedCost: number, progress: number, totalDays: number) {
    const originalDebt = estimatedCost;
    const remainingDebt = originalDebt * (1 - progress);
    const monthlyPayment = originalDebt / (totalDays / 30);

    return {
      originalDebt: originalDebt,
      currentBalance: Math.round(remainingDebt),
      totalPaid: Math.round(originalDebt - remainingDebt),
      monthlyPayment: Math.round(monthlyPayment),
      payoffDate: new Date(Date.now() + (totalDays * (1 - progress)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      interestSaved: Math.round(originalDebt * 0.15 * progress) // Assume 15% interest
    };
  }

  private generateCurrencyConverter(context: GoalContext) {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    return {
      baseCurrency: 'USD',
      targetCurrency: 'EUR',
      exchangeRate: 0.85 + Math.random() * 0.1,
      supportedCurrencies: currencies,
      lastUpdated: new Date().toISOString()
    };
  }

  // === PROGRESS COMPONENTS ===
  private generateProgressChart(elapsedDays: number, currentProgress: number) {
    const dataPoints = Math.min(30, elapsedDays);
    const progressData = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const dayProgress = (i / dataPoints) * currentProgress;
      progressData.push({
        date: new Date(Date.now() - (dataPoints - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: Math.round(dayProgress * 100),
        target: Math.round((i / dataPoints) * 100)
      });
    }

    return {
      data: progressData,
      currentProgress: Math.round(currentProgress * 100),
      trend: currentProgress > 0.5 ? 'increasing' : 'steady'
    };
  }

  private generateMilestoneTimeline(context: GoalContext, targetDate: Date, progress: number) {
    const milestones = this.generateMilestones(context.category);
    const totalDays = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 3600 * 24));
    
    return {
      milestones: milestones.map((milestone, index) => {
        const dayOffset = (totalDays / milestones.length) * index;
        const milestoneDate = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
        const isCompleted = (index / milestones.length) < progress;
        
        return {
          id: `milestone-${index}`,
          title: milestone.title,
          description: milestone.description,
          date: milestoneDate.toISOString().split('T')[0],
          completed: isCompleted,
          category: milestone.category
        };
      })
    };
  }

  private generateProgressDashboard(context: GoalContext, progress: number, totalDays: number) {
    return {
      overallProgress: Math.round(progress * 100),
      timeElapsed: Math.round(progress * 100),
      keyMetrics: [
        { label: 'Completion Rate', value: `${Math.round(progress * 100)}%`, trend: 'up' },
        { label: 'Days Remaining', value: Math.max(0, totalDays - Math.floor(totalDays * progress)), trend: 'down' },
        { label: 'Efficiency Score', value: Math.round((progress / Math.max(progress, 0.1)) * 85 + 15), trend: 'up' }
      ],
      recentActivity: this.generateRecentActivity(context.category),
      nextActions: this.generateNextActions(context.category)
    };
  }

  private generateSmartActionTimeline(context: GoalContext, targetDate: Date, progress: number) {
    const actions = this.generateSmartActions(context.category);
    const totalDays = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 3600 * 24));
    
    return {
      actions: actions.map((action, index) => {
        const dayOffset = (totalDays / actions.length) * index;
        const actionDate = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
        
        return {
          id: `action-${index}`,
          title: action.title,
          description: action.description,
          dueDate: actionDate.toISOString().split('T')[0],
          completed: (index / actions.length) < progress,
          priority: action.priority,
          estimatedTime: action.estimatedTime
        };
      })
    };
  }

  // === TRACKING COMPONENTS ===
  private generateHabitTracker(context: GoalContext, elapsedDays: number) {
    const habits = this.generateHabits(context.category);
    const trackingDays = Math.min(30, elapsedDays);
    
    return {
      habits: habits.map((habit, index) => ({
        id: `habit-${index}`,
        name: habit.name,
        target: habit.target,
        current: Math.floor(habit.target * (0.6 + Math.random() * 0.3)),
        streak: Math.floor(Math.random() * trackingDays),
        completionRate: Math.round((60 + Math.random() * 30))
      })),
      overallCompletionRate: Math.round(65 + Math.random() * 25)
    };
  }

  private generateStreakCounter(elapsedDays: number, progress: number) {
    const maxStreak = Math.floor(elapsedDays * 0.8);
    const currentStreak = Math.floor(maxStreak * (0.7 + Math.random() * 0.3));
    
    return {
      currentStreak: currentStreak,
      longestStreak: maxStreak,
      totalActiveDays: Math.floor(elapsedDays * (0.6 + progress * 0.3)),
      streakHistory: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: Math.random() > 0.2
      }))
    };
  }

  private generateMoodTracker(elapsedDays: number) {
    const moodData = Array.from({ length: Math.min(30, elapsedDays) }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mood: Math.floor(Math.random() * 5) + 1,
      energy: Math.floor(Math.random() * 5) + 1,
      motivation: Math.floor(Math.random() * 5) + 1
    }));

    return {
      recentMoods: moodData,
      averageMood: Math.round(moodData.reduce((sum, day) => sum + day.mood, 0) / moodData.length * 10) / 10,
      moodTrend: Math.random() > 0.5 ? 'improving' : 'stable'
    };
  }

  private generateSkillAssessment(context: GoalContext, progress: number) {
    const skills = this.generateSkills(context.category);
    
    return {
      skills: skills.map((skill, index) => ({
        name: skill.name,
        currentLevel: Math.round(skill.startLevel + (skill.targetLevel - skill.startLevel) * progress),
        targetLevel: skill.targetLevel,
        progress: Math.round(progress * 100),
        category: skill.category
      })),
      overallSkillLevel: Math.round((skills.reduce((sum, s) => sum + s.startLevel, 0) / skills.length) + progress * 3),
      recommendedFocus: skills[Math.floor(Math.random() * skills.length)].name
    };
  }

  private generateReadingTracker(context: GoalContext, progress: number) {
    const targetBooks = context.category === 'reading' ? 52 : 12;
    const booksRead = Math.floor(targetBooks * progress);
    
    return {
      booksRead: booksRead,
      targetBooks: targetBooks,
      pagesRead: Math.floor(booksRead * 250 + Math.random() * 100),
      targetPages: targetBooks * 250,
      averageRating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      readingStreak: Math.floor(Math.random() * 50) + 10,
      currentBook: {
        title: "Sample Book Title",
        author: "Sample Author",
        progress: Math.round(Math.random() * 100),
        genre: "Non-fiction"
      },
      monthlyGoal: Math.ceil(targetBooks / 12),
      monthlyProgress: Math.floor(targetBooks / 12 * progress)
    };
  }

  private generateWorkoutTracker(context: GoalContext, elapsedDays: number) {
    const workoutDays = Math.floor(elapsedDays * 0.6); // 60% workout rate
    
    return {
      workoutsThisMonth: workoutDays,
      targetWorkouts: 20,
      totalWorkouts: workoutDays,
      averageIntensity: Math.round((6 + Math.random() * 3) * 10) / 10,
      caloriesBurned: Math.floor(workoutDays * (200 + Math.random() * 200)),
      favoriteWorkout: "Cardio",
      recentWorkouts: Array.from({ length: Math.min(7, workoutDays) }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: ["Cardio", "Strength", "Yoga", "HIIT"][Math.floor(Math.random() * 4)],
        duration: 30 + Math.random() * 60,
        calories: 150 + Math.random() * 300
      }))
    };
  }

  // === PLANNING COMPONENTS ===
  private generateCalendarWidget(targetDate: Date, totalDays: number) {
    const events = [];
    const milestoneCount = 5;
    
    for (let i = 1; i <= milestoneCount; i++) {
      const eventDate = new Date(Date.now() + (totalDays / milestoneCount * i) * 24 * 60 * 60 * 1000);
      events.push({
        id: `event-${i}`,
        title: `Milestone ${i}`,
        date: eventDate.toISOString().split('T')[0],
        type: 'milestone',
        description: `Important milestone checkpoint ${i}`
      });
    }

    return {
      targetDate: targetDate.toISOString().split('T')[0],
      daysRemaining: Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 3600 * 24)),
      upcomingEvents: events.slice(0, 3),
      allEvents: events
    };
  }

  private generateProjectTimeline(context: GoalContext, targetDate: Date, progress: number) {
    const phases = this.generateProjectPhases(context.category);
    const totalDays = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 3600 * 24));
    
    return {
      phases: phases.map((phase, index) => {
        const startDay = (totalDays / phases.length) * index;
        const endDay = (totalDays / phases.length) * (index + 1);
        const phaseProgress = Math.max(0, Math.min(1, (progress * phases.length) - index));
        
        return {
          id: `phase-${index}`,
          name: phase.name,
          description: phase.description,
          startDate: new Date(Date.now() + startDay * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + endDay * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          progress: Math.round(phaseProgress * 100),
          status: phaseProgress === 1 ? 'completed' : phaseProgress > 0 ? 'in-progress' : 'pending'
        };
      })
    };
  }

  private generateResourceLibrary(context: GoalContext) {
    const resources = this.generateResources(context.category);
    
    return {
      totalResources: resources.length,
      categories: ['Articles', 'Videos', 'Books', 'Courses', 'Tools'],
      resources: resources.map((resource, index) => ({
        id: `resource-${index}`,
        title: resource.title,
        type: resource.type,
        url: resource.url,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        category: resource.category,
        accessed: Math.random() > 0.7
      })),
      recentlyAdded: resources.slice(0, 3)
    };
  }

  private generateDocumentChecklist(context: GoalContext, progress: number) {
    const documents = this.generateDocuments(context.category);
    const completedCount = Math.floor(documents.length * progress);
    
    return {
      documents: documents.map((doc, index) => ({
        id: `doc-${index}`,
        name: doc.name,
        required: doc.required,
        completed: index < completedCount,
        dueDate: doc.dueDate,
        category: doc.category,
        description: doc.description
      })),
      completedCount,
      totalCount: documents.length,
      upcomingDeadlines: documents.filter(doc => !doc.completed && new Date(doc.dueDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    };
  }

  private generateWeatherWidget(context: GoalContext) {
    const locations = context.userLocation ? [context.userLocation] : ['Current Location'];
    
    return {
      currentWeather: {
        location: locations[0],
        temperature: Math.round(15 + Math.random() * 20),
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(5 + Math.random() * 15)
      },
      forecast: Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        high: Math.round(18 + Math.random() * 15),
        low: Math.round(10 + Math.random() * 10),
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)]
      }))
    };
  }

  // === SPECIALIZED DASHBOARDS ===
  private generateHealthDashboard(context: GoalContext, progress: number, elapsedDays: number) {
    return {
      currentWeight: Math.round(170 - progress * 15), // Weight loss example
      targetWeight: 155,
      weightLoss: Math.round(progress * 15),
      workoutsThisWeek: Math.floor(Math.random() * 6) + 1,
      caloriesBurned: Math.floor(2000 * progress + Math.random() * 500),
      sleepAverage: Math.round((7 + Math.random()) * 10) / 10,
      waterIntake: Math.round(6 + Math.random() * 4),
      healthScore: Math.round(70 + progress * 25),
      vitals: {
        heartRate: Math.round(65 + Math.random() * 20),
        bloodPressure: `${Math.round(110 + Math.random() * 20)}/${Math.round(70 + Math.random() * 15)}`,
        steps: Math.floor(6000 + Math.random() * 6000)
      },
      weeklyProgress: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weight: Math.round((170 - progress * 15 + Math.random() * 2 - 1) * 10) / 10,
        workoutMinutes: Math.random() > 0.3 ? Math.floor(30 + Math.random() * 60) : 0
      }))
    };
  }

  private generateLearningDashboard(context: GoalContext, progress: number, elapsedDays: number) {
    return {
      coursesEnrolled: 3,
      coursesCompleted: Math.floor(3 * progress),
      totalLearningHours: Math.floor(elapsedDays * 0.5 + Math.random() * elapsedDays * 0.3),
      skillsImproved: Math.floor(5 + progress * 10),
      certificationsEarned: Math.floor(progress * 3),
      currentCourse: {
        name: "Advanced JavaScript Concepts",
        progress: Math.round(progress * 100),
        nextLesson: "Async/Await Patterns",
        timeRemaining: "2.5 hours"
      },
      skillProgress: [
        { skill: "JavaScript", level: Math.round(6 + progress * 3), maxLevel: 10 },
        { skill: "React", level: Math.round(5 + progress * 4), maxLevel: 10 },
        { skill: "Node.js", level: Math.round(4 + progress * 3), maxLevel: 10 }
      ],
      weeklyStudyTime: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        minutes: Math.random() > 0.2 ? Math.floor(30 + Math.random() * 120) : 0
      }))
    };
  }

  private generateBusinessDashboard(context: GoalContext, progress: number, estimatedCost: number) {
    const revenue = estimatedCost * 0.1 * progress; // 10% of investment as revenue
    
    return {
      monthlyRevenue: Math.round(revenue),
      targetRevenue: Math.round(estimatedCost * 0.1),
      totalCustomers: Math.floor(50 + progress * 150),
      newCustomersThisMonth: Math.floor(10 + progress * 20),
      conversionRate: Math.round((2 + progress * 3) * 10) / 10,
      avgOrderValue: Math.round(revenue / Math.max(1, Math.floor(50 + progress * 150))),
      profitMargin: Math.round((15 + progress * 10) * 10) / 10,
      businessGoals: [
        { metric: "Revenue", current: Math.round(revenue), target: Math.round(estimatedCost * 0.1), progress: Math.round(progress * 100) },
        { metric: "Customers", current: Math.floor(50 + progress * 150), target: 200, progress: Math.round(progress * 100) },
        { metric: "Conversion", current: Math.round((2 + progress * 3) * 10) / 10, target: 5, progress: Math.round(progress * 100) }
      ],
      revenueHistory: Array.from({ length: 6 }, (_, i) => ({
        month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
        revenue: Math.round(revenue * (0.6 + i * 0.1 + Math.random() * 0.2))
      }))
    };
  }

  private generateCareerDashboard(context: GoalContext, progress: number, elapsedDays: number) {
    return {
      jobApplications: Math.floor(5 + progress * 15),
      interviewsScheduled: Math.floor(progress * 5),
      networkingConnections: Math.floor(10 + progress * 20),
      skillCertifications: Math.floor(progress * 3),
      portfolioProjects: Math.floor(2 + progress * 3),
      linkedinViews: Math.floor(50 + progress * 100 + Math.random() * 50),
      careerScore: Math.round(60 + progress * 30),
      applicationStatus: [
        { company: "TechCorp Inc", position: "Senior Developer", status: "Pending", appliedDate: "2024-01-15" },
        { company: "StartupXYZ", position: "Full Stack Engineer", status: "Interview", appliedDate: "2024-01-20" },
        { company: "BigTech Co", position: "Software Engineer", status: "Rejected", appliedDate: "2024-01-10" }
      ].slice(0, Math.floor(progress * 5) + 1),
      skillGaps: ["Cloud Architecture", "Machine Learning", "DevOps"].slice(0, Math.max(1, 3 - Math.floor(progress * 3))),
      upcomingEvents: [
        { type: "Interview", company: "TechCorp", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { type: "Networking Event", event: "Tech Meetup", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
      ]
    };
  }

  // === HELPER METHODS ===
  private generateSampleTasks(category: string): Array<{title: string, description: string, priority: string, category: string}> {
    const taskMap: Record<string, Array<{title: string, description: string, priority: string, category: string}>> = {
      'fitness': [
        { title: "Plan weekly workout schedule", description: "Create a balanced routine", priority: "high", category: "Planning" },
        { title: "Track daily calories", description: "Monitor nutritional intake", priority: "medium", category: "Tracking" },
        { title: "Join local gym", description: "Research and sign up for gym membership", priority: "high", category: "Setup" },
        { title: "Buy workout equipment", description: "Purchase necessary gear", priority: "low", category: "Equipment" }
      ],
      'savings': [
        { title: "Set up automatic savings transfer", description: "Automate monthly savings", priority: "high", category: "Setup" },
        { title: "Review monthly expenses", description: "Track spending patterns", priority: "medium", category: "Analysis" },
        { title: "Research high-yield savings accounts", description: "Find better interest rates", priority: "low", category: "Research" }
      ],
      'default': [
        { title: "Define project scope", description: "Clarify goals and requirements", priority: "high", category: "Planning" },
        { title: "Create action plan", description: "Break down into manageable steps", priority: "high", category: "Planning" },
        { title: "Gather necessary resources", description: "Collect tools and materials", priority: "medium", category: "Preparation" },
        { title: "Set up tracking system", description: "Monitor progress effectively", priority: "medium", category: "Setup" }
      ]
    };

    return taskMap[category] || taskMap['default'];
  }

  private getBudgetCategories(category: string): Array<{name: string, percentage: number, color: string}> {
    const categoryMap: Record<string, Array<{name: string, percentage: number, color: string}>> = {
      'travel': [
        { name: "Transportation", percentage: 0.4, color: "#3B82F6" },
        { name: "Accommodation", percentage: 0.3, color: "#10B981" },
        { name: "Food & Dining", percentage: 0.2, color: "#F59E0B" },
        { name: "Activities", percentage: 0.1, color: "#8B5CF6" }
      ],
      'fitness': [
        { name: "Gym Membership", percentage: 0.5, color: "#3B82F6" },
        { name: "Equipment", percentage: 0.3, color: "#10B981" },
        { name: "Supplements", percentage: 0.15, color: "#F59E0B" },
        { name: "Coaching", percentage: 0.05, color: "#8B5CF6" }
      ],
      'default': [
        { name: "Primary Expense", percentage: 0.6, color: "#3B82F6" },
        { name: "Supporting Costs", percentage: 0.25, color: "#10B981" },
        { name: "Miscellaneous", percentage: 0.15, color: "#F59E0B" }
      ]
    };

    return categoryMap[category] || categoryMap['default'];
  }

  private getRandomExpenseCategory(goalCategory: string): string {
    const categoryMap: Record<string, string[]> = {
      'travel': ["Transportation", "Accommodation", "Food", "Activities"],
      'fitness': ["Gym", "Equipment", "Supplements", "Coaching"],
      'education': ["Courses", "Books", "Materials", "Certification"],
      'default': ["Materials", "Tools", "Services", "Miscellaneous"]
    };

    const categories = categoryMap[goalCategory] || categoryMap['default'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private getExpenseDescription(goalCategory: string): string {
    const descriptions: Record<string, string[]> = {
      'travel': ["Flight booking", "Hotel reservation", "Restaurant meal", "Tour ticket"],
      'fitness': ["Gym membership", "Protein powder", "Workout gear", "Personal trainer"],
      'education': ["Online course", "Technical book", "Study materials", "Exam fee"],
      'default': ["Project expense", "Resource purchase", "Service fee", "Equipment"]
    };

    const categoryDescriptions = descriptions[goalCategory] || descriptions['default'];
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  }

  private getTopExpenseCategories(expenses: any[]): Array<{name: string, amount: number}> {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }

  private assessRiskLevel(context: GoalContext): string {
    const content = `${context.title} ${context.description || ''}`.toLowerCase();
    
    if (content.includes('conservative') || content.includes('safe')) return 'Conservative';
    if (content.includes('aggressive') || content.includes('growth')) return 'Aggressive';
    return 'Moderate';
  }

  private generateRecentActivity(category: string): Array<{action: string, timestamp: string}> {
    const activities: Record<string, string[]> = {
      'fitness': ["Completed 45min cardio workout", "Logged daily weight", "Updated meal plan"],
      'savings': ["Made monthly savings transfer", "Reviewed bank statements", "Updated budget spreadsheet"],
      'education': ["Completed Chapter 3", "Submitted assignment", "Attended virtual lecture"],
      'default': ["Updated progress log", "Completed daily tasks", "Reviewed milestones"]
    };

    const categoryActivities = activities[category] || activities['default'];
    return categoryActivities.slice(0, 3).map(action => ({
      action,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  private generateNextActions(category: string): string[] {
    const nextActions: Record<string, string[]> = {
      'fitness': ["Schedule next workout session", "Meal prep for the week", "Update fitness tracker"],
      'savings': ["Review this month's expenses", "Research investment options", "Update savings goal"],
      'education': ["Start next course module", "Practice exercises", "Schedule study time"],
      'default': ["Review current progress", "Plan next phase", "Update timeline"]
    };

    return nextActions[category] || nextActions['default'];
  }

  private generateSmartActions(category: string): Array<{title: string, description: string, priority: string, estimatedTime: string}> {
    const actions: Record<string, Array<{title: string, description: string, priority: string, estimatedTime: string}>> = {
      'fitness': [
        { title: "Create workout schedule", description: "Plan weekly exercise routine", priority: "high", estimatedTime: "1 hour" },
        { title: "Track nutrition", description: "Log daily meals and calories", priority: "medium", estimatedTime: "15 min/day" },
        { title: "Monitor progress", description: "Weekly weigh-ins and measurements", priority: "medium", estimatedTime: "10 minutes" },
        { title: "Adjust routine", description: "Modify based on progress", priority: "low", estimatedTime: "30 minutes" }
      ],
      'default': [
        { title: "Initial planning", description: "Define scope and requirements", priority: "high", estimatedTime: "2 hours" },
        { title: "Resource gathering", description: "Collect necessary materials", priority: "high", estimatedTime: "1 hour" },
        { title: "Implementation", description: "Execute the main work", priority: "high", estimatedTime: "10+ hours" },
        { title: "Review and adjust", description: "Evaluate and optimize", priority: "medium", estimatedTime: "1 hour" }
      ]
    };

    return actions[category] || actions['default'];
  }

  private generateHabits(category: string): Array<{name: string, target: number}> {
    const habits: Record<string, Array<{name: string, target: number}>> = {
      'fitness': [
        { name: "Daily workout", target: 5 },
        { name: "Steps walked", target: 10000 },
        { name: "Water intake", target: 8 }
      ],
      'education': [
        { name: "Study time", target: 2 },
        { name: "Practice problems", target: 10 },
        { name: "Reading", target: 1 }
      ],
      'default': [
        { name: "Goal review", target: 1 },
        { name: "Planning time", target: 30 },
        { name: "Progress update", target: 1 }
      ]
    };

    return habits[category] || habits['default'];
  }

  private generateSkills(category: string): Array<{name: string, startLevel: number, targetLevel: number, category: string}> {
    const skills: Record<string, Array<{name: string, startLevel: number, targetLevel: number, category: string}>> = {
      'education': [
        { name: "JavaScript", startLevel: 4, targetLevel: 8, category: "Programming" },
        { name: "React", startLevel: 3, targetLevel: 7, category: "Frontend" },
        { name: "Node.js", startLevel: 2, targetLevel: 6, category: "Backend" }
      ],
      'language': [
        { name: "Speaking", startLevel: 3, targetLevel: 8, category: "Oral" },
        { name: "Listening", startLevel: 4, targetLevel: 8, category: "Comprehension" },
        { name: "Writing", startLevel: 2, targetLevel: 7, category: "Written" }
      ],
      'default': [
        { name: "Core Skill", startLevel: 3, targetLevel: 7, category: "Primary" },
        { name: "Supporting Skill", startLevel: 4, targetLevel: 6, category: "Secondary" }
      ]
    };

    return skills[category] || skills['default'];
  }

  private generateMilestones(category: string): Array<{title: string, description: string, category: string}> {
    const milestones: Record<string, Array<{title: string, description: string, category: string}>> = {
      'fitness': [
        { title: "Initial Assessment", description: "Baseline fitness measurements", category: "Assessment" },
        { title: "First Month Complete", description: "Consistency established", category: "Habit" },
        { title: "Strength Gains", description: "Noticeable improvement in performance", category: "Progress" },
        { title: "Goal Achievement", description: "Target fitness level reached", category: "Completion" }
      ],
      'savings': [
        { title: "Budget Established", description: "Monthly savings plan created", category: "Planning" },
        { title: "First Quarter Saved", description: "25% of goal amount saved", category: "Progress" },
        { title: "Halfway Point", description: "50% of goal amount saved", category: "Progress" },
        { title: "Goal Achieved", description: "Full savings target reached", category: "Completion" }
      ],
      'default': [
        { title: "Planning Complete", description: "Initial setup and planning finished", category: "Planning" },
        { title: "First Phase Done", description: "Initial implementation completed", category: "Progress" },
        { title: "Midpoint Review", description: "Progress evaluation and adjustments", category: "Review" },
        { title: "Final Achievement", description: "Goal successfully completed", category: "Completion" }
      ]
    };

    return milestones[category] || milestones['default'];
  }

  private generateProjectPhases(category: string): Array<{name: string, description: string}> {
    const phases: Record<string, Array<{name: string, description: string}>> = {
      'business': [
        { name: "Market Research", description: "Analyze target market and competition" },
        { name: "Business Planning", description: "Develop business model and strategy" },
        { name: "Product Development", description: "Build minimum viable product" },
        { name: "Launch & Marketing", description: "Go to market and acquire customers" },
        { name: "Growth & Scale", description: "Optimize operations and expand" }
      ],
      'education': [
        { name: "Foundation Learning", description: "Master basic concepts and principles" },
        { name: "Practical Application", description: "Apply knowledge through projects" },
        { name: "Advanced Topics", description: "Explore complex subject areas" },
        { name: "Certification Prep", description: "Prepare for final assessment" }
      ],
      'default': [
        { name: "Preparation", description: "Gather resources and plan approach" },
        { name: "Implementation", description: "Execute main work and activities" },
        { name: "Optimization", description: "Refine and improve results" },
        { name: "Completion", description: "Final review and goal achievement" }
      ]
    };

    return phases[category] || phases['default'];
  }

  private generateResources(category: string): Array<{title: string, type: string, url: string, category: string}> {
    const resources: Record<string, Array<{title: string, type: string, url: string, category: string}>> = {
      'education': [
        { title: "JavaScript Fundamentals Course", type: "Course", url: "#", category: "Programming" },
        { title: "React Documentation", type: "Article", url: "#", category: "Framework" },
        { title: "Clean Code Book", type: "Book", url: "#", category: "Best Practices" },
        { title: "Coding Interview Prep", type: "Video", url: "#", category: "Career" }
      ],
      'fitness': [
        { title: "Beginner Workout Guide", type: "Article", url: "#", category: "Training" },
        { title: "Nutrition Basics", type: "Video", url: "#", category: "Diet" },
        { title: "Fitness Tracking App", type: "Tool", url: "#", category: "Tracking" },
        { title: "Meal Planning Guide", type: "Book", url: "#", category: "Nutrition" }
      ],
      'default': [
        { title: "Getting Started Guide", type: "Article", url: "#", category: "Basics" },
        { title: "Best Practices Video", type: "Video", url: "#", category: "Tips" },
        { title: "Reference Manual", type: "Book", url: "#", category: "Reference" },
        { title: "Progress Tracker", type: "Tool", url: "#", category: "Tools" }
      ]
    };

    return resources[category] || resources['default'];
  }

  private generateDocuments(category: string): Array<{name: string, required: boolean, dueDate: string, category: string, description: string}> {
    const documents: Record<string, Array<{name: string, required: boolean, dueDate: string, category: string, description: string}>> = {
      'immigration': [
        { name: "Passport", required: true, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "Identity", description: "Valid passport with 6+ months validity" },
        { name: "Birth Certificate", required: true, dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "Identity", description: "Official birth certificate copy" },
        { name: "Police Clearance", required: true, dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "Background", description: "Criminal background check" },
        { name: "Medical Exam", required: true, dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "Health", description: "Immigration medical examination" }
      ],
      'travel': [
        { name: "Travel Insurance", required: true, dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "Insurance", description: "Comprehensive travel coverage" },
        { name: "Visa Application", required: true, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "Documentation", description: "Tourist/visitor visa" },
        { name: "Hotel Bookings", required: false, dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "Accommodation", description: "Confirmed hotel reservations" }
      ],
      'default': [
        { name: "Initial Documentation", required: true, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "Setup", description: "Basic required documents" },
        { name: "Supporting Materials", required: false, dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "Optional", description: "Additional helpful documents" }
      ]
    };

    return documents[category] || documents['default'];
  }
}

export const componentDataGenerator = new ComponentDataGenerator();