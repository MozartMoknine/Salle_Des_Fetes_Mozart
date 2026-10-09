const DEFAULT_COVER_IMAGE =
  'https://images.pexels.com/photos/10559197/pexels-photo-10559197.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900';

const DEFAULT_BACK_IMAGE =
  'https://images.pexels.com/photos/27618082/pexels-photo-27618082.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900';

const COVER_IMAGES = [
  'https://images.pexels.com/photos/10559197/pexels-photo-10559197.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900',
  'https://images.pexels.com/photos/35058510/pexels-photo-35058510.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900',
  'https://images.pexels.com/photos/34982241/pexels-photo-34982241.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900',
  'https://images.pexels.com/photos/16960168/pexels-photo-16960168.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900',
  'https://images.pexels.com/photos/34982271/pexels-photo-34982271.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900',
];

const BACK_IMAGES = [
  'https://images.pexels.com/photos/27618082/pexels-photo-27618082.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900',
  'https://images.pexels.com/photos/7967623/pexels-photo-7967623.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900',
  'https://images.pexels.com/photos/4512777/pexels-photo-4512777.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900',
  'https://images.pexels.com/photos/18655050/pexels-photo-18655050.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900',
  'https://images.pexels.com/photos/33944151/pexels-photo-33944151.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900',
];

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const MONTHS_AR = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const MONTHS_FR_SHORT = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
];

const DAYS_FR = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi',
];

const DAYS_AR = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
];

const DAYS_FR_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

const SEASONS_FR = [
  { name: 'Hiver', nameAr: 'الشتاء', months: [0, 1] },
  { name: 'Printemps', nameAr: 'الربيع', months: [2, 3, 4] },
  { name: 'Été', nameAr: 'الصيف', months: [5, 6, 7] },
  { name: 'Automne', nameAr: 'الخريف', months: [8, 9, 10, 11] },
];

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter (Sans-serif)' },
  { value: 'Playfair Display, serif', label: 'Playfair (Serif)' },
  { value: 'Georgia, serif', label: 'Georgia (Serif)' },
  { value: 'Courier New, monospace', label: 'Courier (Mono)' },
  { value: 'Cairo, sans-serif', label: 'Cairo (Arabic)' },
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function generateMonthData(year, monthIndex, weekStartsMonday, showWeekNumbers) {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstDay = getFirstDayOfMonth(year, monthIndex);
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
  const cells = [];
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

function generateAllMonths(year, weekStartsMonday, showWeekNumbers) {
  return Array.from({ length: 12 }, (_, i) =>
    generateMonthData(year, i, weekStartsMonday, showWeekNumbers),
  );
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getHijriYear(gregorianYear) {
  return Math.round((gregorianYear - 622) * 33.05556);
}

const defaultSettings = {
  year: new Date().getFullYear() + 1,
  coverImage: DEFAULT_COVER_IMAGE,
  backImage: DEFAULT_BACK_IMAGE,
  coverTitle: 'Agenda',
  coverSubtitle: 'Organisateur Personnel',
  coverYearArabic: 'الأجندة',
  ownerName: '',
  ownerInfo: '',
  primaryColor: '#1a3a2e',
  accentColor: '#c9a84c',
  saturdayBgColor: '#d4e8f0',
  sundayBgColor: '#fce4dc',
  saturdayFontColor: '#111111',
  sundayFontColor: '#111111',
  weekdayFontColor: '#111111',
  amBoxColor: '#e8f5e9',
  soirBoxColor: '#fff3e0',
  fontStyle: 'Inter, sans-serif',
  showHijri: true,
  showWeekNumbers: true,
  weekStartsMonday: true,
};
