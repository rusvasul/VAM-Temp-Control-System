import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type BeerStyle = {
  id: number;
  name: string;
  minTemp: number;
  maxTemp: number;
};

type UserRole = {
  id: number;
  name: string;
  permissions: string[];
};

type ManagerSettingsState = {
  beerStyles: BeerStyle[];
  cleaningSchedules: Array<{
    tankId: number;
    schedule: string;
    lastCleaning: string;
  }>;
  userRoles: UserRole[];
  productionSchedule: Array<{
    tankId: number;
    beerStyle: string;
    startDate: string;
    endDate: string;
  }>;
  alarmThresholds: {
    temperatureDeviation: number;
    pressureHigh: number;
    pressureLow: number;
  };
  systemSettings: {
    dataRetentionDays: number;
    backupFrequency: string;
    samplingRateSeconds: number;
  };
};

type ManagerSettingsContextType = {
  settings: ManagerSettingsState;
  updateSettings: (newSettings: Partial<ManagerSettingsState>) => void;
  updateBeerStyle: (styleId: number, updates: Partial<BeerStyle>) => void;
  addBeerStyle: (style: BeerStyle) => void;
  removeBeerStyle: (styleId: number) => void;
  updateUserRole: (roleId: number, updates: Partial<UserRole>) => void;
  addUserRole: (role: UserRole) => void;
  removeUserRole: (roleId: number) => void;
};

const defaultSettings: ManagerSettingsState = {
  beerStyles: [
    { id: 1, name: "IPA", minTemp: 65, maxTemp: 70 },
    { id: 2, name: "Lager", minTemp: 45, maxTemp: 55 },
    { id: 3, name: "Stout", minTemp: 60, maxTemp: 65 },
  ],
  cleaningSchedules: [
    { tankId: 1, schedule: "Weekly", lastCleaning: "2024-01-08" },
    { tankId: 2, schedule: "Bi-weekly", lastCleaning: "2024-01-01" },
  ],
  userRoles: [
    { id: 1, name: "Operator", permissions: ["view", "control"] },
    { id: 2, name: "Supervisor", permissions: ["view", "control", "configure"] },
    { id: 3, name: "Administrator", permissions: ["view", "control", "configure", "manage"] },
  ],
  productionSchedule: [
    { tankId: 1, beerStyle: "IPA", startDate: "2024-01-15", endDate: "2024-01-30" },
    { tankId: 2, beerStyle: "Lager", startDate: "2024-01-20", endDate: "2024-02-05" },
  ],
  alarmThresholds: {
    temperatureDeviation: 5,
    pressureHigh: 30,
    pressureLow: 10,
  },
  systemSettings: {
    dataRetentionDays: 90,
    backupFrequency: "Daily",
    samplingRateSeconds: 60,
  },
};

const ManagerSettingsContext = createContext<ManagerSettingsContextType | null>(null);

export function ManagerSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ManagerSettingsState>(() => {
    const savedSettings = localStorage.getItem("managerSettings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("managerSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<ManagerSettingsState>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateBeerStyle = (styleId: number, updates: Partial<BeerStyle>) => {
    setSettings(prev => ({
      ...prev,
      beerStyles: prev.beerStyles.map(style => 
        style.id === styleId ? { ...style, ...updates } : style
      ),
    }));
  };

  const addBeerStyle = (style: BeerStyle) => {
    setSettings(prev => ({
      ...prev,
      beerStyles: [...prev.beerStyles, style],
    }));
  };

  const removeBeerStyle = (styleId: number) => {
    setSettings(prev => ({
      ...prev,
      beerStyles: prev.beerStyles.filter(style => style.id !== styleId),
    }));
  };

  const updateUserRole = (roleId: number, updates: Partial<UserRole>) => {
    setSettings(prev => ({
      ...prev,
      userRoles: prev.userRoles.map(role => 
        role.id === roleId ? { ...role, ...updates } : role
      ),
    }));
  };

  const addUserRole = (role: UserRole) => {
    setSettings(prev => ({
      ...prev,
      userRoles: [...prev.userRoles, role],
    }));
  };

  const removeUserRole = (roleId: number) => {
    setSettings(prev => ({
      ...prev,
      userRoles: prev.userRoles.filter(role => role.id !== roleId),
    }));
  };

  return (
    <ManagerSettingsContext.Provider 
      value={{ 
        settings,
        updateSettings,
        updateBeerStyle,
        addBeerStyle,
        removeBeerStyle,
        updateUserRole,
        addUserRole,
        removeUserRole
      }}
    >
      {children}
    </ManagerSettingsContext.Provider>
  );
}

export function useManagerSettings() {
  const context = useContext(ManagerSettingsContext);
  if (!context) {
    throw new Error("useManagerSettings must be used within a ManagerSettingsProvider");
  }
  return context;
}