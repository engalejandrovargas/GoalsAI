#!/usr/bin/env node

/**
 * Sample Goals Creation Script
 * 
 * This script creates one goal from each category to demonstrate the system.
 * Perfect for testing and showcasing different goal types and dashboard components.
 * 
 * Usage: node scripts/create-sample-goals.js
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Initialize Prisma client with the backend database
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
    title: "Master React Development",
    description: "Become proficient in React.js to advance my frontend development career",
    estimatedCost: 600,
    category: "skill_development",
    priority: "high",
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    currentSaved: 100,
    assignedAgents: ["learning", "research"],
    smartGoalData: JSON.stringify({
      specific: "Master React hooks, state management, and component architecture",
      measurable: "Build 5 projects, contribute to 2 open source repos",
      achievable: "Dedicate 1.5 hours daily to coding and tutorials",
      relevant: "React skills are in high demand and will increase salary",
      timeBound: "Portfolio ready for senior developer applications in 6 months"
    })
  },

  weight_loss: {
    title: "Lose 30 Pounds",
    description: "Achieve a healthy weight through sustainable diet and exercise habits",
    estimatedCost: 1200,
    category: "weight_loss",
    priority: "high",
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    currentSaved: 300,
    assignedAgents: ["health", "research"],
    smartGoalData: JSON.stringify({
      specific: "Lose 30 pounds (from 200 to 170 lbs) through caloric deficit",
      measurable: "Lose 1-2 pounds per week, track daily weight and food intake",
      achievable: "Create 500-calorie deficit through diet and exercise",
      relevant: "Improve health, energy, and confidence",
      timeBound: "Reach target weight in 6 months"
    })
  },

  fitness: {
    title: "Run a 10K Race",
    description: "Train for and complete a 10K race to improve cardiovascular fitness",
    estimatedCost: 400,
    category: "fitness",
    priority: "medium",
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
    currentSaved: 150,
    assignedAgents: ["health"],
    smartGoalData: JSON.stringify({
      specific: "Complete a 10K race in under 60 minutes",
      measurable: "Follow Couch to 10K training program, track runs with app",
      achievable: "Currently can run 2 miles, gradual progression plan in place",
      relevant: "Builds endurance, improves health, and boosts confidence",
      timeBound: "Register for local 10K race in 12 weeks"
    })
  },

  wellness: {
    title: "Establish Daily Meditation Practice",
    description: "Build consistent meditation habit to reduce stress and improve mental clarity",
    estimatedCost: 250,
    category: "wellness",
    priority: "medium",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 50,
    assignedAgents: ["health", "research"],
    smartGoalData: JSON.stringify({
      specific: "Meditate for 20 minutes every morning using guided sessions",
      measurable: "Track daily sessions, aim for 90% consistency (328 days)",
      achievable: "Start with 5 minutes, gradually increase duration",
      relevant: "Reduces anxiety, improves focus, enhances life quality",
      timeBound: "Maintain consistent practice for full year"
    })
  },

  travel: {
    title: "Backpack Through Europe",
    description: "Plan and fund a 3-week European backpacking adventure",
    estimatedCost: 4500,
    category: "travel",
    priority: "medium",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 1200,
    assignedAgents: ["travel", "financial", "weather"],
    smartGoalData: JSON.stringify({
      specific: "Visit 8 European cities in 21 days via budget backpacking",
      measurable: "Save $275 monthly, research and book accommodations",
      achievable: "Use budget airlines, hostels, and local transportation",
      relevant: "Fulfill lifelong dream and gain cultural experiences",
      timeBound: "Depart for Europe in 12 months during summer season"
    })
  },

  immigration: {
    title: "Obtain Canadian Permanent Residency",
    description: "Navigate the Express Entry system to become a Canadian permanent resident",
    estimatedCost: 3500,
    category: "immigration",
    priority: "high",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 800,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Submit complete Express Entry application and receive PR status",
      measurable: "Complete language tests, ECA, medical exam, police checks",
      achievable: "CRS score of 470+, strong English proficiency, work experience",
      relevant: "Enables better career opportunities and life in Canada",
      timeBound: "Submit application within 12 months"
    })
  },

  career: {
    title: "Get Promoted to Senior Manager",
    description: "Advance to senior management role with 30% salary increase",
    estimatedCost: 1500,
    category: "career",
    priority: "high",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 400,
    assignedAgents: ["research", "learning"],
    smartGoalData: JSON.stringify({
      specific: "Secure promotion to Senior Manager role in current company",
      measurable: "Complete leadership course, lead 3 major projects, mentor 2 junior staff",
      achievable: "Strong performance reviews, CEO mentorship, skills development plan",
      relevant: "Increases salary by $25K and advances career trajectory",
      timeBound: "Promotion effective within next performance cycle"
    })
  },

  business: {
    title: "Launch E-commerce Store",
    description: "Start profitable online business selling handmade jewelry",
    estimatedCost: 8000,
    category: "business",
    priority: "high",
    targetDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years
    currentSaved: 2000,
    assignedAgents: ["research", "financial", "business"],
    smartGoalData: JSON.stringify({
      specific: "Launch Shopify store selling custom jewelry with $5K monthly revenue",
      measurable: "Create 50 products, acquire 500 customers, reach $5K MRR",
      achievable: "Leverage existing jewelry-making skills and social media presence",
      relevant: "Creates passive income stream and potential full-time business",
      timeBound: "Achieve $5K monthly revenue within 24 months"
    })
  },

  habits: {
    title: "Read 52 Books This Year",
    description: "Develop consistent reading habit by finishing one book per week",
    estimatedCost: 500,
    category: "habits",
    priority: "medium",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 100,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Read 52 books across fiction, non-fiction, and professional development",
      measurable: "Read 1 book per week, track progress with reading app",
      achievable: "Read 30 minutes daily during commute and before bed",
      relevant: "Expands knowledge, improves focus, enhances vocabulary",
      timeBound: "Complete 52 books by December 31st"
    })
  },

  creative: {
    title: "Write and Publish a Novel",
    description: "Complete and self-publish a 80,000-word fantasy novel",
    estimatedCost: 2000,
    category: "creative",
    priority: "medium",
    targetDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years
    currentSaved: 300,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Write, edit, and publish 80,000-word fantasy novel on Amazon",
      measurable: "Write 500 words daily, complete first draft in 6 months",
      achievable: "Dedicate 1 hour daily to writing, join writers' group for accountability",
      relevant: "Fulfills lifelong creative dream and potential income source",
      timeBound: "Published novel available for sale within 24 months"
    })
  },

  relationships: {
    title: "Strengthen Family Relationships",
    description: "Improve communication and connection with family members",
    estimatedCost: 800,
    category: "relationships",
    priority: "high",
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    currentSaved: 100,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Have weekly quality conversations with parents and siblings",
      measurable: "Schedule weekly video calls, plan monthly family activities",
      achievable: "Block calendar time, be intentional about listening",
      relevant: "Family relationships are foundation of happiness and support",
      timeBound: "Establish consistent patterns within 6 months"
    })
  },

  reading: {
    title: "Complete Personal Development Library",
    description: "Read 25 classic personal development books to build strong foundation",
    estimatedCost: 400,
    category: "reading",
    priority: "medium",
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    currentSaved: 80,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Read 25 foundational personal development books",
      measurable: "Complete 2 books per month with detailed notes and summaries",
      achievable: "Already established reading habit, allocate focused time",
      relevant: "Builds mental frameworks for success and personal growth",
      timeBound: "Complete library within 12 months"
    })
  },

  general: {
    title: "Organize and Declutter Home",
    description: "Create organized, minimalist living space using KonMari method",
    estimatedCost: 600,
    category: "general",
    priority: "medium",
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
    currentSaved: 150,
    assignedAgents: ["research"],
    smartGoalData: JSON.stringify({
      specific: "Declutter and organize entire home using KonMari method",
      measurable: "Complete one room per week, donate/sell unwanted items",
      achievable: "Dedicate weekend time to decluttering, follow systematic approach",
      relevant: "Creates peaceful environment and reduces daily stress",
      timeBound: "Complete home organization within 3 months"
    })
  }
};

async function createTestUser() {
  console.log('👤 Creating test user...');
  
  const user = await prisma.user.create({
    data: {
      googleId: `test_user_${Date.now()}`,
      email: 'testuser@example.com',
      name: 'Test User',
      profilePicture: 'https://via.placeholder.com/150',
      location: 'New York, NY',
      ageRange: '25-34',
      currentSituation: 'Working professional',
      availableTime: '10-15 hours per week',
      riskTolerance: 'moderate',
      preferredApproach: 'structured',
      onboardingCompleted: true,
      nationality: 'American',
      occupation: 'Software Engineer',
      theme: 'light'
    }
  });

  console.log(`✅ Created test user: ${user.name} (${user.email})`);
  return user;
}

async function createGoalForCategory(categoryId, goalData, userId) {
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

async function createSampleGoals() {
  console.log('🚀 Starting sample goal creation...');
  console.log(`📊 Creating ${Object.keys(GOAL_CATEGORIES).length} goals across all categories`);
  console.log('');

  try {
    // Create test user first
    const user = await createTestUser();
    console.log('');

    // Create goals for each category
    let successCount = 0;
    for (const [categoryId, goalData] of Object.entries(GOAL_CATEGORIES)) {
      try {
        await createGoalForCategory(categoryId, goalData, user.id);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create ${categoryId} goal:`, error.message);
      }
    }

    console.log('');
    console.log('✅ Sample goal creation completed!');
    console.log(`📈 Successfully created ${successCount}/${Object.keys(GOAL_CATEGORIES).length} goals`);
    console.log('');
    console.log('🎉 Your database now contains sample goals for testing:');
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
  try {
    await createSampleGoals();
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

module.exports = { createSampleGoals, GOAL_CATEGORIES };