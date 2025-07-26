"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../../services/api";
import { Download } from "lucide-react";

const ReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch monthly report from backend
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await API.get(
          `/reports/monthly-data?month=${selectedMonth}`
        );
        setReportData(res.data);
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedMonth]);

  // Export PDF
  const handleExport = async () => {
    try {
      const res = await API.get(`/reports/download?month=${selectedMonth}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${selectedMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export report:", error);
      alert("Error generating report!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center mt-10 text-gray-600 text-lg">
          Loading report...
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center mt-10 text-gray-600 text-lg">
          No data available for this month.
        </div>
      </div>
    );
  }

  const savingsRate =
    reportData.totalIncome > 0
      ? (reportData.netSavings / reportData.totalIncome) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Monthly Report</h1>
          <div className="flex space-x-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleExport}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <p className="text-sm text-gray-600">Total Income</p>
            <p className="text-2xl font-bold text-green-600">
              ${reportData.totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              ${reportData.totalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <p className="text-sm text-gray-600">Investments</p>
            <p className="text-2xl font-bold text-purple-600">
              ${reportData.totalInvestments.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <p className="text-sm text-gray-600">Net Savings</p>
            <p
              className={`text-2xl font-bold ${
                reportData.netSavings >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${reportData.netSavings.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {savingsRate.toFixed(1)}% saved
            </p>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-4">
            Expense Breakdown by Category
          </h2>
          {reportData.categories.length > 0 ? (
            <div className="space-y-3">
              {reportData.categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-200 pb-2"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-4 h-4 rounded-full ${cat.color}`}
                    ></span>
                    <span className="text-gray-700">{cat.name}</span>
                  </div>
                  <div className="text-gray-900 font-medium">
                    ${cat.amount.toFixed(2)} ({cat.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No expenses for this month</p>
          )}
        </div>

        {/* Income Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Income Breakdown</h2>
          {reportData.incomeBreakdown.length > 0 ? (
            <div className="space-y-3">
              {reportData.incomeBreakdown.map((inc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-200 pb-2"
                >
                  <span className="text-gray-700">{inc.source}</span>
                  <div className="text-gray-900 font-medium">
                    ${inc.amount.toFixed(2)} ({inc.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No income for this month</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
