function YearOverviewPage({ settings, months }) {
  const primary = settings.primaryColor;
  const accent = settings.accentColor;
  const font = settings.fontStyle;

  const dayHeaders = [
    DAYS_FR_SHORT[1], DAYS_FR_SHORT[2], DAYS_FR_SHORT[3],
    DAYS_FR_SHORT[4], DAYS_FR_SHORT[5], DAYS_FR_SHORT[6], DAYS_FR_SHORT[0],
  ];

  function getMonthGrid(month) {
    const firstDay = month.firstDayOfWeek;
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= month.daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  return React.createElement('div', {
    className: 'a5-page relative overflow-hidden flex flex-col',
    style: { backgroundColor: '#f7f5f0' }
  },
    React.createElement('div', {
      className: 'flex-shrink-0 h-7 flex items-center justify-center relative',
      style: { backgroundColor: primary }
    },
      React.createElement('div', { className: 'absolute left-0 top-0 bottom-0 w-1.5', style: { backgroundColor: accent } }),
      React.createElement('div', { className: 'absolute right-0 top-0 bottom-0 w-1.5', style: { backgroundColor: accent } }),
      React.createElement('h2', {
        className: 'text-lg font-bold tracking-wide text-white',
        style: { fontFamily: font }
      },
        settings.year,
        React.createElement('span', { className: 'mx-2 opacity-50' }, '•'),
        React.createElement('span', { dir: 'rtl', style: { fontFamily: 'Cairo, sans-serif' } }, settings.coverYearArabic)
      )
    ),
    React.createElement('div', { className: 'flex-1 grid grid-cols-3 grid-rows-4 gap-1.5 p-2 min-h-0' },
      months.map((month) => {
        const grid = getMonthGrid(month);
        return React.createElement('div', {
          key: month.index,
          className: 'flex flex-col rounded overflow-hidden border min-h-0',
          style: { borderColor: primary + '40', backgroundColor: '#fff' }
        },
          React.createElement('div', {
            className: 'flex items-center justify-center py-0.5 text-center',
            style: { backgroundColor: primary + '15' }
          },
            React.createElement('span', {
              className: 'text-[10px] font-bold uppercase leading-tight',
              style: { color: primary, fontFamily: font }
            }, MONTHS_FR[month.index]),
            React.createElement('span', {
              className: 'text-[9px] font-semibold leading-tight ml-1.5',
              dir: 'rtl',
              style: { color: accent, fontFamily: 'Cairo, sans-serif' }
            }, MONTHS_AR[month.index])
          ),
          React.createElement('div', { className: 'grid grid-cols-7 gap-px px-0.5' },
            dayHeaders.map((d, i) =>
              React.createElement('span', {
                key: i,
                className: 'text-center text-[7px] font-bold leading-tight py-0.5',
                style: { color: i >= 5 ? accent : '#888', fontFamily: font }
              }, d)
            )
          ),
          React.createElement('div', { className: 'grid grid-cols-7 gap-px flex-1 px-0.5 pb-0.5 min-h-0' },
            grid.map((day, i) => {
              const dow = i % 7;
              const isWeekend = dow >= 5;
              return React.createElement('span', {
                key: i,
                className: 'text-center text-[7px] leading-tight',
                style: {
                  color: day === null ? 'transparent' : isWeekend ? accent : '#444',
                  fontFamily: font
                }
              }, day || '');
            })
          )
        );
      })
    ),
    React.createElement('div', {
      className: 'flex-shrink-0 h-5 flex items-center justify-center text-[9px]',
      style: { color: primary, opacity: 0.6, fontFamily: font }
    }, settings.year)
  );
}
