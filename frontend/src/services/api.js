// API service for making HTTP requests to backend
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem("authToken");
  }

  // Create headers with auth token
  getHeaders() {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic fetch method
  async fetchData(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("authToken");
          localStorage.removeItem("isAuthenticated");
          window.location.href = "/login";
          throw new Error("Authentication required");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth API methods
  async signup(userData) {
    return this.fetchData("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.fetchData("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.fetchData("/auth/logout", {
      method: "POST",
    });
  }

  async verifyEmail(token) {
    return this.fetchData("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async forgotPassword(email) {
    return this.fetchData("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.fetchData("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  // Categories API methods
  async getCategories(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ""}`;
    return this.fetchData(endpoint);
  }

  async createCategory(categoryData) {
    return this.fetchData("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  // Transactions API methods
  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/transactions${queryString ? `?${queryString}` : ""}`;
    return this.fetchData(endpoint);
  }

  async getTransaction(id) {
    return this.fetchData(`/transactions/${id}`);
  }

  async createTransaction(transactionData) {
    return this.fetchData("/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(id, transactionData) {
    return this.fetchData(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(id) {
    return this.fetchData(`/transactions/${id}`, {
      method: "DELETE",
    });
  }

  async getTransactionStats(period = "month") {
    return this.fetchData(`/transactions/stats?period=${period}`);
  }

  // Budget API methods
  async getBudgets(period = "monthly") {
    return this.fetchData(`/budgets?period=${period}`);
  }

  async createBudget(budgetData) {
    return this.fetchData("/budgets", {
      method: "POST",
      body: JSON.stringify(budgetData),
    });
  }

  // AI API methods
  async categorizeTransaction(transactionData) {
    return this.fetchData("/ai/categorize-transaction", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  }

  async processReceipt(file) {
    const formData = new FormData();
    formData.append("receipt", file);

    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}/ai/process-receipt`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getFinancialInsights(period = "monthly") {
    return this.fetchData(`/ai/financial-insights?period=${period}`);
  }

  // File upload method
  async uploadFile(endpoint, file, additionalData = {}) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Add additional data to form
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });

      const token = this.getAuthToken();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  }
}

export default new apiService();
