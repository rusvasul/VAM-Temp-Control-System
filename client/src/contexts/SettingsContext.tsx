import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type SettingsContextType = {
  temperatureUnit: string;
  refreshRate: number;
  autoMode: boolean;
  minTemp: number;
  maxTemp: number;
  valveMode: string;
  numberOfTanks: number;
  updateSettings: (settings: Partial<SettingsState>) => void;
};

type SettingsState = {
  temperatureUnit: string;
  refreshRate: number;
  autoMode: boolean;
  minTemp: number;
  maxTemp: number;
  valveMode: string;
  numberOfTanks: number;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>({
    temperatureUnit: "fahrenheit",
    refreshRate: 30,
    autoMode: true,
    minTemp: 60,
    maxTemp: 75,
    valveMode: "automatic",
    numberOfTanks: 9,
  });

  const updateSettings = useCallback((newSettings: Partial<SettingsState>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // Persist settings to localStorage
      localStorage.setItem('tankSettings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings }}>
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