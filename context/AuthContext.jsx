import axiosInstance from "@/config/axios";
import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    setLoading(true);
    const token = localStorage.getItem("jwt_token");

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
    localStorage.setItem("jwt_token", token);
    localStorage.removeItem("store_user_data");
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, fetchUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
