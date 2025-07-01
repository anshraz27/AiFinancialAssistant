"use client"

import { useState } from "react"
import Navbar from "../components/Navbar"
import { BarChart3, PieChart, TrendingUp, TrendingDown, Download, ArrowUpRight, ArrowDownRight } from "lucide-react"

const ReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState("2025-06")

  const monthlyData = {
    "2025-06": {
      totalIncome: 4175.5,
      totalExpenses: 2890.75,
      netSavings: 1284.75,
      categories: [
        { name: "Food & Dining", amount: 524.0, percentage: 18.1, color: "bg-red-500" },
        { name: "Transportation", amount: 320.0, percentage: 11.1, color: "bg-blue-500" },
        { name: "Shopping", amount: 445.75, percentage: 15.4, color: "bg-purple-500" },
        { name: "Bills & Utilities", amount: 680.0, percentage: 23.5, color: "bg-yellow-500" },
        { name: "Entertainment", amount: 285.0, percentage: 9.9, color: "bg-green-500" },
        { name: "Healthcare", amount: 180.0, percentage: 6.2, color: "bg-pink-500" },
        { name: "Other", amount: 456.0, percentage: 15.8, color: "bg-gray-500" },
      ],
      incomeBreakdown: [
        { source: "Salary", amount: 2600.0, percentage: 62.3 },
        { source: "Freelance", amount: 1000.0, percentage: 24.0 },
        { source: "Investment", amount: 375.5, percentage: 9.0 },
        { source: "Bonus", amount: 200.0, percentage: 4.8 },
      ],
      dailyTrend: [
        { date: "Week 1", income: 650, expenses: 420 },
        { date: "Week 2", income: 1200, expenses: 680 },
        { date: "Week 3", income: 800, expenses: 750 },
        { date: "Week 4", income: 1525, expenses: 1040 },
      ],
    },
  }

  const currentData = monthlyData[selectedMonth]
  const savingsRate = (currentData.netSavings / currentData.totalIncome) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600 mt-2">Detailed analysis of your financial performance.</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="2025-06">June 2025</option>
              <option value="2025-05">May 2025</option>
              <option value="2025-04">April 2025</option>
            </select>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${currentData.totalIncome.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+8.5%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${currentData.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-500 font-medium">-3.2%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Savings</p>
                <p className="text-2xl font-bold text-blue-600">${currentData.netSavings.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+15.8%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-purple-600">{savingsRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${savingsRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Expense Categories */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Expense Categories</h2>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {currentData.categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${category.amount.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{category.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income Sources */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Income Sources</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {currentData.incomeBreakdown.map((income, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{income.source}</span>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${income.amount.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{income.percentage}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${income.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Weekly Trend</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-4 gap-6">
            {currentData.dailyTrend.map((week, index) => (
              <div key={index} className="text-center">
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-600 mb-2">{week.date}</div>
                  <div className="space-y-2">
                    <div className="bg-green-100 rounded-lg p-3">
                      <div className="text-xs text-green-600 mb-1">Income</div>
                      <div className="font-bold text-green-700">${week.income}</div>
                    </div>
                    <div className="bg-red-100 rounded-lg p-3">
                      <div className="text-xs text-red-600 mb-1">Expenses</div>
                      <div className="font-bold text-red-700">${week.expenses}</div>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-sm font-medium ${
                    week.income - week.expenses >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Net: ${week.income - week.expenses}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">AI Financial Insights</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-gray-900">Positive Trend</span>
              </div>
              <p className="text-gray-600 text-sm">
                Your savings rate improved by 15.8% this month. You're on track to exceed your annual savings goal by
                12%.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <PieChart className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-900">Optimization Tip</span>
              </div>
              <p className="text-gray-600 text-sm">
                Consider reducing dining expenses by 20% to save an additional $105 monthly. Try meal planning to
                achieve this goal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
