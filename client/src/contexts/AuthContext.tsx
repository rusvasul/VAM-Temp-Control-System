import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { login as apiLogin, register as apiRegister } from "@/api/auth";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthResponse {
  data: {
    message: string;
    token?: string;
    isAdmin?: boolean;
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userIsAdmin = localStorage.getItem("isAdmin") === "true";
    setIsAuthenticated(!!token);
    setIsAdmin(userIsAdmin);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("isAdmin", String(response.data.isAdmin || false));
        setIsAuthenticated(true);
        setIsAdmin(response.data.isAdmin || false);
      } else {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      setIsAuthenticated(false);
      setIsAdmin(false);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await apiRegister({ email, password }) as AuthResponse;
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("isAdmin", String(response.data.isAdmin || false));
        setIsAuthenticated(true);
        setIsAdmin(response.data.isAdmin || false);
      } else {
        throw new Error(response.data?.message || "Registration failed");
      }
    } catch (error) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}