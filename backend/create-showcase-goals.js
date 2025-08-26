const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createShowcaseGoals() {
  try {
    console.log('🎯 Creating showcase goals for new dashboard components...');

    // First, get the user (assuming there's at least one user)
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error('❌ No user found. Please login first to create goals.');
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);

    // Sample goals designed to showcase new components
    const showcaseGoals = [
      // Investment Goal - showcases InvestmentTracker
      {
        title: 'Build $100K Investment Portfolio',
        description: 'Create a diversified investment portfolio worth $100,000 through systematic investing in stocks, bonds, and ETFs.',
        category: 'investment',
        priority: 'high',
        status: 'in_progress',
        estimatedCost: 100000,
        currentSaved: 35000,
        targetDate: new Date('2026-12-31'),
        feasibilityScore: 88,
        smartGoalData: JSON.stringify({
          specificGoal: 'Build diversified $100K investment portfolio',
          measurable: 'Invest $2000/month, achieve 8% annual return, track performance quarterly',
          achievable: 'Based on current income and savings rate',
          relevant: 'For long-term financial security and retirement planning',
          timeBound: '2-year timeline with monthly contributions',
          goalDashboard: {
            portfolioValue: 35000,
            targetValue: 100000,
            monthlyContribution: 2000,
            totalReturn: 12.5, // percentage
            ytdReturn: 8.3,
            riskLevel: 'moderate'
          }
        }),
        assignedAgents: JSON.stringify(['financial', 'research'])
      },

      // Reading Goal - showcases ReadingTracker
      {
        title: 'Read 52 Books This Year',
        description: 'Read one book per week across various genres including fiction, non-fiction, business, and self-development.',
        category: 'reading',
        priority: 'medium',
        status: 'in_progress',
        estimatedCost: 800,
        currentSaved: 200,
        targetDate: new Date('2025-12-31'),
        feasibilityScore: 85,
        smartGoalData: JSON.stringify({
          specificGoal: 'Read 52 books in one year',
          measurable: 'Track pages read, reading time, book genres, and reviews',
          achievable: 'Based on 1 hour daily reading commitment',
          relevant: 'For personal growth, knowledge expansion, and mental stimulation',
          timeBound: 'One year challenge with weekly milestones',
          goalDashboard: {
            booksRead: 15,
            targetBooks: 52,
            pagesRead: 4800,
            targetPages: 16000,
            averageRating: 4.2,
            readingStreak: 28 // days
          }
        }),
        assignedAgents: JSON.stringify(['learning', 'research'])
      },

      // Skill Development Goal - showcases SkillAssessment + ResourceLibrary
      {
        title: 'Master Full-Stack Development',
        description: 'Become proficient in modern full-stack development including React, Node.js, databases, and cloud deployment.',
        category: 'skill_development',
        priority: 'high',
        status: 'in_progress',
        estimatedCost: 1500,
        currentSaved: 600,
        targetDate: new Date('2025-12-01'),
        feasibilityScore: 90,
        smartGoalData: JSON.stringify({
          specificGoal: 'Achieve advanced full-stack developer skills',
          measurable: 'Complete 5 projects, pass 3 certifications, contribute to open source',
          achievable: 'Based on current programming experience and learning schedule',
          relevant: 'For career advancement and freelance opportunities',
          timeBound: '10 months intensive learning program',
          goalDashboard: {
            skillsCompleted: 12,
            totalSkills: 20,
            projectsBuilt: 3,
            targetProjects: 5,
            certifications: 1,
            targetCertifications: 3
          }
        }),
        assignedAgents: JSON.stringify(['learning', 'research'])
      },

      // Advanced Career Goal - showcases CareerDashboard
      {
        title: 'Become Engineering Manager',
        description: 'Transition from Senior Engineer to Engineering Manager role with team leadership experience and management training.',
        category: 'career',
        priority: 'high',
        status: 'in_progress',
        estimatedCost: 2500,
        currentSaved: 1000,
        targetDate: new Date('2026-03-01'),
        feasibilityScore: 78,
        smartGoalData: JSON.stringify({
          specificGoal: 'Secure Engineering Manager position',
          measurable: 'Lead 2 projects, complete management course, mentor 3 juniors, network with 20 managers',
          achievable: 'Based on current senior role and leadership interest',
          relevant: 'For career progression and increased impact',
          timeBound: '18-month development and transition plan',
          goalDashboard: {
            managementTraining: 65, // percentage complete
            leadershipProjects: 1,
            targetProjects: 2,
            teamMembersManaged: 2,
            networkingConnections: 12,
            targetConnections: 20
          }
        }),
        assignedAgents: JSON.stringify(['learning', 'research'])
      },

      // Fitness + Nutrition Goal - showcases WorkoutTracker
      {
        title: 'Transform Body Composition',
        description: 'Build muscle, reduce body fat to 12%, and establish sustainable fitness routine with strength training and cardio.',
        category: 'fitness',
        priority: 'high',
        status: 'in_progress',
        estimatedCost: 1200,
        currentSaved: 400,
        targetDate: new Date('2025-10-01'),
        feasibilityScore: 85,
        smartGoalData: JSON.stringify({
          specificGoal: 'Achieve 12% body fat and gain 10lbs muscle',
          measurable: 'Track workouts, weight, body fat %, strength gains, nutrition',
          achievable: 'Based on consistent 5x/week training schedule',
          relevant: 'For health, confidence, and athletic performance',
          timeBound: '8-month body transformation program',
          goalDashboard: {
            currentBodyFat: 18,
            targetBodyFat: 12,
            muscleGain: 4, // pounds
            targetMuscleGain: 10,
            workoutsThisMonth: 18,
            targetWorkouts: 20
          }
        }),
        assignedAgents: JSON.stringify(['health'])
      },

      // Travel Documentation Goal - showcases DocumentChecklist + WeatherWidget
      {
        title: 'Southeast Asia Backpacking Adventure',
        description: 'Plan 3-month backpacking trip through Thailand, Vietnam, Cambodia, and Laos with all documentation and logistics.',
        category: 'travel',
        priority: 'medium',
        status: 'planning',
        estimatedCost: 8000,
        currentSaved: 3200,
        targetDate: new Date('2025-11-01'),
        feasibilityScore: 82,
        smartGoalData: JSON.stringify({
          specificGoal: '3-month Southeast Asia backpacking trip',
          measurable: 'Visit 4 countries, stay within budget, complete all documentation',
          achievable: 'Based on savings timeline and travel research',
          relevant: 'For cultural immersion and personal growth',
          timeBound: 'November 2025 departure with 9-month preparation',
          goalDashboard: {
            countriesPlanned: 4,
            documentsCompleted: 3,
            totalDocuments: 12,
            budgetSaved: 40, // percentage
            accommodationsBooked: 2
          }
        }),
        assignedAgents: JSON.stringify(['travel', 'weather', 'research'])
      },

      // Immigration/Legal Goal - showcases DocumentChecklist
      {
        title: 'Obtain Canadian Permanent Residency',
        description: 'Complete Express Entry application for Canadian PR including language tests, credential assessment, and documentation.',
        category: 'immigration',
        priority: 'high',
        status: 'in_progress',
        estimatedCost: 3500,
        currentSaved: 1500,
        targetDate: new Date('2025-08-15'),
        feasibilityScore: 75,
        smartGoalData: JSON.stringify({
          specificGoal: 'Secure Canadian Permanent Residency',
          measurable: 'Complete IELTS, ECA, medical exam, police clearance, submit application',
          achievable: 'Based on current qualifications and CRS score',
          relevant: 'For long-term career and life opportunities',
          timeBound: '6-month application completion timeline',
          goalDashboard: {
            documentsCompleted: 5,
            totalDocuments: 15,
            languageTestScore: 8.5,
            crsScore: 485,
            applicationStage: 'document_collection'
          }
        }),
        assignedAgents: JSON.stringify(['research', 'legal'])
      },

      // Business Launch Goal - showcases multiple components
      {
        title: 'Launch E-commerce Store',
        description: 'Create and launch profitable e-commerce store selling eco-friendly products with $50K first-year revenue target.',
        category: 'business',
        priority: 'high',
        status: 'planning',
        estimatedCost: 25000,
        currentSaved: 8000,
        targetDate: new Date('2025-06-01'),
        feasibilityScore: 72,
        smartGoalData: JSON.stringify({
          specificGoal: 'Launch e-commerce store with $50K revenue',
          measurable: 'Build website, source products, achieve 100 orders/month, $4K MRR',
          achievable: 'Based on market research and business plan',
          relevant: 'For financial independence and environmental impact',
          timeBound: '4-month launch with 12-month revenue goal',
          goalDashboard: {
            websiteProgress: 25,
            productsSourced: 8,
            targetProducts: 30,
            marketingCampaigns: 0,
            targetCampaigns: 5
          }
        }),
        assignedAgents: JSON.stringify(['business', 'research', 'financial'])
      }
    ];

    // Create the goals
    let createdCount = 0;
    for (const goalData of showcaseGoals) {
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
          { title: 'Initial Research & Planning', stepOrder: 1, completed: true },
          { title: 'Gather Resources & Materials', stepOrder: 2, completed: true },
          { title: 'Begin Active Implementation', stepOrder: 3, completed: Math.random() > 0.5 },
          { title: 'Mid-point Assessment & Adjustment', stepOrder: 4, completed: false },
          { title: 'Final Execution & Completion', stepOrder: 5, completed: false }
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

    console.log(`\n🎉 Successfully created ${createdCount} showcase goals!`);
    console.log('\n🚀 NEW COMPONENTS SHOWCASED:');
    console.log('   📈 InvestmentTracker - "Build $100K Investment Portfolio"');
    console.log('   📚 ReadingTracker - "Read 52 Books This Year"');
    console.log('   🎯 SkillAssessment + ResourceLibrary - "Master Full-Stack Development"');
    console.log('   💼 CareerDashboard - "Become Engineering Manager"');
    console.log('   💪 WorkoutTracker - "Transform Body Composition"');
    console.log('   📋 DocumentChecklist + WeatherWidget - "Southeast Asia Backpacking"');
    console.log('   🗂️  DocumentChecklist - "Obtain Canadian Permanent Residency"');
    console.log('   🏪 Multiple Components - "Launch E-commerce Store"');
    
    console.log('\n🌟 Now you can:');
    console.log('   1. Refresh your browser at http://localhost:5174');
    console.log('   2. Click on any new goal card to see the beautiful new components!');
    console.log('   3. Each goal showcases different component combinations');
    console.log('   4. All components use comprehensive mock data for realistic demos');

  } catch (error) {
    console.error('❌ Error creating showcase goals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createShowcaseGoals();