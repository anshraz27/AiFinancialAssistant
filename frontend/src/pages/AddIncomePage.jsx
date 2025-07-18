"use client";

import { useForm } from "react-hook-form";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
const AddIncomePage = () => {
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
      paymentMethod: "",
    },
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await API.post("/transactions/add-txn", {
        ...data,
        type: "income", // Fixed type
      });

      reset();
      navigate("/dashboard"); // Redirect to dashboard instead of transactions
    } catch (error) {
      const msg = error?.response?.data?.message || "Something went wrong";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Add Income</h1>

        {errorMessage && (
          <p className="text-red-600 mb-4">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block font-medium text-gray-700">Amount</label>
            <input
              type="number"
              step="0.01"
              {...register("amount", {
                required: "Amount is required",
                valueAsNumber: true,
              })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1"
            />
            {errors.amount && <p className="text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block font-medium text-gray-700">Category</label>
            <input
              type="text"
              {...register("category", { required: "Category is required" })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1"
            />
            {errors.category && <p className="text-red-500 mt-1">{errors.category.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-gray-700">Description</label>
            <input
              type="text"
              {...register("description")}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block font-medium text-gray-700">Date</label>
            <input
              type="date"
              {...register("date", { required: "Date is required" })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1"
            />
            {errors.date && <p className="text-red-500 mt-1">{errors.date.message}</p>}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-medium text-gray-700">Payment Method</label>
            <select
              {...register("paymentMethod", {
                required: "Payment method is required",
              })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1"
            >
              <option value="">Select payment method</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
            </select>
            {errors.paymentMethod && (
              <p className="text-red-500 mt-1">{errors.paymentMethod.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add Income
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddIncomePage;
