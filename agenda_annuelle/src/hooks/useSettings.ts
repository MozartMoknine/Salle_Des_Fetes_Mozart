import { useState, useEffect, useCallback } from 'react';
import type { AgendaSettings } from '@/types';
import { DEFAULT_COVER_IMAGE, DEFAULT_BACK_IMAGE } from '@/config/defaults';

const STORAGE_KEY = 'agenda-settings';

const defaultSettings: AgendaSettings = {
  year: new Date().getFullYear() + 1,
  coverImage: DEFAULT_COVER_IMAGE,
  backImage: DEFAULT_BACK_IMAGE,
  coverTitle: 'Agenda',
  coverSubtitle: 'Organisateur Personnel',
  coverYearArabic: 'الأجندة',
  ownerName: '',
  ownerInfo: '',
  primaryColor: '#1a3a2e',
  accentColor: '#c9a84c',
  saturdayBgColor: '#d4e8f0',
  sundayBgColor: '#fce4dc',
  saturdayFontColor: '#111111',
  sundayFontColor: '#111111',
  weekdayFontColor: '#111111',
  amBoxColor: '#e8f5e9',
  soirBoxColor: '#fff3e0',
  fontStyle: 'Inter, sans-serif',
  showHijri: true,
  showWeekNumbers: true,
  weekStartsMonday: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<AgendaSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AgendaSettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch {
        // ignore quota errors
      }
    }
  }, [settings, loaded]);

  const updateSetting = useCallback(
    <K extends keyof AgendaSettings>(key: K, value: AgendaSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateSettings = useCallback((updates: Partial<AgendaSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return { settings, updateSetting, updateSettings, resetSettings, loaded };
}
