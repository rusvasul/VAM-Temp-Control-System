import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "@/api/auth";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthResponse {
  token: string;
  isAdmin: boolean;
  message: string;
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
        const isAdminStr = localStorage.getItem("isAdmin");
        
        if (token) {
          setIsAuthenticated(true);
          setIsAdmin(isAdminStr === 'true');
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
        console.log("AuthContext: Authentication check result", { isAuthenticated: !!token, isAdmin: isAdminStr === 'true' });
      } catch (error) {
        console.error("AuthContext: Error checking authentication", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("isAdmin", String(response.isAdmin || false));
        setIsAuthenticated(true);
        setIsAdmin(response.isAdmin || false);
        console.log("AuthContext: User logged in", { email, isAdmin: response.isAdmin });
      } else {
        throw new Error("Login failed: No token received");
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
      const response = await apiRegister({ email, password });
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("isAdmin", String(response.isAdmin || false));
        setIsAuthenticated(true);
        setIsAdmin(response.isAdmin || false);
        console.log("AuthContext: User registered", { email, isAdmin: response.isAdmin });
      } else {
        throw new Error("Registration failed: No token received");
      }
    } catch (error) {
      console.error("AuthContext: Error during registration", error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      setIsAuthenticated(false);
      setIsAdmin(false);
      console.log("AuthContext: User logged out");
    } catch (error) {
      console.error("AuthContext: Error during logout", error);
      throw error;
    }
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