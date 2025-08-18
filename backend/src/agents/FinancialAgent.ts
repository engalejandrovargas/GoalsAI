import { BaseAgent, TaskParameters, AgentResult, AgentCapability } from '../types/agent';
import logger from '../utils/logger';

interface SavingsCalculationParams {
  goalAmount: number;
  currentSavings: number;
  targetDate: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  currency: string;
}

interface CurrencyConversionParams {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  date?: string;
}

interface InvestmentAnalysisParams {
  amount: number;
  timeHorizon: number; // months
  riskTolerance: 'low' | 'medium' | 'high';
  goalType: string;
  currency: string;
}

interface BudgetOptimizationParams {
  monthlyIncome: number;
  expenses: Record<string, number>;
  savingsGoal: number;
  currency: string;
}

export class FinancialAgent extends BaseAgent {
  getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'calculateSavingsPlan',
        description: 'Create a detailed savings plan to reach financial goals',
        parameters: {
          goalAmount: { type: 'number', required: true },
          currentSavings: { type: 'number', default: 0 },
          targetDate: { type: 'string', required: true },
          monthlyIncome: { type: 'number', required: true },
          monthlyExpenses: { type: 'number', required: true },
          currency: { type: 'string', default: 'USD' },
        },
      },
      {
        name: 'convertCurrency',
        description: 'Convert between different currencies with real-time rates',
        parameters: {
          amount: { type: 'number', required: true },
          fromCurrency: { type: 'string', required: true },
          toCurrency: { type: 'string', required: true },
          date: { type: 'string', required: false },
        },
      },
      {
        name: 'analyzeInvestmentOptions',
        description: 'Analyze investment options based on risk tolerance and time horizon',
        parameters: {
          amount: { type: 'number', required: true },
          timeHorizon: { type: 'number', required: true },
          riskTolerance: { type: 'string', required: true },
          goalType: { type: 'string', required: true },
          currency: { type: 'string', default: 'USD' },
        },
      },
      {
        name: 'optimizeBudget',
        description: 'Analyze spending patterns and suggest budget optimizations',
        parameters: {
          monthlyIncome: { type: 'number', required: true },
          expenses: { type: 'object', required: true },
          savingsGoal: { type: 'number', required: true },
          currency: { type: 'string', default: 'USD' },
        },
      },
      {
        name: 'trackMarketTrends',
        description: 'Monitor market conditions affecting financial goals',
        parameters: {
          assets: { type: 'array', required: true },
          alertThreshold: { type: 'number', default: 5 },
          frequency: { type: 'string', default: 'daily' },
        },
      },
    ];
  }

  validateParameters(parameters: Record<string, any>): boolean {
    return parameters && typeof parameters === 'object';
  }

  async executeTask(task: TaskParameters): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`FinancialAgent executing task: ${task.type} for goal ${task.goalId}`);
      
      let result: any;
      let confidence = 0.8;
      
      switch (task.type) {
        case 'calculateSavingsPlan':
          result = await this.calculateSavingsPlan(task.parameters as SavingsCalculationParams);
          confidence = 0.9;
          break;
          
        case 'convertCurrency':
          result = await this.convertCurrency(task.parameters as CurrencyConversionParams);
          confidence = 0.95;
          break;
          
        case 'analyzeInvestmentOptions':
          result = await this.analyzeInvestmentOptions(task.parameters as InvestmentAnalysisParams);
          confidence = 0.75; // Lower as it's advisory
          break;
          
        case 'optimizeBudget':
          result = await this.optimizeBudget(task.parameters as BudgetOptimizationParams);
          confidence = 0.8;
          break;
          
        case 'trackMarketTrends':
          result = await this.setupMarketTracking(task.parameters);
          confidence = 1.0;
          break;
          
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }

      this.logPerformance(startTime, true);
      
      return {
        success: true,
        data: result,
        confidence,
        metadata: {
          executionTime: Date.now() - startTime,
          agentType: 'financial',
          taskType: task.type,
        },
      };
    } catch (error) {
      this.logPerformance(startTime, false);
      
      logger.error(`FinancialAgent task failed: ${error}`);
      
      return {
        success: false,
        data: null,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime: Date.now() - startTime,
          agentType: 'financial',
          taskType: task.type,
        },
      };
    }
  }

  private async calculateSavingsPlan(params: SavingsCalculationParams): Promise<any> {
    logger.info(`Calculating savings plan for goal amount: ${params.goalAmount} ${params.currency}`);
    
    const targetDate = new Date(params.targetDate);
    const currentDate = new Date();
    const monthsToGoal = Math.max(1, Math.ceil((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
    
    const amountNeeded = params.goalAmount - params.currentSavings;
    const monthlyDisposableIncome = params.monthlyIncome - params.monthlyExpenses;
    const requiredMonthlySavings = amountNeeded / monthsToGoal;
    
    const feasibility = monthlyDisposableIncome >= requiredMonthlySavings ? 'feasible' : 'challenging';
    const savingsRate = (requiredMonthlySavings / params.monthlyIncome) * 100;
    
    // Calculate alternative scenarios
    const scenarios = {
      current: {
        monthlyAmount: requiredMonthlySavings,
        timeToGoal: monthsToGoal,
        feasible: feasibility === 'feasible',
        savingsRate: savingsRate,
      },
      conservative: {
        monthlyAmount: monthlyDisposableIncome * 0.5,
        timeToGoal: Math.ceil(amountNeeded / (monthlyDisposableIncome * 0.5)),
        feasible: true,
        savingsRate: (monthlyDisposableIncome * 0.5 / params.monthlyIncome) * 100,
      },
      aggressive: {
        monthlyAmount: monthlyDisposableIncome * 0.8,
        timeToGoal: Math.ceil(amountNeeded / (monthlyDisposableIncome * 0.8)),
        feasible: monthlyDisposableIncome >= monthlyDisposableIncome * 0.8,
        savingsRate: (monthlyDisposableIncome * 0.8 / params.monthlyIncome) * 100,
      },
    };

    return {
      goalAmount: params.goalAmount,
      currentSavings: params.currentSavings,
      amountNeeded,
      targetDate: params.targetDate,
      monthsToGoal,
      currency: params.currency,
      monthlyDisposableIncome,
      scenarios,
      recommendations: [
        savingsRate > 50 ? 'Consider extending your timeline or reducing the goal amount' : null,
        savingsRate < 10 ? 'You could potentially increase your monthly savings' : null,
        monthlyDisposableIncome < requiredMonthlySavings ? 'Consider reducing monthly expenses or increasing income' : null,
        'Set up automatic transfers to a high-yield savings account',
        'Track your progress monthly and adjust as needed',
        'Consider the 50/30/20 budgeting rule',
      ].filter(Boolean),
      milestones: this.generateSavingsMilestones(params.currentSavings, params.goalAmount, monthsToGoal),
    };
  }

  private async convertCurrency(params: CurrencyConversionParams): Promise<any> {
    logger.info(`Converting ${params.amount} ${params.fromCurrency} to ${params.toCurrency}`);
    
    try {
      let response;
      let data;
      
      // 1. Try CurrencyAPI.net first (confirmed working)
      const currencyApiKey = process.env.CURRENCY_API_KEY;
      if (currencyApiKey) {
        logger.info('Using CurrencyAPI.net for currency conversion');
        try {
          response = await fetch(`https://currencyapi.net/api/v1/rates?base=${params.fromCurrency}&output=json&key=${currencyApiKey}`);
          
          if (response.ok) {
            data = await response.json() as any;
            if (data.valid && data.rates && data.rates[params.toCurrency]) {
              const rate = data.rates[params.toCurrency];
              logger.info('Successfully used CurrencyAPI.net');
              
              const convertedAmount = params.amount * rate;
              const fee = convertedAmount * 0.015;
              const finalAmount = convertedAmount - fee;
              
              return {
                originalAmount: params.amount,
                fromCurrency: params.fromCurrency,
                toCurrency: params.toCurrency,
                exchangeRate: rate,
                convertedAmount,
                fee: {
                  amount: Math.round(fee * 100) / 100,
                  percentage: 1.5,
                  currency: params.toCurrency,
                },
                finalAmount: Math.round(finalAmount * 100) / 100,
                date: new Date().toISOString(),
                lastUpdated: new Date(data.updated * 1000).toISOString(),
                rateType: 'real-time',
                provider: 'CurrencyAPI.net',
                success: true,
              };
            }
          }
        } catch (error) {
          logger.warn('CurrencyAPI.net failed, trying next API:', error);
        }
      }
      
      // 2. Try ExchangeRate-API v6 (your paid key)
      const exchangeRateApiKey = process.env.EXCHANGE_RATE_API_KEY;
      if (exchangeRateApiKey) {
        logger.info('Using ExchangeRate-API v6 (paid) for currency conversion');
        try {
          response = await fetch(`https://v6.exchangerate-api.com/v6/${exchangeRateApiKey}/latest/${params.fromCurrency}`);
          
          if (response.ok) {
            data = await response.json() as any;
            if (data.result === 'success' && data.conversion_rates && data.conversion_rates[params.toCurrency]) {
              const rate = data.conversion_rates[params.toCurrency];
              logger.info('Successfully used ExchangeRate-API v6 (paid)');
              
              const convertedAmount = params.amount * rate;
              const fee = convertedAmount * 0.015;
              const finalAmount = convertedAmount - fee;
              
              return {
                originalAmount: params.amount,
                fromCurrency: params.fromCurrency,
                toCurrency: params.toCurrency,
                exchangeRate: rate,
                convertedAmount,
                fee: {
                  amount: Math.round(fee * 100) / 100,
                  percentage: 1.5,
                  currency: params.toCurrency,
                },
                finalAmount: Math.round(finalAmount * 100) / 100,
                date: new Date().toISOString(),
                lastUpdated: data.time_last_update_utc,
                rateType: 'real-time',
                provider: 'ExchangeRate-API v6 (Paid)',
                success: true,
              };
            }
          }
        } catch (error) {
          logger.warn('ExchangeRate-API v6 failed, trying next API:', error);
        }
      }
      
      // 3. Fallback to free ExchangeRate-API (confirmed working)
      logger.info('Falling back to ExchangeRate-API (free)');
      response = await fetch(`https://api.exchangerate-api.com/v4/latest/${params.fromCurrency}`);
      
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }
      
      data = await response.json() as any;
      const rate = data.rates[params.toCurrency];
      
      if (!rate) {
        throw new Error(`Exchange rate not found for ${params.fromCurrency} to ${params.toCurrency}`);
      }
      
      logger.info('Successfully used ExchangeRate-API (free)');
      const convertedAmount = params.amount * rate;
      const fee = convertedAmount * 0.015;
      const finalAmount = convertedAmount - fee;
      
      return {
        originalAmount: params.amount,
        fromCurrency: params.fromCurrency,
        toCurrency: params.toCurrency,
        exchangeRate: rate,
        convertedAmount,
        fee: {
          amount: Math.round(fee * 100) / 100,
          percentage: 1.5,
          currency: params.toCurrency,
        },
        finalAmount: Math.round(finalAmount * 100) / 100,
        date: new Date().toISOString(),
        lastUpdated: data.time_last_update_utc || new Date().toISOString(),
        rateType: 'real-time',
        provider: 'ExchangeRate-API (Free)',
        attribution: 'Rates By Exchange Rate API',
        success: true,
      };
    } catch (error) {
      logger.error('Currency conversion API failed, falling back to mock rates:', error);
      
      // Fallback to mock rates if API fails
      const mockRates: Record<string, Record<string, number>> = {
        USD: { EUR: 0.85, GBP: 0.73, JPY: 110, CAD: 1.25, AUD: 1.35 },
        EUR: { USD: 1.18, GBP: 0.86, JPY: 129, CAD: 1.47, AUD: 1.59 },
        GBP: { USD: 1.37, EUR: 1.16, JPY: 151, CAD: 1.71, AUD: 1.85 },
      };

      let rate = 1;
      if (params.fromCurrency !== params.toCurrency) {
        if (mockRates[params.fromCurrency] && mockRates[params.fromCurrency][params.toCurrency]) {
          rate = mockRates[params.fromCurrency][params.toCurrency];
        } else if (mockRates[params.toCurrency] && mockRates[params.toCurrency][params.fromCurrency]) {
          rate = 1 / mockRates[params.toCurrency][params.fromCurrency];
        } else {
          // Fallback to USD conversion
          const toUSD = mockRates[params.fromCurrency]?.USD || 1;
          const fromUSD = mockRates[params.toCurrency]?.USD || 1;
          rate = toUSD / fromUSD;
        }
      }

      const convertedAmount = params.amount * rate;
      const fee = convertedAmount * 0.02; // 2% conversion fee (typical)
      const finalAmount = convertedAmount - fee;

      return {
        originalAmount: params.amount,
        fromCurrency: params.fromCurrency,
        toCurrency: params.toCurrency,
        exchangeRate: rate,
        convertedAmount,
        fee: {
          amount: Math.round(fee * 100) / 100,
          percentage: 2,
          currency: params.toCurrency,
        },
        finalAmount: Math.round(finalAmount * 100) / 100,
        date: new Date().toISOString(),
        rateType: 'fallback',
        provider: 'Mock Exchange Service (Fallback)',
        success: false,
        fallback: true,
      };
    }
  }

  private async analyzeInvestmentOptions(params: InvestmentAnalysisParams): Promise<any> {
    logger.info(`Analyzing investment options for ${params.amount} ${params.currency}`);
    
    const investmentOptions = {
      low: [
        {
          type: 'High-Yield Savings',
          expectedReturn: 2.5,
          risk: 'Very Low',
          liquidity: 'High',
          description: 'FDIC insured savings account with competitive rates',
          minInvestment: 0,
          fees: 0,
        },
        {
          type: 'Treasury Bills',
          expectedReturn: 3.0,
          risk: 'Very Low',
          liquidity: 'Medium',
          description: 'Government-backed short-term securities',
          minInvestment: 100,
          fees: 0,
        },
        {
          type: 'CDs (Certificate of Deposit)',
          expectedReturn: 3.5,
          risk: 'Very Low',
          liquidity: 'Low',
          description: 'Fixed-term deposit with guaranteed return',
          minInvestment: 500,
          fees: 0,
        },
      ],
      medium: [
        {
          type: 'Bond Index Funds',
          expectedReturn: 4.5,
          risk: 'Low to Medium',
          liquidity: 'High',
          description: 'Diversified portfolio of government and corporate bonds',
          minInvestment: 1000,
          fees: 0.15,
        },
        {
          type: 'Balanced Mutual Funds',
          expectedReturn: 6.0,
          risk: 'Medium',
          liquidity: 'High',
          description: 'Mix of stocks and bonds for balanced growth',
          minInvestment: 1000,
          fees: 0.75,
        },
        {
          type: 'Target-Date Funds',
          expectedReturn: 6.5,
          risk: 'Medium',
          liquidity: 'High',
          description: 'Automatically adjusts allocation based on target date',
          minInvestment: 1000,
          fees: 0.50,
        },
      ],
      high: [
        {
          type: 'Stock Index Funds',
          expectedReturn: 8.0,
          risk: 'Medium to High',
          liquidity: 'High',
          description: 'Broad market exposure with long-term growth potential',
          minInvestment: 1000,
          fees: 0.20,
        },
        {
          type: 'Growth Stocks',
          expectedReturn: 10.0,
          risk: 'High',
          liquidity: 'High',
          description: 'Individual stocks with high growth potential',
          minInvestment: 100,
          fees: 0,
        },
        {
          type: 'REITs',
          expectedReturn: 7.5,
          risk: 'Medium to High',
          liquidity: 'Medium',
          description: 'Real Estate Investment Trusts for property exposure',
          minInvestment: 1000,
          fees: 0.60,
        },
      ],
    };

    const recommendations = investmentOptions[params.riskTolerance];
    const suitableOptions = recommendations.filter(option => params.amount >= option.minInvestment);
    
    // Calculate projected returns
    const projectedReturns = suitableOptions.map(option => {
      const annualReturn = option.expectedReturn / 100;
      const years = params.timeHorizon / 12;
      const futureValue = params.amount * Math.pow(1 + annualReturn, years);
      
      return {
        ...option,
        projectedValue: futureValue,
        totalReturn: futureValue - params.amount,
        annualizedReturn: option.expectedReturn,
      };
    });

    return {
      amount: params.amount,
      timeHorizon: params.timeHorizon,
      riskTolerance: params.riskTolerance,
      goalType: params.goalType,
      currency: params.currency,
      suitableOptions: projectedReturns,
      diversificationAdvice: {
        recommended: params.amount > 10000,
        strategy: params.amount > 10000 
          ? 'Consider spreading investments across 3-4 different asset classes'
          : 'Start with a single, well-diversified index fund',
      },
      taxConsiderations: [
        'Consider tax-advantaged accounts (401k, IRA)',
        'Understand capital gains tax implications',
        'Look into tax-efficient index funds',
      ],
      riskWarnings: [
        'Past performance does not guarantee future results',
        'All investments carry risk of loss',
        'Consider your risk tolerance and time horizon',
        'Diversification does not guarantee profit or protect against loss',
      ],
      nextSteps: [
        'Review your emergency fund first',
        'Consider consulting with a financial advisor',
        'Start with small amounts to test your comfort level',
        'Set up automatic investing for dollar-cost averaging',
      ],
    };
  }

  private async optimizeBudget(params: BudgetOptimizationParams): Promise<any> {
    logger.info('Analyzing budget for optimization opportunities');
    
    const totalExpenses = Object.values(params.expenses).reduce((sum, amount) => sum + amount, 0);
    const currentSavingsRate = ((params.monthlyIncome - totalExpenses) / params.monthlyIncome) * 100;
    const targetSavingsRate = (params.savingsGoal / params.monthlyIncome) * 100;
    const shortfall = params.savingsGoal - (params.monthlyIncome - totalExpenses);

    // Analyze expense categories
    const expenseAnalysis = Object.entries(params.expenses).map(([category, amount]) => {
      const percentage = (amount / params.monthlyIncome) * 100;
      let recommendation = '';
      let potentialSavings = 0;

      // Category-specific recommendations
      switch (category.toLowerCase()) {
        case 'housing':
        case 'rent':
          if (percentage > 30) {
            recommendation = 'Housing costs exceed recommended 30% of income. Consider downsizing or finding roommates.';
            potentialSavings = amount - (params.monthlyIncome * 0.30);
          }
          break;
        case 'food':
        case 'groceries':
          if (percentage > 15) {
            recommendation = 'Food costs are high. Try meal planning, bulk buying, and cooking at home more.';
            potentialSavings = amount * 0.20; // Potential 20% savings
          }
          break;
        case 'transportation':
          if (percentage > 15) {
            recommendation = 'Consider carpooling, public transport, or a more fuel-efficient vehicle.';
            potentialSavings = amount * 0.15;
          }
          break;
        case 'entertainment':
          if (percentage > 10) {
            recommendation = 'Look for free activities and limit expensive entertainment.';
            potentialSavings = amount * 0.30;
          }
          break;
        case 'subscriptions':
          recommendation = 'Review and cancel unused subscriptions.';
          potentialSavings = amount * 0.40; // Often high potential savings
          break;
      }

      return {
        category,
        amount,
        percentage,
        recommendation,
        potentialSavings: Math.max(0, potentialSavings),
      };
    });

    const totalPotentialSavings = expenseAnalysis.reduce((sum, exp) => sum + exp.potentialSavings, 0);

    return {
      income: params.monthlyIncome,
      totalExpenses,
      currentSavings: params.monthlyIncome - totalExpenses,
      currentSavingsRate,
      targetSavingsGoal: params.savingsGoal,
      targetSavingsRate,
      shortfall: Math.max(0, shortfall),
      currency: params.currency,
      expenseBreakdown: expenseAnalysis,
      potentialSavings: totalPotentialSavings,
      budgetHealthScore: this.calculateBudgetHealthScore(params.monthlyIncome, totalExpenses, params.expenses),
      recommendations: {
        immediate: [
          shortfall > 0 ? `Find ways to cut ${shortfall.toFixed(2)} ${params.currency} from monthly expenses` : null,
          currentSavingsRate < 20 ? 'Try to save at least 20% of your income' : null,
          'Track expenses for a month to identify spending patterns',
          'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
        ].filter(Boolean),
        longTerm: [
          'Build an emergency fund of 3-6 months expenses',
          'Increase income through skills development or side hustles',
          'Automate savings to make it easier',
          'Review and adjust budget quarterly',
        ],
      },
      categories: {
        housing: Math.min(30, (params.expenses.housing || params.expenses.rent || 0) / params.monthlyIncome * 100),
        transportation: Math.min(15, (params.expenses.transportation || 0) / params.monthlyIncome * 100),
        food: Math.min(15, (params.expenses.food || params.expenses.groceries || 0) / params.monthlyIncome * 100),
        savings: Math.max(20, targetSavingsRate),
      },
    };
  }

  private async setupMarketTracking(params: any): Promise<any> {
    logger.info(`Setting up market tracking for assets: ${params.assets.join(', ')}`);
    
    return {
      trackingId: `market_${Date.now()}`,
      assets: params.assets,
      alertThreshold: params.alertThreshold,
      frequency: params.frequency,
      trackingMetrics: [
        'Price changes',
        'Volume changes',
        'Market volatility',
        'Economic indicators',
      ],
      alertTypes: [
        'Price threshold breach',
        'Significant volume changes',
        'Market volatility spikes',
        'Economic news impact',
      ],
      status: 'active',
      created: new Date().toISOString(),
    };
  }

  private generateSavingsMilestones(currentSavings: number, goalAmount: number, monthsToGoal: number): any[] {
    const amountNeeded = goalAmount - currentSavings;
    const monthlyTarget = amountNeeded / monthsToGoal;
    const milestones = [];

    for (let i = 1; i <= Math.min(12, monthsToGoal); i++) {
      const targetAmount = currentSavings + (monthlyTarget * i);
      const percentage = (targetAmount / goalAmount) * 100;
      
      milestones.push({
        month: i,
        targetAmount: Math.round(targetAmount),
        percentage: Math.round(percentage),
        description: `${percentage.toFixed(0)}% of goal reached`,
      });
    }

    return milestones;
  }

  private calculateBudgetHealthScore(income: number, totalExpenses: number, expenses: Record<string, number>): number {
    let score = 100;
    const savingsRate = ((income - totalExpenses) / income) * 100;

    // Deduct points for low savings rate
    if (savingsRate < 10) score -= 30;
    else if (savingsRate < 20) score -= 15;

    // Deduct points for high housing costs
    const housingCost = expenses.housing || expenses.rent || 0;
    if ((housingCost / income) > 0.30) score -= 20;

    // Deduct points for high total debt payments
    const debtPayments = expenses.debt || expenses.loans || 0;
    if ((debtPayments / income) > 0.20) score -= 15;

    return Math.max(0, Math.min(100, score));
  }
}