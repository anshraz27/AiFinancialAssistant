"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Camera,
  Upload,
  DollarSign,
  Calendar,
  Tag,
  FileText,
} from "lucide-react";
import { useForm } from "react-hook-form";
import API from "../../services/api";

const AddExpensePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "card",
      receipt: null,
    },
  });

  const watchedValues = watch();

  const categories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Other",
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");
    
    // Debug: Check if token exists
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);
    console.log("Token value:", token ? token.substring(0, 20) + "..." : "No token");
    
    try {
      const formData = new FormData();
      formData.append("type", "expense"); // Add transaction type
      formData.append("amount", data.amount);
      formData.append("category", data.category);
      formData.append("description", data.description);
      formData.append("date", data.date);
      formData.append("paymentMethod", data.paymentMethod);
      if (data.receipt && data.receipt[0]) {
        formData.append("receipt", data.receipt[0]);
      }

      await API.post("/transactions/add-txn", formData);

      reset();
      navigate("/dashboard");
    } catch (err) {
      console.log("API Error:", err.response?.data);
      setServerError(
        err.response?.data?.message ||
          "Failed to add expense. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptScan = () => {
    alert(
      "AI Receipt Scanner activated! In a real app, this would open camera/file picker and extract data using AI."
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add Expense</h1>
            <p className="text-gray-600 mt-2">
              Track your spending and keep your budget on track.
            </p>
          </div>

          {/* AI Receipt Scanner */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Receipt Scanner
              </h3>
              <p className="text-gray-600 mb-4">
                Snap a photo of your receipt and let AI extract the details
                automatically.
              </p>
              <button
                type="button"
                onClick={handleReceiptScan}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Scan Receipt
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount", { required: "Amount is required" })}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="text-red-600 text-sm">{errors.amount.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Category
              </label>
              <select
                {...register("category", { required: "Category is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Description
              </label>
              <input
                type="text"
                {...register("description", {
                  required: "Description is required",
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What did you spend on?"
              />
              {errors.description && (
                <p className="text-red-600 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                {...register("date", { required: "Date is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.date && (
                <p className="text-red-600 text-sm">{errors.date.message}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-4">
                {["card", "cash", "bank"].map((method) => (
                  <label key={method} className="relative">
                    <input
                      type="radio"
                      value={method}
                      {...register("paymentMethod", { required: true })}
                      className="sr-only"
                    />
                    <div
                      className={`p-4 border-2 rounded-lg text-center cursor-pointer transition-all ${
                        watchedValues.paymentMethod === method
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <span className="font-medium capitalize">{method}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.paymentMethod && (
                <p className="text-red-600 text-sm">
                  Payment method is required
                </p>
              )}
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 inline mr-2" />
                Receipt (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  {...register("receipt")}
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload receipt image</p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </label>
              </div>
            </div>

            {/* Server Error */}
            {serverError && (
              <p className="text-red-600 text-center">{serverError}</p>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpensePage;
