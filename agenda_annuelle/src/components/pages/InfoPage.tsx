import type { AgendaSettings } from '@/types';
import { getHijriYear } from '@/utils/calendar';
import { Phone, Mail, MapPin, User } from 'lucide-react';

interface Props {
  settings: AgendaSettings;
}

export default function InfoPage({ settings }: Props) {
  const hijriYear = getHijriYear(settings.year);

  return (
    <div
      className="a5-page relative overflow-hidden flex flex-col p-8"
      style={{ backgroundColor: '#faf8f5' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-2"
        style={{ backgroundColor: settings.primaryColor }}
      />
      <div
        className="absolute top-2 left-0 right-0 h-px"
        style={{ backgroundColor: settings.accentColor }}
      />

      <div className="mt-6 mb-8 text-center">
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: settings.primaryColor, fontFamily: 'Playfair Display, serif' }}
        >
          Informations
        </h2>
        <div
          className="w-16 h-px mx-auto"
          style={{ backgroundColor: settings.accentColor }}
        />
      </div>

      <div className="flex-1 flex flex-col gap-5">
        <div
          className="border rounded-lg p-4"
          style={{ borderColor: '#e0ddd5', backgroundColor: '#fff' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <User size={16} style={{ color: settings.primaryColor }} />
            <span
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: settings.primaryColor }}
            >
              Propriétaire
            </span>
          </div>
          <p className="text-lg font-medium text-gray-800">
            {settings.ownerName || '—'}
          </p>
        </div>

        <div
          className="border rounded-lg p-4"
          style={{ borderColor: '#e0ddd5', backgroundColor: '#fff' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Phone size={16} style={{ color: settings.primaryColor }} />
            <span
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: settings.primaryColor }}
            >
              Contact
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {settings.ownerInfo || '—'}
          </p>
        </div>

        <div
          className="border rounded-lg p-4"
          style={{ borderColor: '#e0ddd5', backgroundColor: '#fff' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Mail size={16} style={{ color: settings.primaryColor }} />
            <span
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: settings.primaryColor }}
            >
              Année
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-bold" style={{ color: settings.primaryColor }}>
                {settings.year}
              </p>
              <p className="text-xs text-gray-500 mt-1">Calendrier Grégorien</p>
            </div>
            {settings.showHijri && (
              <div className="text-right">
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: settings.primaryColor,
                    fontFamily: 'Cairo, sans-serif',
                    direction: 'rtl',
                  }}
                >
                  {hijriYear} هـ
                </p>
                <p className="text-xs text-gray-500 mt-1">Calendrier Hégirien</p>
              </div>
            )}
          </div>
        </div>

        <div
          className="border rounded-lg p-4"
          style={{ borderColor: '#e0ddd5', backgroundColor: '#fff' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} style={{ color: settings.primaryColor }} />
            <span
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: settings.primaryColor }}
            >
              En cas de perte
            </span>
          </div>
          <p className="text-sm text-gray-600 italic">
            Veuillez retourner cet agenda à l'adresse indiquée ci-dessus. Merci.
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-4 left-8 right-8 flex justify-center"
        style={{ color: settings.accentColor }}
      >
        <div className="w-20 h-px" style={{ backgroundColor: settings.accentColor }} />
      </div>
    </div>
  );
}
