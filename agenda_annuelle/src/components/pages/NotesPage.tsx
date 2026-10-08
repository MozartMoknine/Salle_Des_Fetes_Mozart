import type { AgendaSettings } from '@/types';

interface Props {
  settings: AgendaSettings;
  title?: string;
  titleArabic?: string;
}

export default function NotesPage({ settings, title = 'Notes', titleArabic = 'ملاحظات' }: Props) {
  return (
    <div
      className="a5-page relative overflow-hidden flex flex-col p-8"
      style={{ backgroundColor: '#faf8f5' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-2"
        style={{ backgroundColor: settings.primaryColor }}
      />

      <div className="mt-4 mb-4 text-center">
        <h2
          className="text-xl font-bold"
          style={{ color: settings.primaryColor, fontFamily: 'Playfair Display, serif' }}
        >
          {title}
        </h2>
        <p
          className="text-base mt-1"
          style={{
            color: settings.accentColor,
            fontFamily: 'Cairo, sans-serif',
            direction: 'rtl',
          }}
        >
          {titleArabic}
        </p>
        <div
          className="w-12 h-px mx-auto mt-2"
          style={{ backgroundColor: settings.accentColor }}
        />
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-2"
            style={{ borderBottom: '1px solid #d8d5cf' }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
              style={{ backgroundColor: settings.accentColor, opacity: 0.5 }}
            />
            <div className="flex-1 h-5" />
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-center">
        <div
          className="w-16 h-px"
          style={{ backgroundColor: settings.accentColor }}
        />
      </div>
    </div>
  );
}
