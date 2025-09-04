import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CalendarMonth from './CalendarMonth';
import CalendarSkeleton from './CalendarSkeleton';
import StickyHeader from './StickyHeader';
import type { JournalEntryWithDate } from '../types/journal';

interface InfiniteCalendarProps {
  journalEntries: JournalEntryWithDate[];
}

interface SearchFilters {
  query: string;
  categories: string[];
  minRating: number;
  maxRating: number;
  dateFrom: Date | null;
  dateTo: Date | null;
}

interface MonthData {
  month: number;
  year: number;
  key: string;
}

const InfiniteCalendar: React.FC<InfiniteCalendarProps> = ({ journalEntries }) => {
  const [visibleMonths, setVisibleMonths] = useState<MonthData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(12);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    categories: [],
    minRating: 1,
    maxRating: 5,
    dateFrom: null,
    dateTo: null
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolledToInitialMonth = useRef(false);

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (node && visibleMonths.length > 0 && !hasScrolledToInitialMonth.current) {
      setTimeout(() => {
        const targetMonth = 8;
        const targetYear = 2025;
        const targetIndex = visibleMonths.findIndex(m => m.month === targetMonth && m.year === targetYear);
        if (targetIndex !== -1) {
          const monthElements = node.querySelectorAll('[data-month-key]');
          const targetElement = monthElements[targetIndex] as HTMLElement;
          if (targetElement && targetElement.offsetTop >= 0 && node.scrollHeight > 0) {
            const elementTop = targetElement.offsetTop;
            const headerHeight = 80;
            const scrollPosition = elementTop - headerHeight;
            node.scrollTo({
              top: scrollPosition,
              behavior: 'auto'
            });
            hasScrolledToInitialMonth.current = true;
          }
        }
      }, 0);
    }
  }, [visibleMonths]);

  function scrollToInitialMonth(attempt = 0) {
    const targetMonth = 8;
    const targetYear = 2025;
    if (!containerRef.current) return;
    const targetIndex = visibleMonths.findIndex(m => m.month === targetMonth && m.year === targetYear);
    if (targetIndex === -1) return;
    const monthElements = containerRef.current.querySelectorAll('[data-month-key]');
    const targetElement = monthElements[targetIndex] as HTMLElement;
    if (targetElement && targetElement.offsetTop >= 0 && containerRef.current.scrollHeight > 0) {
      const elementTop = targetElement.offsetTop;
      const headerHeight = 80;
      const scrollPosition = elementTop - headerHeight;
      containerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'auto'
      });
      hasScrolledToInitialMonth.current = true;
      setTimeout(() => {
        containerRef.current?.scrollTo({
          top: scrollPosition,
          behavior: 'auto'
        });
      }, 200);
    } else if (attempt < 30) {
      setTimeout(() => scrollToInitialMonth(attempt + 1), 50);
    }
  }

  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => {
      const matchesQuery = !searchFilters.query ||
        entry.description.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        entry.categories.some(cat => cat.toLowerCase().includes(searchFilters.query.toLowerCase()));

      const matchesCategories = searchFilters.categories.length === 0 ||
        entry.categories.some(cat => searchFilters.categories.includes(cat));

      const matchesRating = entry.rating >= searchFilters.minRating &&
                           entry.rating <= searchFilters.maxRating;

      const matchesDateFrom = !searchFilters.dateFrom ||
        entry.date >= searchFilters.dateFrom;

      const matchesDateTo = !searchFilters.dateTo ||
        entry.date <= searchFilters.dateTo;

      return matchesQuery && matchesCategories && matchesRating &&
             matchesDateFrom && matchesDateTo;
    });
  }, [journalEntries, searchFilters]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    journalEntries.forEach(entry => {
      entry.categories.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  }, [journalEntries]);

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
    const targetMonth = 8; // September (0-indexed)
    const targetYear = 2025;

    const months: MonthData[] = [];
    // Add previous months
    for (let i = 12; i >= 1; i--) {
      const date = new Date(targetYear, targetMonth - i, 1);
      months.push(getMonthData(date.getMonth(), date.getFullYear()));
    }
    // Add current month (September 2025)
    months.push(getMonthData(targetMonth, targetYear));
    // Add next months
    for (let i = 1; i <= 12; i++) {
      const date = new Date(targetYear, targetMonth + i, 1);
      months.push(getMonthData(date.getMonth(), date.getFullYear()));
    }
    setVisibleMonths(months);
    setCurrentMonthIndex(months.findIndex(m => m.month === targetMonth && m.year === targetYear));
  }, []);

  useEffect(() => {
    // Scroll to September 2025 only on initial render
    if (!hasScrolledToInitialMonth.current && visibleMonths.length > 0) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          scrollToInitialMonth();
        });
      }, 0);
    }
  }, [visibleMonths]);

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

  const scrollToMonth = useCallback((targetMonthIndex: number) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const monthElements = container.querySelectorAll('[data-month-key]');
    const targetElement = monthElements[targetMonthIndex] as HTMLElement;

    if (targetElement) {
      const elementTop = targetElement.offsetTop;
      const headerHeight = 80;
      const scrollPosition = elementTop - headerHeight;

      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (currentMonthIndex > 0) {
          const newIndex = Math.max(0, currentMonthIndex - 1);
          setCurrentMonthIndex(newIndex);
          scrollToMonth(newIndex);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        const newIndex = Math.min(visibleMonths.length - 1, currentMonthIndex + 1);
        setCurrentMonthIndex(newIndex);
        scrollToMonth(newIndex);
        break;
      case 'Home':
        event.preventDefault();
        setCurrentMonthIndex(0);
        scrollToMonth(0);
        break;
      case 'End':
        event.preventDefault();
        const lastIndex = visibleMonths.length - 1;
        setCurrentMonthIndex(lastIndex);
        scrollToMonth(lastIndex);
        break;
    }
  }, [currentMonthIndex, visibleMonths.length, scrollToMonth]);

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

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  if (visibleMonths.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4">
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
      
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-medium">
                {isSearchOpen ? 'Hide Filters' : 'Search & Filter'}
              </span>
              {filteredEntries.length !== journalEntries.length && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {filteredEntries.length}
                </span>
              )}
            </button>


          </div>

          {isSearchOpen && (
            <div className="mt-4 p-4 search-panel rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Text
                  </label>
                  <input
                    type="text"
                    placeholder="Search descriptions, categories..."
                    value={searchFilters.query}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                    className="search-input w-full px-3 py-2 rounded-md focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating Range
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={searchFilters.minRating}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                      className="search-input flex-1 px-2 py-2 rounded-md focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}★</option>
                      ))}
                    </select>
                    <span className="text-gray-500">to</span>
                    <select
                      value={searchFilters.maxRating}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, maxRating: Number(e.target.value) }))}
                      className="search-input flex-1 px-2 py-2 rounded-md focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}★</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  <select
                    multiple
                    value={searchFilters.categories}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setSearchFilters(prev => ({ ...prev, categories: values }));
                    }}
                    className="search-input w-full px-2 py-2 rounded-md focus:outline-none"
                    size={3}
                  >
                    {uniqueCategories.map((category: string) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={searchFilters.dateFrom?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setSearchFilters(prev => ({
                        ...prev,
                        dateFrom: e.target.value ? new Date(e.target.value) : null
                      }))}
                      className="search-input flex-1 px-2 py-2 text-sm rounded-md focus:outline-none"
                    />
                    <input
                      type="date"
                      value={searchFilters.dateTo?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setSearchFilters(prev => ({
                        ...prev,
                        dateTo: e.target.value ? new Date(e.target.value) : null
                      }))}
                      className="search-input flex-1 px-2 py-2 text-sm rounded-md focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSearchFilters({
                    query: '',
                    categories: [],
                    minRating: 1,
                    maxRating: 5,
                    dateFrom: null,
                    dateTo: null
                  })}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear all filters
                </button>

                <div className="text-sm text-gray-600">
                  Showing {filteredEntries.length} of {journalEntries.length} entries
                </div>
              </div>
              </div>
            )}
        </div>
          </div>
          
      <div
        ref={setContainerRef}
        className="h-screen overflow-y-auto scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
          {visibleMonths.map((monthData) => (
            <div 
              key={monthData.key} 
              className="px-2 sm:px-4 md:px-0"
              data-month-key={monthData.key}
            >
            <CalendarMonth
                month={monthData.month}
                year={monthData.year}
              journalEntries={filteredEntries}
              />
            </div>
          ))}
          
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-full max-w-4xl mx-auto px-4">
                <CalendarSkeleton />
              </div>
          </div>
        )}

        <div className="keyboard-hint">
          <div className="font-medium mb-1">Keyboard Shortcuts</div>
          <div className="text-xs space-y-1">
            <div>← → Navigate months</div>
            <div>Home/End First/Last month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfiniteCalendar;