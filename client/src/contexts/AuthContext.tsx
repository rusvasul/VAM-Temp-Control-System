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
    console.log("AuthContext: Checking authentication");
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userIsAdmin = localStorage.getItem("isAdmin") === "true";
        setIsAuthenticated(!!token);
        setIsAdmin(userIsAdmin);
        console.log("AuthContext: Authentication check result", isAuthenticated);
      } catch (error) {
        console.error("AuthContext: Error checking authentication", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("isAdmin", String(response.data.isAdmin || false));
        setIsAuthenticated(true);
        setIsAdmin(response.data.isAdmin || false);
        console.log("AuthContext: User logged in", { email, isAdmin: response.data.isAdmin });
      } else {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (error) {
      console.error("AuthContext: Error during login", error);
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
        console.log("AuthContext: User registered", { email, isAdmin: response.data.isAdmin });
      } else {
        throw new Error(response.data?.message || "Registration failed");
      }
    } catch (error) {
      console.error("AuthContext: Error during registration", error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      throw error;
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out");
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