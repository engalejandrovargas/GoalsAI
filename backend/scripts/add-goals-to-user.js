#!/usr/bin/env node

/**
 * Add Sample Goals to Specific User Script
 * 
 * This script adds sample goals to your specific user account.
 * 
 * Usage: node scripts/add-goals-to-user.js <userId>
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(__dirname, '../prisma/dev.db')}`
    }
  }
});

// Goal categories and their sample data
const GOAL_CATEGORIES = {
  savings: {
    title: "Build Emergency Fund",
    description: "Save $10,000 for unexpected expenses and financial security",
    estimatedCost: 10000,
    category: "savings",
    priority: "high",
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    currentSaved: 2500,
    assignedAgents: ["financial"],
    smartGoalData: JSON.stringify({
      specific: "Save $10,000 in a high-yield savings account",
      measurable: "Track progress monthly, currently at $2,500",
      achievable: "Save $1,250 per month based on budget analysis",
      relevant: "Essential for financial stability and peace of mind",
      timeBound: "Complete within 6 months"
    })
  },

  investment: {
    title: "Build Investment Portfolio",
    description: "Create a diversified $50,000 investment portfolio for long-term wealth building",
    estimatedCost: 50000,
    category: "investment", 
    priority: "high",
    targetDate: new Date(Date.now() + 1825 * 24 * 60 * 60 * 1000), // 5 years
    currentSaved: 15000,
    assignedAgents: ["financial", "research"],
    smartGoalData: JSON.stringify({
      specific: "Build a diversified portfolio with 60% stocks, 30% bonds, 10% REITs",
      measurable: "Invest $500 monthly to reach $50,000 target",
      achievable: "Allocate surplus income after emergency fund completion",
      relevant: "Critical for retirement planning and financial independence",
      timeBound: "Achieve target within 5 years"
    })
  },

  debt_payoff: {
    title: "Eliminate Credit Card Debt",
    description: "Pay off $15,000 in credit card debt using the avalanche method",
    estimatedCost: 15000,
    category: "debt_payoff",
    priority: "high",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 3000,
    assignedAgents: ["financial"],
    smartGoalData: JSON.stringify({
      specific: "Pay off all credit card balances totaling $15,000",
      measurable: "Pay minimum on all cards + $800 extra on highest APR card",
      achievable: "Restructured budget allows for $1,200 monthly payments",
      relevant: "Eliminate high-interest debt to improve financial health",
      timeBound: "Debt-free within 12 months"
    })
  },

  language: {
    title: "Learn Spanish Fluently",
    description: "Achieve conversational fluency in Spanish for career and travel opportunities",
    estimatedCost: 800,
    category: "language",
    priority: "medium",
    targetDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years
    currentSaved: 200,
    assignedAgents: ["learning", "research"],
    smartGoalData: JSON.stringify({
      specific: "Reach B2 (upper-intermediate) Spanish proficiency",
      measurable: "Complete 30 minutes daily study + weekly conversation practice",
      achievable: "Use apps, online tutoring, and local Spanish meetups",
      relevant: "Enhances career prospects and enables meaningful travel",
      timeBound: "Take DELE B2 exam in 24 months"
    })
  },

  education: {
    title: "Complete Data Science Certification",
    description: "Earn Google Data Analytics Professional Certificate to transition into tech",
    estimatedCost: 2500,
    category: "education",
    priority: "high",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 500,
    assignedAgents: ["learning", "research"],
    smartGoalData: JSON.stringify({
      specific: "Complete Google Data Analytics Professional Certificate on Coursera",
      measurable: "Finish 8 courses, complete capstone project, earn certificate",
      achievable: "Study 10 hours per week while working full-time",
      relevant: "Enables career transition to higher-paying tech role",
      timeBound: "Complete certification within 12 months"
    })
  },

  skill_development: {
    title: "Master Advanced React & Next.js",
    description: "Become expert in React ecosystem to advance my frontend development career",
    estimatedCost: 600,
    category: "skill_development",
    priority: "high",
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    currentSaved: 100,
    assignedAgents: ["learning", "research"],
    smartGoalData: JSON.stringify({
      specific: "Master React hooks, Next.js 13+, TypeScript, and advanced state management",
      measurable: "Build 5 advanced projects, contribute to 2 open source repos",
      achievable: "Dedicate 1.5 hours daily to coding and tutorials",
      relevant: "Advanced React skills are in high demand and will increase salary significantly",
      timeBound: "Portfolio ready for senior developer applications in 6 months"
    })
  },

  weight_loss: {
    title: "Lose 25 Pounds Sustainably",
    description: "Achieve a healthy weight through sustainable diet and exercise habits",
    estimatedCost: 1200,
    category: "weight_loss",
    priority: "high",
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    currentSaved: 300,
    assignedAgents: ["health", "research"],
    smartGoalData: JSON.stringify({
      specific: "Lose 25 pounds through caloric deficit and strength training",
      measurable: "Lose 1-1.5 pounds per week, track daily weight and food intake",
      achievable: "Create 400-500 calorie deficit through diet and exercise",
      relevant: "Improve health, energy, and confidence",
      timeBound: "Reach target weight in 6 months"
    })
  },

  fitness: {
    title: "Run a Half Marathon",
    description: "Train for and complete a half marathon to improve cardiovascular fitness",
    estimatedCost: 400,
    category: "fitness",
    priority: "medium",
    targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months
    currentSaved: 150,
    assignedAgents: ["health"],
    smartGoalData: JSON.stringify({
      specific: "Complete a half marathon (13.1 miles) in under 2 hours 15 minutes",
      measurable: "Follow structured 16-week training program, track runs with GPS",
      achievable: "Currently can run 3 miles, gradual mileage increase planned",
      relevant: "Builds endurance, improves health, and personal achievement",
      timeBound: "Register for local half marathon in 4 months"
    })
  },

  wellness: {
    title: "Establish Comprehensive Wellness Routine",
    description: "Build holistic wellness habits including meditation, sleep, and stress management",
    estimatedCost: 250,
    category: "wellness",
    priority: "medium",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 50,
    assignedAgents: ["health", "research"],
    smartGoalData: JSON.stringify({
      specific: "Meditate 15 min daily, sleep 7-8 hours, practice stress reduction techniques",
      measurable: "Track daily with wellness app, aim for 90% consistency",
      achievable: "Start with 5 minutes meditation, gradually build habits",
      relevant: "Reduces stress, improves focus, enhances overall life quality",
      timeBound: "Maintain consistent wellness routine for full year"
    })
  },

  travel: {
    title: "Epic Japan Adventure",
    description: "Plan and fund a 3-week comprehensive Japan travel experience",
    estimatedCost: 5500,
    category: "travel",
    priority: "medium",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 1200,
    assignedAgents: ["travel", "financial", "weather"],
    smartGoalData: JSON.stringify({
      specific: "Visit Tokyo, Kyoto, Osaka, and Mount Fuji in 21 days",
      measurable: "Save $358 monthly, research and book accommodations 6 months ahead",
      achievable: "Use combination of hotels, ryokans, and efficient transportation",
      relevant: "Experience unique culture, cuisine, and fulfil lifelong dream",
      timeBound: "Depart for Japan in 12 months during cherry blossom season"
    })
  },

  career: {
    title: "Advance to Tech Lead Position",
    description: "Secure promotion to technical leadership role with increased responsibility and salary",
    estimatedCost: 1500,
    category: "career",
    priority: "high",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 400,
    assignedAgents: ["research", "learning"],
    smartGoalData: JSON.stringify({
      specific: "Secure Tech Lead position with team leadership and architecture responsibilities",
      measurable: "Complete leadership course, lead 3 major projects, mentor junior developers",
      achievable: "Strong technical skills, management interest, supportive current team",
      relevant: "Increases salary by $30K+ and advances career trajectory significantly",
      timeBound: "Promotion effective within next performance review cycle"
    })
  },

  business: {
    title: "Launch SaaS Product",
    description: "Build and launch a profitable SaaS application for small businesses",
    estimatedCost: 8000,
    category: "business",
    priority: "high",
    targetDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years
    currentSaved: 2000,
    assignedAgents: ["research", "financial", "business"],
    smartGoalData: JSON.stringify({
      specific: "Launch SaaS product for project management with $10K MRR target",
      measurable: "Acquire 100 paying customers, reach $10K monthly recurring revenue",
      achievable: "Leverage existing technical skills and identified market need",
      relevant: "Creates significant passive income stream and potential full-time business",
      timeBound: "Achieve $10K MRR within 24 months of launch"
    })
  },

  habits: {
    title: "Read 50 Books This Year",
    description: "Develop consistent reading habit across multiple genres for personal growth",
    estimatedCost: 500,
    category: "habits",
    priority: "medium",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 100,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Read 50 books: 20 technical, 15 business, 10 fiction, 5 biographies",
      measurable: "Read 1 book per week, track progress with Goodreads",
      achievable: "Read 45 minutes daily during commute and before bed",
      relevant: "Expands knowledge, improves focus, enhances professional skills",
      timeBound: "Complete 50 books by December 31st"
    })
  },

  creative: {
    title: "Build Technical Blog & YouTube Channel",
    description: "Create content platform to share programming knowledge and build personal brand",
    estimatedCost: 2000,
    category: "creative",
    priority: "medium",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 300,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Publish 50 blog posts and 25 YouTube videos on React/JavaScript topics",
      measurable: "1 blog post per week, 1 video every 2 weeks, reach 10K subscribers",
      achievable: "Leverage existing technical expertise, dedicate 5 hours weekly",
      relevant: "Builds personal brand, potential income source, helps other developers",
      timeBound: "Reach 10K YouTube subscribers and 50K blog views within 12 months"
    })
  },

  reading: {
    title: "Master Software Architecture Library",
    description: "Read definitive books on software architecture and system design",
    estimatedCost: 400,
    category: "reading",
    priority: "high",
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    currentSaved: 80,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Read 12 essential software architecture books including Clean Architecture, DDD",
      measurable: "Complete 2 books per month with detailed notes and implementation examples",
      achievable: "Already have strong technical foundation, allocate focused study time",
      relevant: "Critical for advancing to senior/architect roles and better system design",
      timeBound: "Complete architecture library within 6 months"
    })
  },

  immigration: {
    title: "Obtain Permanent Residency",
    description: "Complete the immigration process to obtain permanent residency status",
    estimatedCost: 8000,
    category: "immigration",
    priority: "high",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 3000,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Submit complete permanent residency application with all required documents",
      measurable: "Track application milestones and document completion progress",
      achievable: "Meet all eligibility requirements with proper legal guidance",
      relevant: "Essential for long-term career stability and family security",
      timeBound: "Complete application process within 12 months"
    })
  },

  relationships: {
    title: "Strengthen Family Relationships",
    description: "Improve communication and quality time with family members",
    estimatedCost: 500,
    category: "relationships",
    priority: "high",
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    currentSaved: 150,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Have weekly quality conversations with family and plan monthly activities",
      measurable: "Track weekly family time and relationship satisfaction surveys",
      achievable: "Schedule dedicated time blocks and improve active listening skills",
      relevant: "Strong family bonds contribute to overall happiness and well-being",
      timeBound: "Establish consistent patterns within 6 months"
    })
  },

  general: {
    title: "Organize Digital Life",
    description: "Declutter and organize digital files, photos, and online accounts",
    estimatedCost: 200,
    category: "general",
    priority: "medium",
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
    currentSaved: 50,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Organize 10,000+ photos, clean up cloud storage, and secure all accounts",
      measurable: "Process 500 photos per week and organize 5 account categories monthly",
      achievable: "Dedicate 2 hours per weekend to digital organization tasks",
      relevant: "Improved productivity and reduced digital stress",
      timeBound: "Complete digital organization within 3 months"
    })
  }
};

async function createGoalForUser(categoryId, goalData, userId) {
  console.log(`🎯 Creating ${categoryId} goal: ${goalData.title}`);
  
  const goal = await prisma.goal.create({
    data: {
      userId: userId,
      title: goalData.title,
      description: goalData.description,
      category: goalData.category,
      priority: goalData.priority,
      status: 'in_progress',
      estimatedCost: goalData.estimatedCost,
      currentSaved: goalData.currentSaved,
      targetDate: goalData.targetDate,
      assignedAgents: JSON.stringify(goalData.assignedAgents),
      smartGoalData: goalData.smartGoalData,
      feasibilityScore: Math.floor(Math.random() * 30) + 70, // Random score 70-100
      feasibilityAnalysis: JSON.stringify({
        timeframe: "Realistic and achievable within target timeline",
        budget: "Budget allocation is appropriate for goal requirements",
        resources: "Necessary resources are available and accessible",
        risks: "Low to moderate risk factors identified",
        confidence: "High confidence in successful completion"
      })
    }
  });

  console.log(`   ✅ Goal created with ID: ${goal.id}`);
  return goal;
}

async function addGoalsToUser(userId) {
  console.log('🚀 Starting sample goal creation for specific user...');
  console.log(`👤 Target User ID: ${userId}`);
  console.log(`📊 Creating ${Object.keys(GOAL_CATEGORIES).length} goals across all categories`);
  console.log('');

  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    console.log(`✅ User verified: ${user.name} (${user.email})`);
    console.log('');

    // Create goals for each category
    let successCount = 0;
    for (const [categoryId, goalData] of Object.entries(GOAL_CATEGORIES)) {
      try {
        await createGoalForUser(categoryId, goalData, userId);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create ${categoryId} goal:`, error.message);
      }
    }

    console.log('');
    console.log('✅ Sample goal creation completed!');
    console.log(`📈 Successfully created ${successCount}/${Object.keys(GOAL_CATEGORIES).length} goals for ${user.name}`);
    console.log('');
    console.log('🎉 Your goals dashboard now contains:');
    Object.keys(GOAL_CATEGORIES).forEach(category => {
      console.log(`   • ${category}: ${GOAL_CATEGORIES[category].title}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample goals:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('❌ Usage: node scripts/add-goals-to-user.js <userId>');
    console.error('   Example: node scripts/add-goals-to-user.js cmeu2hpi00000eqscs99ku0e6');
    process.exit(1);
  }

  try {
    await addGoalsToUser(userId);
    console.log('');
    console.log('🎊 Script completed successfully!');
    console.log('💡 You can now test different goal categories and their dashboard components.');
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Handle script termination gracefully
process.on('SIGINT', async () => {
  console.log('\n⏹️  Script interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Script terminated');
  await prisma.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = { addGoalsToUser, GOAL_CATEGORIES };