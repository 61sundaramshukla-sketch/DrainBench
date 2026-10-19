/**
 * SettingsContext.jsx — Global user settings with localStorage persistence.
 * Provides { settings, setSetting, saveSettings, reset } to all children.
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'drainbench-settings-v1';

const DEFAULTS = {
  chamberHeightCm: 40,
  alertThresholdCm: 22,
  smoothingMethod: 'moving_average',
  smoothingWindow: 3,
  glowIntensity: 'normal',
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return { ...DEFAULTS }; }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);
  const [savedFlash, setSavedFlash] = useState(false);

  // Apply glow intensity CSS variable on mount and change
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--glow-opacity',
      settings.glowIntensity === 'reduced' ? '0.4' : '1'
    );
  }, [settings.glowIntensity]);

  const setSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const saveSettings = useCallback((patch) => {
    setSettings(prev => {
      const next = patch ? { ...prev, ...patch } : prev;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  }, []);

  const reset = useCallback(() => {
    setSettings({ ...DEFAULTS });
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSetting, saveSettings, savedFlash, reset }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
