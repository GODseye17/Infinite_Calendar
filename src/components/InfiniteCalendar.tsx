import React, { useState, useEffect, useRef, useCallback } from 'react';
import CalendarMonth from './CalendarMonth';
import CalendarSkeleton from './CalendarSkeleton';
import StickyHeader from './StickyHeader';
import type { JournalEntryWithDate } from '../types/journal';

interface InfiniteCalendarProps {
  journalEntries: JournalEntryWithDate[];
}

interface MonthData {
  month: number;
  year: number;
  key: string;
}

const InfiniteCalendar: React.FC<InfiniteCalendarProps> = ({ journalEntries }) => {
  const [visibleMonths, setVisibleMonths] = useState<MonthData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const generateMonthKey = useCallback((month: number, year: number) => `${year}-${month}`, []);

  const getMonthData = useCallback((month: number, year: number): MonthData => ({
    month,
    year,
    key: generateMonthKey(month, year)
  }), [generateMonthKey]);

  const calculateNextMonth = useCallback((month: number, year: number): { month: number; year: number } => {
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth >= 12) {
      nextMonth = 0;
      nextYear++;
    }
    return { month: nextMonth, year: nextYear };
  }, []);

  const calculatePrevMonth = useCallback((month: number, year: number): { month: number; year: number } => {
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }
    return { month: prevMonth, year: prevYear };
  }, []);

  useEffect(() => {
    const months: MonthData[] = [];
    for (let i = -3; i <= 3; i++) {
      let month = currentMonth + i;
      let year = currentYear;

      if (month < 0) {
        month += 12;
        year--;
      } else if (month >= 12) {
        month -= 12;
        year++;
      }

      months.push(getMonthData(month, year));
    }
    setVisibleMonths(months);
  }, []);

  const addMonthsToTop = useCallback(() => {
    setVisibleMonths(prev => {
      if (prev.length === 0) return prev;

      const newMonths: MonthData[] = [];
      const firstMonth = prev[0];
      let { month, year } = firstMonth;

      for (let i = 0; i < 6; i++) {
        const prevMonthData = calculatePrevMonth(month, year);
        month = prevMonthData.month;
        year = prevMonthData.year;
        newMonths.unshift(getMonthData(month, year));
      }

      const result = [...newMonths, ...prev];

      return result.slice(-50);
    });
  }, [calculatePrevMonth, getMonthData]);

  const addMonthsToBottom = useCallback(() => {
    setVisibleMonths(prev => {
      if (prev.length === 0) return prev;

      const newMonths: MonthData[] = [];
      const lastMonth = prev[prev.length - 1];
      let { month, year } = lastMonth;

      for (let i = 0; i < 6; i++) {
        const nextMonthData = calculateNextMonth(month, year);
        month = nextMonthData.month;
        year = nextMonthData.year;
        newMonths.push(getMonthData(month, year));
      }

      const result = [...prev, ...newMonths];

      return result.slice(-50);
    });
  }, [calculateNextMonth, getMonthData]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollTop + clientHeight > scrollHeight - 500) {
      setIsLoading(true);
      addMonthsToBottom();
      setTimeout(() => setIsLoading(false), 200);
    }

    if (scrollTop < 500 && visibleMonths.length > 10) {
      setIsLoading(true);
      addMonthsToTop();
      setTimeout(() => setIsLoading(false), 200);
    }
  }, [isLoading, addMonthsToBottom, addMonthsToTop, visibleMonths.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  if (visibleMonths.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center safe-area-top">
        <div className="w-full max-w-6xl mx-auto px-4">
          <CalendarSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <StickyHeader
        visibleMonths={visibleMonths}
        containerRef={containerRef}
      />

      <div
        ref={containerRef}
        className="h-screen overflow-y-auto scroll-smooth pt-16 sm:pt-20"
      >
        {visibleMonths.map((monthData) => (
          <div
            key={monthData.key}
            className="mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4 md:px-0"
            data-month-key={monthData.key}
          >
            <CalendarMonth
              month={monthData.month}
              year={monthData.year}
              journalEntries={journalEntries}
            />
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-full max-w-6xl mx-auto px-4">
              <CalendarSkeleton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniteCalendar;
