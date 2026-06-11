"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Navbar from "../components/Navbar";
import API from "../../services/api";

const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Education",
  "Travel",
  "Rent",
  "Other",
];

const AddExpensePage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "card",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);

    try {
      await API.post("/transactions/add-txn", {
        type: "expense",
        amount: Number(data.amount),
        category: data.category,
        description: data.description.trim(),
        date: data.date,
        paymentMethod: data.paymentMethod,
      });

      reset();
      navigate("/transactions");
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.msg ||
          "Failed to add expense. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Add Expense
          </h1>
          <p className="text-gray-600 mb-8">
            Record an expense transaction for your spending reports and budget
            tracking.
          </p>

          {serverError && (
            <p className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
              {serverError}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("amount", {
                  required: "Amount is required",
                  valueAsNumber: true,
                  min: {
                    value: 0.01,
                    message: "Amount must be greater than 0",
                  },
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700">
                Category
              </label>
              <select
                {...register("category", {
                  required: "Category is required",
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              >
                <option value="">Select category</option>
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                {...register("description", {
                  required: "Description is required",
                  validate: (value) =>
                    value.trim().length > 0 || "Description is required",
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                placeholder="e.g., Grocery shopping"
              />
              {errors.description && (
                <p className="text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700">Date</label>
              <input
                type="date"
                {...register("date", { required: "Date is required" })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              />
              {errors.date && (
                <p className="text-red-500 mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700">
                Payment Method
              </label>
              <select
                {...register("paymentMethod", {
                  required: "Payment method is required",
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              >
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
              </select>
              {errors.paymentMethod && (
                <p className="text-red-500 mt-1">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/transactions")}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-emerald-400"
              >
                {isLoading ? "Saving..." : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpensePage;
