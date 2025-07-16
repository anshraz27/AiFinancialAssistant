"use client"; // This line is safe to keep for clarity, though not needed in React+Vite

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createInvestment } from "../../services/api";
import Navbar from "../components/Navbar";

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
  const navigate = useNavigate(); // ✅ Correct usage
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    type: "stock",
    quantity: 0,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
    platform: "",
    sector: "",
    currency: "USD",
    notes: "",
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createInvestment(formData);
      navigate("/investments"); // ✅ React Router navigation
    } catch (err) {
      console.error("Error creating investment:", err);
      setError(err.response?.data?.message || "Failed to create investment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Add New Investment
          </h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* form fields unchanged, omitted for brevity */}
            {/* Keep your fields from your original code here */}

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/investments")} // ✅ Fixed
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Investment"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInvestmentPage;
