export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayNumber: number;
}

export interface CalendarMonthProps {
  month: number;
  year: number;
}
