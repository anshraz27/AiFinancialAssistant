"use client";

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ImageIcon,
  Trash2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
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

const paymentMethods = [
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
];

// Upload states for the multi-phase UI
const STATES = {
  IDLE: "idle",
  UPLOADING: "uploading",
  ANALYZING: "analyzing",
  REVIEW: "review",
  CONFIRMING: "confirming",
  SUCCESS: "success",
  ERROR: "error",
};

const ReceiptScanPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [state, setState] = useState(STATES.IDLE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [scannedExpense, setScannedExpense] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // --- File Selection Handlers ---

  const validateFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
      return "Unsupported format. Please upload JPG, PNG, or WEBP.";
    }
    if (file.size > maxSize) {
      return "File too large. Maximum size is 5 MB.";
    }
    return null;
  };

  const handleFileSelect = (file) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setState(STATES.ERROR);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage("");
    setState(STATES.IDLE);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScannedExpense(null);
    setState(STATES.IDLE);
    setErrorMessage("");
    setUploadProgress(0);
    reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Scan Receipt ---

  const handleScanReceipt = async () => {
    if (!selectedFile) return;

    setState(STATES.UPLOADING);
    setUploadProgress(0);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("receipt", selectedFile);

      // Upload and scan
      setState(STATES.UPLOADING);
      const response = await API.post("/receipts/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percent);
          if (percent >= 100) {
            setState(STATES.ANALYZING);
          }
        },
      });

      if (response.data.success) {
        const expense = response.data.expense;
        setScannedExpense(expense);

        // Pre-fill the form with extracted data
        setValue("merchant", expense.merchant || "");
        setValue("amount", expense.amount || "");
        setValue(
          "date",
          expense.date
            ? new Date(expense.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
        setValue("category", expense.category || "Other");
        setValue("description", expense.description || "");
        setValue("paymentMethod", expense.paymentMethod || "card");

        setState(STATES.REVIEW);
      }
    } catch (error) {
      console.error("Scan failed:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to scan receipt. Please try again."
      );
      setState(STATES.ERROR);
    }
  };

  // --- Confirm Expense ---

  const onConfirm = async (formData) => {
    if (!scannedExpense?._id) return;

    setState(STATES.CONFIRMING);

    try {
      const updates = {
        merchant: formData.merchant?.trim() || null,
        amount: Number(formData.amount),
        date: formData.date,
        category: formData.category,
        description: formData.description?.trim() || `Receipt - ${formData.merchant || "Unknown"}`,
        paymentMethod: formData.paymentMethod,
      };

      await API.put(`/receipts/${scannedExpense._id}/confirm`, updates);
      setState(STATES.SUCCESS);

      // Navigate to transactions after a brief success message
      setTimeout(() => navigate("/transactions"), 2000);
    } catch (error) {
      console.error("Confirm failed:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to confirm expense. Please try again."
      );
      setState(STATES.ERROR);
    }
  };

  // --- Status Messages ---

  const getStatusMessage = () => {
    switch (state) {
      case STATES.UPLOADING:
        return "Uploading receipt...";
      case STATES.ANALYZING:
        return "Analyzing with AI...";
      case STATES.CONFIRMING:
        return "Saving expense...";
      default:
        return "";
    }
  };

  // --- Confidence Badge ---

  const ConfidenceBadge = ({ confidence }) => {
    if (!confidence && confidence !== 0) return null;
    const pct = Math.round(confidence * 100);
    let color = "bg-red-100 text-red-700";
    if (pct >= 80) color = "bg-emerald-100 text-emerald-700";
    else if (pct >= 60) color = "bg-yellow-100 text-yellow-700";

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}
      >
        <Sparkles className="w-3 h-3" />
        {pct}% confidence
      </span>
    );
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            Scan Receipt
          </h1>
          <p className="text-gray-600 mt-2">
            Upload a receipt image and our AI will automatically extract the
            expense details for you.
          </p>
        </div>

        {/* Success State */}
        {state === STATES.SUCCESS && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Expense Confirmed!
            </h2>
            <p className="text-gray-600">
              Redirecting to transactions...
            </p>
          </div>
        )}

        {/* Error State */}
        {state === STATES.ERROR && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Something went wrong
                </h3>
                <p className="text-red-600 mb-4">{errorMessage}</p>
                <button
                  onClick={clearFile}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content — Upload / Processing / Review */}
        {state !== STATES.SUCCESS && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column — Image Upload / Preview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Receipt Image
              </h2>

              {!selectedFile ? (
                /* Drag & Drop Zone */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    Drop your receipt here or click to browse
                  </p>
                  <p className="text-gray-500 text-sm">
                    JPG, PNG, or WEBP — Max 5 MB
                  </p>
                </div>
              ) : (
                /* Image Preview */
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="w-full rounded-xl object-contain max-h-96 bg-gray-100"
                  />
                  {state === STATES.IDLE && (
                    <button
                      onClick={clearFile}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
                id="receipt-file-input"
              />

              {/* Upload Progress */}
              {(state === STATES.UPLOADING || state === STATES.ANALYZING) && (
                <div className="mt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusMessage()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${state === STATES.ANALYZING ? 100 : uploadProgress}%`,
                      }}
                    />
                  </div>
                  {state === STATES.ANALYZING && (
                    <p className="text-xs text-gray-500 mt-2">
                      Our AI is reading the receipt. This may take a few
                      seconds...
                    </p>
                  )}
                </div>
              )}

              {/* Scan Button */}
              {selectedFile && state === STATES.IDLE && (
                <button
                  onClick={handleScanReceipt}
                  className="w-full mt-4 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  id="scan-receipt-btn"
                >
                  <Sparkles className="w-5 h-5" />
                  Scan with AI
                </button>
              )}
            </div>

            {/* Right Column — Extracted Data / Review Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {state === STATES.IDLE && !scannedExpense && (
                /* Placeholder when no scan has been done */
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-9 h-9 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-500 mb-1">
                    No receipt scanned yet
                  </h3>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Upload a receipt image and click "Scan with AI" to extract
                    expense details automatically.
                  </p>
                </div>
              )}

              {(state === STATES.UPLOADING || state === STATES.ANALYZING) && (
                /* Processing placeholder */
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    {state === STATES.UPLOADING
                      ? "Uploading..."
                      : "AI is analyzing your receipt..."}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Please wait while we process your receipt.
                  </p>
                </div>
              )}

              {(state === STATES.REVIEW || state === STATES.CONFIRMING) &&
                scannedExpense && (
                  /* Editable Review Form */
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Review Extracted Data
                      </h2>
                      <ConfidenceBadge
                        confidence={scannedExpense.confidence}
                      />
                    </div>

                    <p className="text-sm text-gray-500 mb-6">
                      Review and edit the extracted details before confirming.
                    </p>

                    <form
                      onSubmit={handleSubmit(onConfirm)}
                      className="space-y-4"
                    >
                      {/* Merchant */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Merchant
                        </label>
                        <input
                          type="text"
                          {...register("merchant")}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          placeholder="e.g., Starbucks"
                          id="receipt-merchant-input"
                        />
                      </div>

                      {/* Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          {...register("amount", {
                            required: "Amount is required",
                            valueAsNumber: true,
                            min: {
                              value: 0.01,
                              message: "Amount must be greater than 0",
                            },
                          })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          placeholder="0.00"
                          id="receipt-amount-input"
                        />
                        {errors.amount && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.amount.message}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          {...register("date", {
                            required: "Date is required",
                          })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          id="receipt-date-input"
                        />
                        {errors.date && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.date.message}
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          {...register("category", {
                            required: "Category is required",
                          })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          id="receipt-category-select"
                        >
                          {expenseCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.category.message}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          {...register("description")}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          placeholder="e.g., Coffee and pastry"
                          id="receipt-description-input"
                        />
                      </div>

                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Method
                        </label>
                        <select
                          {...register("paymentMethod")}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          id="receipt-payment-select"
                        >
                          {paymentMethods.map((pm) => (
                            <option key={pm.value} value={pm.value}>
                              {pm.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Items (read-only display) */}
                      {scannedExpense.items &&
                        scannedExpense.items.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Items Detected
                            </label>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              {scannedExpense.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-gray-700">
                                    {item.name}
                                    {item.quantity > 1
                                      ? ` × ${item.quantity}`
                                      : ""}
                                  </span>
                                  <span className="text-gray-900 font-medium">
                                    {scannedExpense.currency || "$"}
                                    {item.price?.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={clearFile}
                          disabled={state === STATES.CONFIRMING}
                          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          id="receipt-cancel-btn"
                        >
                          <Trash2 className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={state === STATES.CONFIRMING}
                          className="flex-1 px-4 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:bg-emerald-400"
                          id="receipt-confirm-btn"
                        >
                          {state === STATES.CONFIRMING ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Confirm Expense
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanPage;
