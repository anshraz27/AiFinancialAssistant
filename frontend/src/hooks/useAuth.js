"use client";

import { useState } from "react";
import apiService from "../services/api";

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.signup(userData);

      if (response.success) {
        // Store auth token and user data
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem(
          "userName",
          `${userData.firstName} ${userData.lastName}`
        );

        return response.data;
      } else {
        throw new Error(response.message || "Signup failed");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.login(credentials);

      if (response.success) {
        // Store auth token and user data
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", credentials.email);

        return response.data;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export const useLogout = () => {
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  };

  return { logout };
};
