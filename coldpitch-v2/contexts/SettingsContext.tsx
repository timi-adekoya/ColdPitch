import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSettings } from '../types';
import { DEFAULT_USER_SETTINGS } from '../constants';

interface SettingsContextType {
  settings: UserSettings;
  saveSettings: (newSettings: UserSettings) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('userNetworkingSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
      // Fallback to default if parsing fails or localStorage is unavailable
      setSettings(DEFAULT_USER_SETTINGS);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const saveSettings = (newSettings: UserSettings) => {
    try {
      setSettings(newSettings);
      localStorage.setItem('userNetworkingSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
