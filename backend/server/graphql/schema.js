const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type DashboardSummary { balance: Float!, income: Float!, expenses: Float!, savingsRate: Float!, monthlyIncome: Float!, monthlyExpenses: Float!, monthlySavings: Float! }
  type CategorySpend { category: String!, total: Float!, percentage: Float! }
  type Cashflow { month: String!, income: Float!, expenses: Float! }
  type BudgetHealth { _id: ID!, category: String!, spent: Float!, amount: Float!, status: String! }
  type Transaction { _id: ID!, description: String!, category: String!, amount: Float!, date: String!, type: String! }
  type DashboardAnalytics { dashboardSummary: DashboardSummary!, spendingByCategory: [CategorySpend!]!, monthlyCashflow: [Cashflow!]!, budgetHealth: [BudgetHealth!]!, recentTransactions: [Transaction!]! }
  type Query { dashboardAnalytics: DashboardAnalytics! }
`);
