"use client";
import axiosInstance from "@/config/axios";
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Set mounted state when component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUserData = async () => {
    // Skip if not mounted (server-side)
    if (!mounted) return;

    setLoading(true);

    // Safe localStorage access
    let token = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("jwt_token");
    }

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get("/user");

      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jwt_token", token);
      localStorage.removeItem("store_user_data");
    }
    setUser(userData);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt_token");
    }
    setUser(null);
  };

  // Auto-fetch user data on client mount
  useEffect(() => {
    if (mounted) {
      fetchUserData();
    }
  }, [mounted]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, fetchUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
