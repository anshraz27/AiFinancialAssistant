"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useForm } from "react-hook-form";
import { DollarSign, Calendar, FileText, Layers, Upload } from "lucide-react";
import API from "../../services/api";

const investmentTypes = [
  "stock",
  "bond",
  "etf",
  "mutual_fund",
  "crypto",
  "real_estate",
  "commodity",
  "other",
];

const currencies = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD"];

const AddInvestmentPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      symbol: "",
      name: "",
      type: "stock",
      quantity: "",
      purchasePrice: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      platform: "",
      sector: "",
      currency: "USD",
      proof: null,
      notes: "",
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "proof" && value?.[0]) {
          formData.append("proof", value[0]);
        } else {
          formData.append(key, value);
        }
      });

      await API.post("/investments/add-investment", formData);
      reset();
      navigate("/investments");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Failed to add investment. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Add New Investment</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Symbol */}
            <div>
              <label className="block mb-1 font-medium">Ticker Symbol</label>
              <input
                type="text"
                {...register("symbol", { required: "Symbol is required" })}
                placeholder="e.g., AAPL"
                className="w-full px-4 py-3 border rounded-lg"
              />
              {errors.symbol && (
                <p className="text-red-600 text-sm">{errors.symbol.message}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block mb-1 font-medium">Asset Name</label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                placeholder="Apple Inc."
                className="w-full px-4 py-3 border rounded-lg"
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block mb-1 font-medium">Type</label>
              <select
                {...register("type")}
                className="w-full px-4 py-3 border rounded-lg"
              >
                {investmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block mb-1 font-medium">Quantity</label>
              <input
                type="number"
                step="any"
                {...register("quantity", { required: "Quantity is required" })}
                className="w-full px-4 py-3 border rounded-lg"
              />
              {errors.quantity && (
                <p className="text-red-600 text-sm">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block mb-1 font-medium">Purchase Price</label>
              <input
                type="number"
                step="any"
                {...register("purchasePrice", {
                  required: "Purchase price is required",
                })}
                className="w-full px-4 py-3 border rounded-lg"
              />
              {errors.purchasePrice && (
                <p className="text-red-600 text-sm">
                  {errors.purchasePrice.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block mb-1 font-medium">Purchase Date</label>
              <input
                type="date"
                {...register("purchaseDate")}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block mb-1 font-medium">Platform</label>
              <input
                type="text"
                {...register("platform")}
                placeholder="e.g., Zerodha, Robinhood"
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block mb-1 font-medium">Sector</label>
              <input
                type="text"
                {...register("sector")}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block mb-1 font-medium">Currency</label>
              <select
                {...register("currency")}
                className="w-full px-4 py-3 border rounded-lg"
              >
                {currencies.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block mb-1 font-medium">Notes</label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Additional info about this investment..."
              />
            </div>

            {/* Proof (file upload) */}
            <div>
              <label className="block mb-1 font-medium">Upload Proof</label>
              <input
                type="file"
                accept="image/*"
                {...register("proof")}
                className="block w-full text-sm text-gray-500"
              />
            </div>

            {/* Server Error */}
            {serverError && (
              <p className="text-red-600 text-sm text-center">{serverError}</p>
            )}

            {/* Submit */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/investments")}
                className="flex-1 px-4 py-3 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isLoading ? "Saving..." : "Save Investment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInvestmentPage;
