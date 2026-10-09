function getDayBackground(cell, settings) {
  if (cell.dayOfWeek === 6) return settings.saturdayBgColor;
  if (cell.dayOfWeek === 0) return settings.sundayBgColor;
  return '#ffffff';
}

function getDayFontColor(cell, settings) {
  if (cell.dayOfWeek === 6) return settings.saturdayFontColor;
  if (cell.dayOfWeek === 0) return settings.sundayFontColor;
  return settings.weekdayFontColor;
}

function getDayAccent(cell, settings) {
  return settings.primaryColor;
}

function RuledCell({ bgColor, lineColor }) {
  return React.createElement('div', {
    className: 'flex-1 min-h-0 relative overflow-hidden',
    style: { backgroundColor: bgColor }
  },
    Array.from({ length: 2 }).map((_, i) =>
      React.createElement('div', {
        key: i,
        className: 'absolute left-1 right-1 border-b border-dashed',
        style: {
          top: `${((i + 1) / 3) * 100}%`,
          borderColor: lineColor,
          opacity: 0.25
        }
      })
    )
  );
}

function MonthPage({ settings, monthData, dayStart, dayEnd }) {
  const days = monthData.days.slice(dayStart - 1, dayEnd);
  const primary = settings.primaryColor;
  const accent = settings.accentColor;
  const font = settings.fontStyle;

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
        monthData.nameFr.toUpperCase(),
        React.createElement('span', { className: 'mx-2 opacity-50' }, '•'),
        React.createElement('span', { dir: 'rtl', style: { fontFamily: 'Cairo, sans-serif' } }, monthData.nameAr),
        React.createElement('span', { className: 'mx-2 opacity-50' }, '•'),
        monthData.year
      )
    ),
    React.createElement('div', { className: 'flex-1 flex flex-col min-h-0 px-2 py-2 gap-1.5' },
      days.map((cell) => {
        const dayBg = getDayBackground(cell, settings);
        const dayFont = getDayFontColor(cell, settings);
        const dayAccent = getDayAccent(cell, settings);
        const isSaturday = cell.dayOfWeek === 6;
        const isSunday = cell.dayOfWeek === 0;

        return React.createElement('div', {
          key: cell.day,
          className: 'flex-1 min-h-0 flex rounded-md overflow-hidden shadow-sm',
          style: { border: `1.5px solid ${dayAccent}` }
        },
          React.createElement('div', {
            className: 'w-11 flex flex-col items-center justify-center flex-shrink-0',
            style: { backgroundColor: dayBg, borderRight: `1.5px solid ${dayAccent}` }
          },
            React.createElement('span', {
              className: 'text-2xl font-bold leading-none',
              style: { color: dayFont, fontFamily: font }
            }, cell.day)
          ),
          React.createElement('div', {
            className: 'w-16 flex flex-col items-center justify-center text-center flex-shrink-0 px-1',
            style: { backgroundColor: dayBg, borderRight: `1.5px solid ${dayAccent}` }
          },
            React.createElement('span', {
              className: 'text-xs font-bold leading-tight',
              style: { color: dayFont, fontFamily: font }
            }, DAYS_FR[cell.dayOfWeek]),
            React.createElement('span', {
              className: 'text-[11px] font-semibold leading-tight mt-0.5',
              dir: 'rtl',
              style: { color: dayFont, fontFamily: 'Cairo, sans-serif' }
            }, DAYS_AR[cell.dayOfWeek])
          ),
          React.createElement('div', { className: 'flex-1 flex flex-col min-w-0' },
            React.createElement('div', { className: 'flex-1 min-h-0 flex' },
              React.createElement('div', {
                className: 'w-14 flex flex-col items-center justify-center text-center flex-shrink-0',
                style: {
                  backgroundColor: isSaturday ? settings.saturdayBgColor : isSunday ? settings.sundayBgColor : settings.amBoxColor,
                  borderRight: `1.5px solid ${dayAccent}`
                }
              },
                React.createElement('span', { className: 'text-[10px] font-bold leading-tight', style: { color: dayFont } }, 'A.M.'),
                React.createElement('span', { className: 'text-[9px] font-semibold leading-tight', dir: 'rtl', style: { color: dayFont, fontFamily: 'Cairo, sans-serif' } }, 'مساء')
              ),
              React.createElement(RuledCell, { bgColor: '#fffefb', lineColor: dayAccent })
            ),
            React.createElement('div', { className: 'flex-shrink-0', style: { borderTop: '2px solid #1a1a1a' } }),
            React.createElement('div', { className: 'flex-1 min-h-0 flex' },
              React.createElement('div', {
                className: 'w-14 flex flex-col items-center justify-center text-center flex-shrink-0',
                style: {
                  backgroundColor: isSaturday ? settings.saturdayBgColor : isSunday ? settings.sundayBgColor : settings.soirBoxColor,
                  borderRight: `1.5px solid ${dayAccent}`
                }
              },
                React.createElement('span', { className: 'text-[10px] font-bold leading-tight', style: { color: dayFont } }, 'SOIR'),
                React.createElement('span', { className: 'text-[9px] font-semibold leading-tight', dir: 'rtl', style: { color: dayFont, fontFamily: 'Cairo, sans-serif' } }, 'ليل')
              ),
              React.createElement(RuledCell, { bgColor: '#fffefb', lineColor: dayAccent })
            )
          )
        );
      })
    ),
    React.createElement('div', {
      className: 'flex-shrink-0 h-5 flex items-center justify-between px-3 text-[9px]',
      style: { color: primary, opacity: 0.6 }
    },
      React.createElement('span', { style: { fontFamily: font } }, `${monthData.nameFr} ${monthData.year}`),
      React.createElement('span', { style: { fontFamily: font } }, `${dayStart} – ${dayEnd} / ${monthData.daysInMonth}`)
    )
  );
}
