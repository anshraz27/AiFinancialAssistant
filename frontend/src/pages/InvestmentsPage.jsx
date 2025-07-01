"use client"

import { useState } from "react"
import Navbar from "../components/Navbar"
import { TrendingUp, TrendingDown, DollarSign, PieChart, Plus, BarChart3 } from "lucide-react"

const InvestmentsPage = () => {
  const [investments] = useState([
    { id: 1, name: "Apple Inc.", symbol: "AAPL", shares: 10, currentPrice: 175.5, purchasePrice: 150.0, change: 17.0 },
    {
      id: 2,
      name: "Microsoft Corp.",
      symbol: "MSFT",
      shares: 5,
      currentPrice: 380.25,
      purchasePrice: 350.0,
      change: 8.6,
    },
    { id: 3, name: "Tesla Inc.", symbol: "TSLA", shares: 3, currentPrice: 245.8, purchasePrice: 280.0, change: -12.2 },
    {
      id: 4,
      name: "Amazon.com Inc.",
      symbol: "AMZN",
      shares: 2,
      currentPrice: 145.3,
      purchasePrice: 130.0,
      change: 11.8,
    },
  ])

  const totalValue = investments.reduce((sum, inv) => sum + inv.shares * inv.currentPrice, 0)
  const totalCost = investments.reduce((sum, inv) => sum + inv.shares * inv.purchasePrice, 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = (totalGainLoss / totalCost) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
            <p className="text-gray-600 mt-2">Track your investments and portfolio performance.</p>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Investment</span>
          </button>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">${totalCost.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toLocaleString()}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  totalGainLoss >= 0
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : "bg-gradient-to-r from-red-400 to-red-600"
                }`}
              >
                {totalGainLoss >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-white" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className={`font-medium ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalGainLoss >= 0 ? "+" : ""}
                {totalGainLossPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Holdings</p>
                <p className="text-2xl font-bold text-gray-900">{investments.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Your Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investments.map((investment) => {
                  const currentValue = investment.shares * investment.currentPrice
                  const purchaseValue = investment.shares * investment.purchasePrice
                  const gainLoss = currentValue - purchaseValue

                  return (
                    <tr key={investment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{investment.name}</div>
                          <div className="text-sm text-gray-500">{investment.symbol}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{investment.shares}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${investment.currentPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${investment.purchasePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${currentValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                          {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div
                          className={`flex items-center ${investment.change >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {investment.change >= 0 ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          )}
                          {investment.change >= 0 ? "+" : ""}
                          {investment.change.toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvestmentsPage
