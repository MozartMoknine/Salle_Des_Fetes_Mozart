import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { AgendaSettings, AgendaPage } from '@/types';
import { generateAllMonths } from '@/utils/calendar';
import CoverPage from '@/components/pages/CoverPage';
import YearOverviewPage from '@/components/pages/YearOverviewPage';
import MonthPage from '@/components/pages/MonthPage';
import BackCoverPage from '@/components/pages/BackCoverPage';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Settings,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface Props {
  settings: AgendaSettings;
  onOpenSettings: () => void;
}

export default function AgendaViewer({ settings, onOpenSettings }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [printMode, setPrintMode] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const months = useMemo(
    () =>
      generateAllMonths(
        settings.year,
        settings.weekStartsMonday,
        settings.showWeekNumbers,
      ),
    [settings.year, settings.weekStartsMonday, settings.showWeekNumbers],
  );

  const pages: AgendaPage[] = useMemo(() => {
    const result: AgendaPage[] = [{ type: 'cover' }, { type: 'blank' }, { type: 'year-overview' }];

    months.forEach((month, monthIndex) => {
      const total = month.daysInMonth;
      if (total === 31) {
        const starts = [1, 7, 13, 19, 25, 29];
        starts.forEach((start, i) => {
          const end = i === 4 ? 28 : i === 5 ? 31 : start + 5;
          result.push({
            type: 'month',
            monthIndex,
            monthData: month,
            dayStart: start,
            dayEnd: Math.min(end, total),
          });
        });
      } else {
        for (let dayStart = 1; dayStart <= total; dayStart += 6) {
          result.push({
            type: 'month',
            monthIndex,
            monthData: month,
            dayStart,
            dayEnd: Math.min(dayStart + 5, total),
          });
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

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
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

  const renderPage = (page: AgendaPage, key: string) => {
    switch (page.type) {
      case 'cover':
        return (
          <div key={key} className="print-page">
            <CoverPage settings={settings} />
          </div>
        );
      case 'year-overview':
        return (
          <div key={key} className="print-page">
            <YearOverviewPage settings={settings} months={months} />
          </div>
        );
      case 'month':
        return (
          <div key={key} className="print-page">
            <MonthPage
              settings={settings}
              monthData={page.monthData!}
              dayStart={page.dayStart!}
              dayEnd={page.dayEnd!}
            />
          </div>
        );
      case 'back-cover':
        return (
          <div key={key} className="print-page">
            <BackCoverPage settings={settings} />
          </div>
        );
      case 'blank':
        return (
          <div key={key} className="print-page">
            <div className="a5-page bg-white" />
          </div>
        );
    }
  };

  const renderCurrentPage = () => {
    const page = pages[currentPage];
    switch (page.type) {
      case 'cover':
        return <CoverPage settings={settings} />;
      case 'year-overview':
        return <YearOverviewPage settings={settings} months={months} />;
      case 'month':
        return (
          <MonthPage
            settings={settings}
            monthData={page.monthData!}
            dayStart={page.dayStart!}
            dayEnd={page.dayEnd!}
          />
        );
      case 'back-cover':
        return <BackCoverPage settings={settings} />;
      case 'blank':
        return <div className="a5-page bg-white" />;
    }
  };

  const pageLabel = (page: AgendaPage): string => {
    switch (page.type) {
      case 'cover': return 'Couverture';
      case 'year-overview': return 'Vue annuelle';
      case 'month':
        return `${page.monthData!.nameFr} ${page.dayStart}–${page.dayEnd}`;
      case 'back-cover': return 'Dos';
      case 'blank': return 'Page blanche';
    }
  };

  if (printMode) {
    return (
      <div ref={printRef} className="print-root">
        {pages.map((page, i) => renderPage(page, `print-${i}`))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top toolbar */}
      <div className="no-print bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-800 leading-tight">
              {settings.coverTitle} {settings.year}
            </h1>
            <p className="text-xs text-gray-400 leading-tight">
              {pageLabel(pages[currentPage])}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Enregistrer PDF</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings size={15} />
            <span className="hidden sm:inline">Paramètres</span>
          </button>
        </div>
      </div>

      {/* Main viewer area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative no-print" style={{ backgroundColor: '#e8e4dc' }}>
        {/* Left nav */}
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Page display */}
        <div
          className="relative shadow-2xl rounded-sm overflow-hidden"
          style={{
            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))',
          }}
        >
          <div className="page-enter">
            {renderCurrentPage()}
          </div>
        </div>

        {/* Right nav */}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Bottom navigation */}
      <div className="no-print bg-white border-t border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-30"
        >
          <ChevronLeft size={16} />
          Précédent
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">
            {currentPage + 1} / {totalPages}
          </span>
          <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((currentPage + 1) / totalPages) * 100}%`,
                backgroundColor: settings.primaryColor,
              }}
            />
          </div>
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-30"
        >
          Suivant
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Quick month jump - floating */}
      <div className="no-print fixed bottom-16 left-1/2 -translate-x-1/2 z-30">
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center gap-1.5 px-4 py-2 rounded-full bg-white shadow-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Calendar size={14} />
            Aller à
            <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
          </summary>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 grid grid-cols-4 gap-1.5 w-72">
            {pages.map((page, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentPage === i
                    ? 'text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={
                  currentPage === i
                    ? { backgroundColor: settings.primaryColor }
                    : undefined
                }
                title={pageLabel(page)}
              >
                {page.type === 'month' && page.monthData
                  ? `${page.monthData.nameFr.substring(0, 3)} ${page.dayStart}`
                  : page.type === 'cover'
                  ? 'Couv'
                  : page.type === 'year-overview'
                  ? 'Année'
                  : page.type === 'blank'
                  ? 'Vide'
                  : 'Dos'}
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
