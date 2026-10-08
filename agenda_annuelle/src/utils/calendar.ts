import type { DayCell, MonthData } from '@/types';
import { MONTHS_FR, MONTHS_AR } from '@/constants/calendar';

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function generateMonthData(
  year: number,
  monthIndex: number,
  weekStartsMonday: boolean = true,
  showWeekNumbers: boolean = true,
): MonthData {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstDay = getFirstDayOfMonth(year, monthIndex);
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === monthIndex;

  const cells: DayCell[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    cells.push({
      day,
      dayOfWeek: date.getDay(),
      date,
      weekNumber: showWeekNumbers ? getWeekNumber(date) : null,
      isToday: isThisMonth && today.getDate() === day,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isCurrentMonth: true,
    });
  }

  return {
    index: monthIndex,
    nameFr: MONTHS_FR[monthIndex],
    nameAr: MONTHS_AR[monthIndex],
    year,
    days: cells,
    firstDayOfWeek: firstDay,
    daysInMonth,
  };
}

export function generateAllMonths(
  year: number,
  weekStartsMonday: boolean = true,
  showWeekNumbers: boolean = true,
): MonthData[] {
  return Array.from({ length: 12 }, (_, i) =>
    generateMonthData(year, i, weekStartsMonday, showWeekNumbers),
  );
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getHijriYear(gregorianYear: number): number {
  return Math.round((gregorianYear - 622) * 33.05556);
}
