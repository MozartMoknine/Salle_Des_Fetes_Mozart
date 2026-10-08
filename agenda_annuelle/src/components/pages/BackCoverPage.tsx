import type { AgendaSettings } from '@/types';

interface Props {
  settings: AgendaSettings;
}

export default function BackCoverPage({ settings }: Props) {
  const isCustomImage = settings.backImage.startsWith('data:');

  if (isCustomImage) {
    return (
      <div className="a5-page relative overflow-hidden">
        <img
          src={settings.backImage}
          alt="Back cover"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="a5-page relative overflow-hidden flex flex-col items-center justify-end p-8"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${settings.backImage})`,
          opacity: 0.2,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center text-center mb-12">
        <div
          className="w-12 h-12 rounded-full border flex items-center justify-center mb-4"
          style={{ borderColor: settings.accentColor }}
        >
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: settings.accentColor, opacity: 0.6 }}
          />
        </div>

        <p
          className="text-sm uppercase tracking-[0.3em]"
          style={{ color: settings.accentColor }}
        >
          {settings.coverTitle}
        </p>
        <p
          className="text-xs mt-2"
          style={{ color: '#ffffff', opacity: 0.7 }}
        >
          {settings.year}
        </p>
      </div>
    </div>
  );
}
