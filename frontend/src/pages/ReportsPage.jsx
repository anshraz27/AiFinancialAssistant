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
      {/* Rest of the original JSX content */}
    </div>
  )
}

export default ReportsPage
