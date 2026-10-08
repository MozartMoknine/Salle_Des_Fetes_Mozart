import { useRef } from 'react';
import type { AgendaSettings } from '@/types';
import { COVER_IMAGES, BACK_IMAGES } from '@/config/defaults';
import {
  X,
  Upload,
  Image as ImageIcon,
  Calendar,
  Type,
  Palette,
  Settings as SettingsIcon,
  RotateCcw,
} from 'lucide-react';

interface Props {
  settings: AgendaSettings;
  updateSetting: <K extends keyof AgendaSettings>(key: K, value: AgendaSettings[K]) => void;
  updateSettings: (updates: Partial<AgendaSettings>) => void;
  resetSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter (Sans-serif)' },
  { value: 'Playfair Display, serif', label: 'Playfair (Serif)' },
  { value: 'Georgia, serif', label: 'Georgia (Serif)' },
  { value: 'Courier New, monospace', label: 'Courier (Mono)' },
  { value: 'Cairo, sans-serif', label: 'Cairo (Arabic)' },
];

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer flex-shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>
  );
}

export default function SettingsPanel({
  settings,
  updateSetting,
  updateSettings,
  resetSettings,
  isOpen,
  onClose,
}: Props) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'coverImage' | 'backImage',
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSetting(key, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity no-print ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-300 no-print ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <SettingsIcon size={20} className="text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-800">Paramètres</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Année
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateSetting('year', settings.year - 1)}
                className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 text-lg font-bold"
              >
                −
              </button>
              <input
                type="number"
                value={settings.year}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1900 && val <= 2200) {
                    updateSetting('year', val);
                  }
                }}
                className="flex-1 text-center text-2xl font-bold border border-gray-300 rounded-lg py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => updateSetting('year', settings.year + 1)}
                className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 text-lg font-bold"
              >
                +
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => updateSetting('year', currentYear)}
                className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {currentYear}
              </button>
              <button
                onClick={() => updateSetting('year', currentYear + 1)}
                className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {currentYear + 1}
              </button>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Type size={16} className="text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Textes
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Titre principal</label>
                <input
                  type="text"
                  value={settings.coverTitle}
                  onChange={(e) => updateSetting('coverTitle', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Sous-titre</label>
                <input
                  type="text"
                  value={settings.coverSubtitle}
                  onChange={(e) => updateSetting('coverSubtitle', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Titre en arabe</label>
                <input
                  type="text"
                  value={settings.coverYearArabic}
                  onChange={(e) => updateSetting('coverYearArabic', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nom du propriétaire</label>
                <input
                  type="text"
                  value={settings.ownerName}
                  onChange={(e) => updateSetting('ownerName', e.target.value)}
                  placeholder="Votre nom"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Coordonnées (téléphone, email, adresse)
                </label>
                <textarea
                  value={settings.ownerInfo}
                  onChange={(e) => updateSetting('ownerInfo', e.target.value)}
                  placeholder="Tél: &#10;Email: &#10;Adresse:"
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon size={16} className="text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Image de couverture
              </h3>
            </div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Upload size={14} />
                Téléverser
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'coverImage')}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {COVER_IMAGES.map((img) => (
                <button
                  key={img}
                  onClick={() => updateSetting('coverImage', img)}
                  className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                    settings.coverImage === img
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="Cover option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon size={16} className="text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Image de dos
              </h3>
            </div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => backInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Upload size={14} />
                Téléverser
              </button>
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'backImage')}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {BACK_IMAGES.map((img) => (
                <button
                  key={img}
                  onClick={() => updateSetting('backImage', img)}
                  className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                    settings.backImage === img
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="Back cover option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={16} className="text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Couleurs principales
              </h3>
            </div>
            <div className="space-y-3">
              <ColorRow
                label="Couleur principale"
                value={settings.primaryColor}
                onChange={(v) => updateSetting('primaryColor', v)}
              />
              <ColorRow
                label="Couleur d'accent"
                value={settings.accentColor}
                onChange={(v) => updateSetting('accentColor', v)}
              />
              <div className="flex gap-2 flex-wrap">
                {[
                  { p: '#1a3a2e', a: '#c9a84c', label: 'Vert & Or' },
                  { p: '#1a1a2e', a: '#e94560', label: 'Nuit & Rouge' },
                  { p: '#2c1810', a: '#d4a574', label: 'Marron & Sable' },
                  { p: '#0f3460', a: '#e1a730', label: 'Bleu & Or' },
                  { p: '#4a235a', a: '#e8a0bf', label: 'Prune & Rose' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => updateSettings({ primaryColor: preset.p, accentColor: preset.a })}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex">
                      <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: preset.p }} />
                      <div className="w-4 h-4 rounded-full border border-white -ml-1.5" style={{ backgroundColor: preset.a }} />
                    </div>
                    <span className="text-xs text-gray-600">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={16} className="text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Couleurs des jours
              </h3>
            </div>
            <div className="space-y-3">
              <ColorRow
                label="Samedi — couleur de fond"
                value={settings.saturdayBgColor}
                onChange={(v) => updateSetting('saturdayBgColor', v)}
              />
              <ColorRow
                label="Samedi — couleur du texte"
                value={settings.saturdayFontColor}
                onChange={(v) => updateSetting('saturdayFontColor', v)}
              />
              <ColorRow
                label="Dimanche — couleur de fond"
                value={settings.sundayBgColor}
                onChange={(v) => updateSetting('sundayBgColor', v)}
              />
              <ColorRow
                label="Dimanche — couleur du texte"
                value={settings.sundayFontColor}
                onChange={(v) => updateSetting('sundayFontColor', v)}
              />
              <ColorRow
                label="Jours de semaine — couleur du texte"
                value={settings.weekdayFontColor}
                onChange={(v) => updateSetting('weekdayFontColor', v)}
              />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={16} className="text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Couleurs des cases A.M. / Soir
              </h3>
            </div>
            <div className="space-y-3">
              <ColorRow
                label="Case Après-Midi"
                value={settings.amBoxColor}
                onChange={(v) => updateSetting('amBoxColor', v)}
              />
              <ColorRow
                label="Case Soir"
                value={settings.soirBoxColor}
                onChange={(v) => updateSetting('soirBoxColor', v)}
              />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Type size={16} className="text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Police
              </h3>
            </div>
            <select
              value={settings.fontStyle}
              onChange={(e) => updateSetting('fontStyle', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {FONT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Options
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-600">Afficher le calendrier hégirien</span>
                <button
                  onClick={() => updateSetting('showHijri', !settings.showHijri)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.showHijri ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.showHijri ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-600">Numéros de semaine</span>
                <button
                  onClick={() => updateSetting('showWeekNumbers', !settings.showWeekNumbers)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.showWeekNumbers ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.showWeekNumbers ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-600">Semaine commence lundi</span>
                <button
                  onClick={() => updateSetting('weekStartsMonday', !settings.weekStartsMonday)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.weekStartsMonday ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.weekStartsMonday ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </label>
            </div>
          </section>

          <button
            onClick={resetSettings}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <RotateCcw size={14} />
            Réinitialiser les paramètres
          </button>
        </div>
      </div>
    </>
  );
}
