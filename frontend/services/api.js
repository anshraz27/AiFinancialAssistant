import axios from "axios";

// In production (Vercel), VITE_API_URL points to the Render backend (e.g. https://finscope-api.onrender.com/api)
// In local dev, falls back to localhost via Vite proxy
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure Authorization header is preserved even when Content-Type is set
    if (config.headers["Content-Type"] && config.headers["Content-Type"].includes("multipart/form-data")) {
      // For FormData, don't set Content-Type manually, let the browser set it with boundary
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't automatically redirect, let components handle it
      console.warn("Authentication error - token may be expired");
    }
    return Promise.reject(error);
  }
);

// Investment API methods
export const getInvestments = () => API.get("/investments");
export const getInvestmentById = (id) => API.get(`/investments/${id}`);
export const createInvestment = (investmentData) => API.post("/investments", investmentData);
export const updateInvestment = (id, investmentData) => API.put(`/investments/${id}`, investmentData);
export const deleteInvestment = (id) => API.delete(`/investments/${id}`);
export const getPortfolioSummary = () => API.get("/investments/summary/portfolio");
export const getAllocationByType = () => API.get("/investments/summary/allocation");


export default API;
