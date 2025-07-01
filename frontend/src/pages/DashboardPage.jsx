"use client"

import { useState } from "react"
import Navbar from "../components/Navbar"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const DashboardPage = () => {
  const [financialData, setFinancialData] = useState({
    totalBalance: 12450,
    monthlyIncome: 5200,
    monthlyExpenses: 3850,
    savings: 1350,
    savingsGoal: 2000,
  })

  const [recentTransactions] = useState([
    { id: 1, type: "expense", category: "Food", amount: 45.5, date: "2025-06-26", description: "Lunch at Restaurant" },
    { id: 2, type: "income", category: "Salary", amount: 2600, date: "2025-06-25", description: "Monthly Salary" },
    { id: 3, type: "expense", category: "Transport", amount: 25.0, date: "2025-06-24", description: "Uber Ride" },
    {
      id: 4,
      type: "expense",
      category: "Shopping",
      amount: 120.75,
      date: "2025-06-23",
      description: "Grocery Shopping",
    },
    {
      id: 5,
      type: "income",
      category: "Freelance",
      amount: 500,
      date: "2025-06-22",
      description: "Web Design Project",
    },
  ])

  const [budgetCategories] = useState([
    { category: "Food", spent: 450, budget: 600, color: "bg-red-500" },
    { category: "Transport", spent: 200, budget: 300, color: "bg-blue-500" },
    { category: "Entertainment", spent: 150, budget: 200, color: "bg-green-500" },
    { category: "Shopping", spent: 300, budget: 400, color: "bg-purple-500" },
  ])

  const savingsProgress = (financialData.savings / financialData.savingsGoal) * 100

  const navigate = useNavigate()

  const handleAddIncome = () => {
    navigate("/add-income")
  }

  const handleAddExpense = () => {
    navigate("/add-expense")
  }

  const handleSetBudget = () => {
    navigate("/budget")
  }

  const handleViewReports = () => {
    navigate("/reports")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Here's your financial overview for today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">${financialData.totalBalance.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-gray-900">${financialData.monthlyIncome.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+8.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-gray-900">${financialData.monthlyExpenses.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-500 font-medium">+3.1%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Savings</p>
                <p className="text-2xl font-bold text-gray-900">${financialData.savings.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Goal Progress</span>
                <span className="text-gray-900 font-medium">{Math.round(savingsProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${savingsProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <button
                onClick={() => navigate("/transactions")}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.category} • {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Budget Overview</h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">Manage</button>
            </div>
            <div className="space-y-6">
              {budgetCategories.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{item.category}</span>
                    <span className="text-sm text-gray-500">
                      ${item.spent}/${item.budget}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${(item.spent / item.budget) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{Math.round((item.spent / item.budget) * 100)}% used</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleAddIncome}
              className="flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900">Add Income</span>
            </button>

            <button
              onClick={handleAddExpense}
              className="flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900">Add Expense</span>
            </button>

            <button
              onClick={handleSetBudget}
              className="flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900">Set Budget</span>
            </button>

            <button
              onClick={handleViewReports}
              className="flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
