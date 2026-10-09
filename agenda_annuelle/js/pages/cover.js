function CoverPage({ settings }) {
  const isCustomImage = settings.coverImage.startsWith('data:');

  if (isCustomImage) {
    return React.createElement('div', { className: 'a5-page relative overflow-hidden' },
      React.createElement('img', { src: settings.coverImage, alt: 'Cover', className: 'w-full h-full object-cover' })
    );
  }

  return React.createElement('div', {
    className: 'a5-page relative overflow-hidden flex flex-col items-center justify-center',
    style: { backgroundColor: settings.primaryColor }
  },
    React.createElement('div', {
      className: 'absolute inset-0 bg-cover bg-center',
      style: { backgroundImage: `url(${settings.coverImage})`, opacity: 0.25 }
    }),
    React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60' }),
    React.createElement('div', { className: 'relative z-10 flex flex-col items-center text-center px-8' },
      React.createElement('div', {
        className: 'w-16 h-16 rounded-full border-2 flex items-center justify-center mb-6',
        style: { borderColor: settings.accentColor }
      },
        React.createElement('span', {
          className: 'text-2xl font-bold',
          style: { color: settings.accentColor, fontFamily: 'Amiri, serif' }
        }, settings.year)
      ),
      React.createElement('h1', {
        className: 'text-4xl font-bold mb-3 tracking-wide',
        style: { color: '#ffffff', fontFamily: 'Playfair Display, serif' }
      }, settings.coverTitle),
      React.createElement('div', {
        className: 'w-24 h-px mb-3',
        style: { backgroundColor: settings.accentColor }
      }),
      React.createElement('p', {
        className: 'text-sm uppercase tracking-[0.3em] mb-4',
        style: { color: settings.accentColor }
      }, settings.coverSubtitle),
      React.createElement('p', {
        className: 'text-3xl',
        style: { color: '#ffffff', fontFamily: 'Cairo, Noto Naskh Arabic, sans-serif', direction: 'rtl' }
      }, settings.coverYearArabic),
      React.createElement('div', {
        className: 'mt-8 text-5xl font-bold',
        style: { color: '#ffffff', fontFamily: 'Playfair Display, serif' }
      }, settings.year)
    ),
    React.createElement('div', { className: 'absolute bottom-6 left-0 right-0 flex justify-center' },
      React.createElement('div', {
        className: 'w-32 h-px',
        style: { backgroundColor: settings.accentColor, opacity: 0.6 }
      })
    )
  );
}
