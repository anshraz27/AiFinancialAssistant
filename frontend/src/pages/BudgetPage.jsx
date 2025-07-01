"use client"

import { useState } from "react"
import Navbar from "../components/Navbar"
import { PieChart, Plus, Edit, Trash2, Target, TrendingUp, AlertCircle } from "lucide-react"

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([
    { id: 1, category: "Food & Dining", budget: 600, spent: 450, color: "bg-red-500" },
    { id: 2, category: "Transportation", budget: 300, spent: 200, color: "bg-blue-500" },
    { id: 3, category: "Entertainment", budget: 200, spent: 150, color: "bg-green-500" },
    { id: 4, category: "Shopping", budget: 400, spent: 380, color: "bg-purple-500" },
    { id: 5, category: "Bills & Utilities", budget: 500, spent: 480, color: "bg-yellow-500" },
  ])

  const [showAddBudget, setShowAddBudget] = useState(false)
  const [newBudget, setNewBudget] = useState({
    category: "",
    budget: "",
    color: "bg-indigo-500",
  })

  const totalBudget = budgets.reduce((sum, item) => sum + item.budget, 0)
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0)
  const remainingBudget = totalBudget - totalSpent

  const handleAddBudget = (e) => {
    e.preventDefault()
    const budget = {
      id: Date.now(),
      category: newBudget.category,
      budget: Number.parseFloat(newBudget.budget),
      spent: 0,
      color: newBudget.color,
    }
    setBudgets([...budgets, budget])
    setNewBudget({ category: "", budget: "", color: "bg-indigo-500" })
    setShowAddBudget(false)
  }

  const getStatusColor = (spent, budget) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const getStatusIcon = (spent, budget) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 90) return <AlertCircle className="w-4 h-4" />
    if (percentage >= 75) return <AlertCircle className="w-4 h-4" />
    return <Target className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-gray-600 mt-2">Track and manage your spending limits across categories.</p>
          </div>
          <button
            onClick={() => setShowAddBudget(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Budget</span>
          </button>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className={`text-2xl font-bold ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${Math.abs(remainingBudget).toLocaleString()}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  remainingBudget >= 0
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : "bg-gradient-to-r from-red-400 to-red-600"
                }`}
              >
                <PieChart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Budget Categories */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Budget Categories</h2>
          <div className="space-y-6">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.budget) * 100
              const remaining = budget.budget - budget.spent

              return (
                <div
                  key={budget.id}
                  className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${budget.color}`}></div>
                      <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-semibold text-gray-900">${budget.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Spent</p>
                      <p className="font-semibold text-gray-900">${budget.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining</p>
                      <p className={`font-semibold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${Math.abs(remaining).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500">Progress</span>
                      <div className={`flex items-center space-x-1 ${getStatusColor(budget.spent, budget.budget)}`}>
                        {getStatusIcon(budget.spent, budget.budget)}
                        <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${budget.color} h-3 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {percentage >= 90 && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Budget limit almost reached!</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Add Budget Modal */}
        {showAddBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Budget</h2>
              <form onSubmit={handleAddBudget} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    required
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Groceries"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newBudget.budget}
                      onChange={(e) => setNewBudget({ ...newBudget, budget: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddBudget(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Add Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetPage
