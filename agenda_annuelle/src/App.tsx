import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import AgendaViewer from '@/components/AgendaViewer';
import SettingsPanel from '@/components/SettingsPanel';

function App() {
  const { settings, updateSetting, updateSettings, resetSettings, loaded } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!loaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden print:h-auto print:overflow-visible">
      <AgendaViewer
        settings={settings}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <SettingsPanel
        settings={settings}
        updateSetting={updateSetting}
        updateSettings={updateSettings}
        resetSettings={resetSettings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
