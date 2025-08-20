const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleGoals() {
  try {
    console.log('🎯 Creating sample goals for dashboard testing...');

    // First, get the user (assuming there's at least one user)
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error('❌ No user found. Please login first to create goals.');
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);

    // Sample goals for different categories
    const sampleGoals = [
      // Learning Goal - Spanish Language
      {
        title: 'Learn Spanish Fluently',
        description: 'Become conversationally fluent in Spanish within 6 months through structured learning, practice, and immersion.',
        category: 'language',
        priority: 'high',
        status: 'in_progress',
        estimatedCost: 500,
        currentSaved: 150,
        targetDate: new Date('2025-07-20'),
        feasibilityScore: 85,
        smartGoalData: JSON.stringify({
          specificGoal: 'Achieve B2 level Spanish fluency',
          measurable: 'Complete 3 courses, practice 30min daily, pass DELE B2 exam',
          achievable: 'Based on 6 months timeline with daily practice',
          relevant: 'For career advancement and travel',
          timeBound: '6 months from start date',
          goalDashboard: {
            skills: [
              { name: 'Speaking', level: 6, maxLevel: 10 },
              { name: 'Listening', level: 7, maxLevel: 10 },
              { name: 'Reading', level: 8, maxLevel: 10 },
              { name: 'Writing', level: 5, maxLevel: 10 },
              { name: 'Grammar', level: 7, maxLevel: 10 },
              { name: 'Vocabulary', level: 8, maxLevel: 10 }
            ],
            courses: [
              { name: 'Spanish Fundamentals', progress: 75, totalLessons: 20, completedLessons: 15 },
              { name: 'Conversational Spanish', progress: 40, totalLessons: 15, completedLessons: 6 },
              { name: 'Spanish Culture', progress: 20, totalLessons: 10, completedLessons: 2 }
            ],
            studyTime: 180 // minutes this week
          }
        }),
        assignedAgents: JSON.stringify(['learning', 'research'])
      },

      // Health Goal - Weight Loss
      {
        title: 'Lose 15 Pounds & Get Fit',
        description: 'Lose 15 pounds through healthy eating, regular exercise, and lifestyle changes while building sustainable habits.',
        category: 'weight_loss',
        priority: 'high',
        status: 'in_progress',
        estimatedCost: 800,
        currentSaved: 200,
        targetDate: new Date('2025-05-20'),
        feasibilityScore: 90,
        smartGoalData: JSON.stringify({
          specificGoal: 'Lose 15 pounds and improve fitness',
          measurable: 'Track weight weekly, exercise 5x/week, log meals daily',
          achievable: 'Realistic 1-2 lbs per week weight loss',
          relevant: 'For better health and confidence',
          timeBound: '4 months timeline',
          goalDashboard: {
            currentWeight: 165,
            targetWeight: 150,
            workoutsThisWeek: 4,
            caloriesBurned: 1850,
            sleepAverage: 7.2,
            healthGoals: [
              { name: 'Weight Loss', current: 165, target: 150, progress: 50 },
              { name: 'Muscle Gain', current: 145, target: 155, progress: 75 },
              { name: 'Daily Steps', current: 8500, target: 10000, progress: 85 },
              { name: 'Sleep Quality', current: 7.5, target: 8, progress: 94 }
            ]
          }
        }),
        assignedAgents: JSON.stringify(['health', 'research'])
      },

      // Business Goal - SaaS Launch
      {
        title: 'Launch SaaS Product & Reach $10K MRR',
        description: 'Build, launch, and scale a SaaS product to $10,000 monthly recurring revenue within 12 months.',
        category: 'business',
        priority: 'high',
        status: 'in_progress',
        estimatedCost: 15000,
        currentSaved: 8000,
        targetDate: new Date('2025-12-31'),
        feasibilityScore: 75,
        smartGoalData: JSON.stringify({
          specificGoal: 'Launch SaaS and reach $10K MRR',
          measurable: 'Track revenue, customers, conversion rates, feature releases',
          achievable: 'Based on market research and MVP validation',
          relevant: 'For financial independence and business growth',
          timeBound: '12 months to reach MRR target',
          goalDashboard: {
            monthlyRevenue: 4500,
            targetRevenue: 10000,
            totalCustomers: 142,
            targetCustomers: 200,
            conversionRate: 3.4,
            profitMargin: 22,
            businessGoals: [
              { name: 'Monthly Revenue', current: 4500, target: 10000, progress: 45 },
              { name: 'Customer Acquisition', current: 142, target: 200, progress: 71 },
              { name: 'Product Features', current: 75, target: 100, progress: 75 },
              { name: 'Market Share', current: 2, target: 5, progress: 40 }
            ]
          }
        }),
        assignedAgents: JSON.stringify(['business', 'research', 'financial'])
      },

      // Travel Goal
      {
        title: 'Epic 2-Week Japan Adventure',
        description: 'Plan and execute a comprehensive 2-week trip to Japan covering Tokyo, Kyoto, and Osaka with cultural experiences.',
        category: 'travel',
        priority: 'medium',
        status: 'planning',
        estimatedCost: 6500,
        currentSaved: 2800,
        targetDate: new Date('2025-10-15'),
        feasibilityScore: 88,
        smartGoalData: JSON.stringify({
          specificGoal: '14-day Japan cultural immersion trip',
          measurable: 'Visit 3 cities, experience 10 cultural activities, stay within budget',
          achievable: 'Based on current savings rate and timeline',
          relevant: 'For cultural enrichment and personal growth',
          timeBound: 'October 2025 departure',
          goalDashboard: {
            destinations: ['Tokyo', 'Kyoto', 'Osaka'],
            duration: 14,
            travelers: 2,
            budgetProgress: 43,
            bookingProgress: 25
          }
        }),
        assignedAgents: JSON.stringify(['travel', 'weather', 'financial'])
      },

      // Career Goal
      {
        title: 'Get Senior Software Engineer Role',
        description: 'Advance to Senior Software Engineer position at a top tech company with 25% salary increase within 8 months.',
        category: 'career',
        priority: 'high',
        status: 'in_progress',
        estimatedCost: 1200,
        currentSaved: 400,
        targetDate: new Date('2025-09-01'),
        feasibilityScore: 82,
        smartGoalData: JSON.stringify({
          specificGoal: 'Promotion to Senior Software Engineer',
          measurable: 'Complete 3 certifications, lead 2 projects, get 25% raise',
          achievable: 'Based on performance and market demand',
          relevant: 'For career growth and financial advancement',
          timeBound: '8 months timeline',
          goalDashboard: {
            skillsProgress: 75,
            networkingProgress: 60,
            applicationsSent: 12,
            interviewsScheduled: 4,
            certifications: 2
          }
        }),
        assignedAgents: JSON.stringify(['research', 'learning'])
      },

      // Fitness Goal
      {
        title: 'Complete First Marathon',
        description: 'Train for and successfully complete a full 26.2 mile marathon within 6 months while staying injury-free.',
        category: 'fitness',
        priority: 'medium',
        status: 'planning',
        estimatedCost: 800,
        currentSaved: 0,
        targetDate: new Date('2025-08-15'),
        feasibilityScore: 78,
        smartGoalData: JSON.stringify({
          specificGoal: 'Complete full marathon under 4 hours',
          measurable: 'Train 5x/week, track mileage, monitor pace improvement',
          achievable: 'Based on current fitness level and training plan',
          relevant: 'For personal achievement and fitness milestone',
          timeBound: '6-month training program',
          goalDashboard: {
            weeklyMiles: 25,
            targetWeeklyMiles: 40,
            longestRun: 10,
            targetLongestRun: 26.2,
            trainingWeeks: 8,
            totalTrainingWeeks: 24
          }
        }),
        assignedAgents: JSON.stringify(['health'])
      }
    ];

    // Create the goals
    let createdCount = 0;
    for (const goalData of sampleGoals) {
      try {
        const existingGoal = await prisma.goal.findFirst({
          where: {
            userId: user.id,
            title: goalData.title
          }
        });

        if (existingGoal) {
          console.log(`⚠️  Goal "${goalData.title}" already exists, skipping...`);
          continue;
        }

        const goal = await prisma.goal.create({
          data: {
            userId: user.id,
            ...goalData
          }
        });

        console.log(`✅ Created: "${goal.title}" (${goal.category})`);
        createdCount++;

        // Add some sample steps for each goal
        const sampleSteps = [
          { title: 'Research and Planning', stepOrder: 1, completed: true },
          { title: 'Set Up Resources', stepOrder: 2, completed: true },
          { title: 'Begin Implementation', stepOrder: 3, completed: false },
          { title: 'Mid-point Review', stepOrder: 4, completed: false },
          { title: 'Final Push', stepOrder: 5, completed: false }
        ];

        for (const stepData of sampleSteps) {
          await prisma.goalStep.create({
            data: {
              goalId: goal.id,
              ...stepData
            }
          });
        }

      } catch (error) {
        console.error(`❌ Error creating goal "${goalData.title}":`, error.message);
      }
    }

    console.log(`\n🎉 Successfully created ${createdCount} sample goals!`);
    console.log('\n📊 Goal Categories Created:');
    console.log('   • Learning Dashboard - "Learn Spanish Fluently"');
    console.log('   • Health Dashboard - "Lose 15 Pounds & Get Fit"');
    console.log('   • Business Dashboard - "Launch SaaS Product & Reach $10K MRR"');
    console.log('   • Travel Dashboard - "Epic 2-Week Japan Adventure"');
    console.log('   • Career/Business Dashboard - "Get Senior Software Engineer Role"');
    console.log('   • Health Dashboard - "Complete First Marathon"');
    
    console.log('\n🚀 Now you can:');
    console.log('   1. Refresh your browser at http://localhost:5174');
    console.log('   2. Click on any goal card to see its individual dashboard');
    console.log('   3. Explore all the beautiful domain-specific components!');

  } catch (error) {
    console.error('❌ Error creating sample goals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSampleGoals();