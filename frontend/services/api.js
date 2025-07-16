import axios from "axios";

const API = axios.create({
  baseURL:  "http://localhost:5000/api",
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
      console.log("API Request - Token added:", token.substring(0, 20) + "...");
    } else {
      console.log("API Request - No token found");
    }
    
    console.log("API Request - Headers:", config.headers);
    
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
  (response) => {
    console.log("API Response - Success:", response.status);
    return response;
  },
  (error) => {
    console.log("API Response - Error:", error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // Don't automatically redirect, let components handle it
      console.log("Authentication error - token may be expired");
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
