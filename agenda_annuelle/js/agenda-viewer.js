function AgendaViewer({ settings, onOpenSettings }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [printMode, setPrintMode] = useState(false);

  const months = useMemo(
    () => generateAllMonths(settings.year, settings.weekStartsMonday, settings.showWeekNumbers),
    [settings.year, settings.weekStartsMonday, settings.showWeekNumbers]
  );

  const pages = useMemo(() => {
    const result = [{ type: 'cover' }, { type: 'blank' }, { type: 'year-overview' }];

    months.forEach((month, monthIndex) => {
      const total = month.daysInMonth;
      if (total === 31) {
        const starts = [1, 7, 13, 19, 25, 29];
        starts.forEach((start, i) => {
          const end = i === 4 ? 28 : i === 5 ? 31 : start + 5;
          result.push({ type: 'month', monthIndex, monthData: month, dayStart: start, dayEnd: Math.min(end, total) });
        });
      } else {
        for (let dayStart = 1; dayStart <= total; dayStart += 6) {
          result.push({ type: 'month', monthIndex, monthData: month, dayStart, dayEnd: Math.min(dayStart + 5, total) });
        }
      }
    });

    result.push({ type: 'blank' });
    result.push({ type: 'back-cover' });
    return result;
  }, [months]);

  const totalPages = pages.length;

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') nextPage();
      else if (e.key === 'ArrowLeft') prevPage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextPage, prevPage]);

  const handlePrint = useCallback(() => {
    setPrintMode(true);
  }, []);

  useEffect(() => {
    if (!printMode) return;
    const timeout = setTimeout(() => {
      window.print();
    }, 500);
    const handleAfterPrint = () => {
      setPrintMode(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [printMode]);

  function renderPageEl(page) {
    switch (page.type) {
      case 'cover': return React.createElement(CoverPage, { settings });
      case 'year-overview': return React.createElement(YearOverviewPage, { settings, months });
      case 'month': return React.createElement(MonthPage, { settings, monthData: page.monthData, dayStart: page.dayStart, dayEnd: page.dayEnd });
      case 'back-cover': return React.createElement(BackCoverPage, { settings });
      case 'blank': return React.createElement('div', { className: 'a5-page bg-white' });
    }
  }

  function pageLabel(page) {
    switch (page.type) {
      case 'cover': return 'Couverture';
      case 'year-overview': return 'Vue annuelle';
      case 'month': return `${page.monthData.nameFr} ${page.dayStart}–${page.dayEnd}`;
      case 'back-cover': return 'Dos';
      case 'blank': return 'Page blanche';
    }
  }

  function pageShortLabel(page) {
    if (page.type === 'month' && page.monthData) return `${page.monthData.nameFr.substring(0, 3)} ${page.dayStart}`;
    if (page.type === 'cover') return 'Couv';
    if (page.type === 'year-overview') return 'Année';
    if (page.type === 'blank') return 'Vide';
    return 'Dos';
  }

  if (printMode) {
    return React.createElement('div', { className: 'print-root' },
      pages.map((page, i) =>
        React.createElement('div', { key: `print-${i}`, className: 'print-page' }, renderPageEl(page))
      )
    );
  }

  return React.createElement('div', { className: 'flex flex-col h-full' },

    React.createElement('div', { className: 'no-print bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('div', {
          className: 'w-8 h-8 rounded-lg flex items-center justify-center',
          style: { backgroundColor: settings.primaryColor }
        },
          React.createElement(Icons.BookOpen, { size: 18, className: 'text-white' })
        ),
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-sm font-semibold text-gray-800 leading-tight' },
            `${settings.coverTitle} ${settings.year}`
          ),
          React.createElement('p', { className: 'text-xs text-gray-400 leading-tight' }, pageLabel(pages[currentPage]))
        )
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('button', {
          onClick: handlePrint,
          className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
        },
          React.createElement(Icons.Printer, { size: 15 }),
          React.createElement('span', { className: 'hidden sm:inline' }, 'Enregistrer PDF')
        ),
        React.createElement('button', {
          onClick: onOpenSettings,
          className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
        },
          React.createElement(Icons.Settings, { size: 15 }),
          React.createElement('span', { className: 'hidden sm:inline' }, 'Paramètres')
        )
      )
    ),

    React.createElement('div', {
      className: 'flex-1 flex items-center justify-center overflow-hidden relative no-print',
      style: { backgroundColor: '#e8e4dc' }
    },
      React.createElement('button', {
        onClick: prevPage,
        disabled: currentPage === 0,
        className: 'absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10'
      },
        React.createElement(Icons.ChevronLeft, { size: 22 })
      ),
      React.createElement('div', {
        className: 'relative shadow-2xl rounded-sm overflow-hidden',
        style: { filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))' }
      },
        React.createElement('div', { className: 'page-enter' }, renderPageEl(pages[currentPage]))
      ),
      React.createElement('button', {
        onClick: nextPage,
        disabled: currentPage === totalPages - 1,
        className: 'absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10'
      },
        React.createElement(Icons.ChevronRight, { size: 22 })
      )
    ),

    React.createElement('div', { className: 'no-print bg-white border-t border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0' },
      React.createElement('button', {
        onClick: prevPage,
        disabled: currentPage === 0,
        className: 'flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-30'
      },
        React.createElement(Icons.ChevronLeft, { size: 16 }),
        'Précédent'
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'text-sm text-gray-500 font-medium' },
          `${currentPage + 1} / ${totalPages}`
        ),
        React.createElement('div', { className: 'w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden' },
          React.createElement('div', {
            className: 'h-full rounded-full transition-all duration-300',
            style: { width: `${((currentPage + 1) / totalPages) * 100}%`, backgroundColor: settings.primaryColor }
          })
        )
      ),
      React.createElement('button', {
        onClick: nextPage,
        disabled: currentPage === totalPages - 1,
        className: 'flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-30'
      },
        'Suivant',
        React.createElement(Icons.ChevronRight, { size: 16 })
      )
    ),

    React.createElement('div', { className: 'no-print fixed bottom-16 left-1/2 -translate-x-1/2 z-30' },
      React.createElement('details', { className: 'group' },
        React.createElement('summary', {
          className: 'cursor-pointer list-none flex items-center gap-1.5 px-4 py-2 rounded-full bg-white shadow-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
        },
          React.createElement(Icons.Calendar, { size: 14 }),
          'Aller à',
          React.createElement(Icons.ChevronRight, { size: 14, className: 'group-open:rotate-90 transition-transform' })
        ),
        React.createElement('div', { className: 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 grid grid-cols-4 gap-1.5 w-72' },
          pages.map((page, i) =>
            React.createElement('button', {
              key: i,
              onClick: () => goToPage(i),
              className: `px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentPage === i ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`,
              style: currentPage === i ? { backgroundColor: settings.primaryColor } : undefined,
              title: pageLabel(page)
            }, pageShortLabel(page))
          )
        )
      )
    )
  );
}
