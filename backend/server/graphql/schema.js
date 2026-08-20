const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type DashboardSummary { balance: Float!, income: Float!, expenses: Float!, savingsRate: Float! }
  type CategorySpend { category: String!, total: Float!, percentage: Float! }
  type Cashflow { month: String!, income: Float!, expenses: Float! }
  type BudgetHealth { category: String!, spent: Float!, limit: Float!, status: String! }
  type DashboardAnalytics { dashboardSummary: DashboardSummary!, spendingByCategory: [CategorySpend!]!, monthlyCashflow: [Cashflow!]!, budgetHealth: [BudgetHealth!]! }
  type Query { dashboardAnalytics: DashboardAnalytics! }
`);
