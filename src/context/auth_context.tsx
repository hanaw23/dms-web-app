"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  username: string;
  role: "USER" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
    setIsInitialized(true);
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
