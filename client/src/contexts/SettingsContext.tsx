import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { getSettings, updateSettings as apiUpdateSettings, Settings } from "@/api/settings";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";

type SettingsContextType = {
  temperatureUnit: 'celsius' | 'fahrenheit';
  refreshRate: number;
  numberOfTanks: number;
  isLoading: boolean;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
};

const defaultSettings: Settings = {
  temperatureUnit: 'fahrenheit',
  refreshRate: 30,
  numberOfTanks: 9,
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch settings only when authenticated
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast, isAuthenticated]);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = await apiUpdateSettings(newSettings);
      setSettings(updatedSettings);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return (
    <SettingsContext.Provider 
      value={{ 
        ...settings, 
        isLoading,
        updateSettings 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}