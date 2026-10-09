const STORAGE_KEY = 'agenda-settings';

function App() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (e) {
        // ignore
      }
    }
  }, [settings, loaded]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  if (!loaded) {
    return React.createElement('div', { className: 'h-screen flex items-center justify-center bg-gray-100' },
      React.createElement('div', { className: 'w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin' })
    );
  }

  return React.createElement('div', { className: 'h-screen flex flex-col bg-gray-100 overflow-hidden print:h-auto print:overflow-visible' },
    React.createElement(AgendaViewer, { settings, onOpenSettings: () => setSettingsOpen(true) }),
    React.createElement(SettingsPanel, {
      settings,
      updateSetting,
      updateSettings,
      resetSettings,
      isOpen: settingsOpen,
      onClose: () => setSettingsOpen(false)
    })
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null, React.createElement(App))
);
