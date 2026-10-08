export interface AgendaSettings {
  year: number;
  coverImage: string;
  backImage: string;
  coverTitle: string;
  coverSubtitle: string;
  coverYearArabic: string;
  ownerName: string;
  ownerInfo: string;
  primaryColor: string;
  accentColor: string;
  saturdayBgColor: string;
  sundayBgColor: string;
  saturdayFontColor: string;
  sundayFontColor: string;
  weekdayFontColor: string;
  amBoxColor: string;
  soirBoxColor: string;
  fontStyle: string;
  showHijri: boolean;
  showWeekNumbers: boolean;
  weekStartsMonday: boolean;
}

export interface DayCell {
  day: number | null;
  dayOfWeek: number;
  date: Date | null;
  weekNumber: number | null;
  isToday: boolean;
  isWeekend: boolean;
  isCurrentMonth: boolean;
}

export interface MonthData {
  index: number;
  nameFr: string;
  nameAr: string;
  year: number;
  days: DayCell[];
  firstDayOfWeek: number;
  daysInMonth: number;
}

export interface AgendaPage {
  type: 'cover' | 'year-overview' | 'month' | 'back-cover' | 'blank';
  monthIndex?: number;
  monthData?: MonthData;
  dayStart?: number;
  dayEnd?: number;
}
