import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getMonthName } from '../utils/calendar';

interface StickyHeaderProps {
  visibleMonths: Array<{ month: number; year: number; key: string }>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface MonthVisibility {
  month: number;
  year: number;
  key: string;
  visibleArea: number;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({ visibleMonths, containerRef }) => {
  const [currentMonth, setCurrentMonth] = useState<{ month: number; year: number }>({ month: 0, year: 2025 });
  
  const lastScrollTop = useRef(0);
  const lastVisibleMonth = useRef<string>('');
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const calculateMonthVisibility = useCallback((monthElement: HTMLDivElement): number => {
    const rect = monthElement.getBoundingClientRect();
    
    const viewportHeight = window.innerHeight;
    const monthTop = rect.top;
    const monthBottom = rect.bottom;
    
    const visibleTop = Math.max(monthTop, 0);
    const visibleBottom = Math.min(monthBottom, viewportHeight);
    
    if (visibleBottom <= visibleTop) return 0;
    
    return visibleBottom - visibleTop;
  }, []);

  const findMostVisibleMonth = useCallback((): MonthVisibility | null => {
    let mostVisible: MonthVisibility | null = null;
    let maxVisibleArea = 0;
    
    visibleMonths.forEach((monthData) => {
      const monthElement = document.querySelector(`[data-month-key="${monthData.key}"]`) as HTMLDivElement;
      if (monthElement) {
        const visibleArea = calculateMonthVisibility(monthElement);
        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          mostVisible = {
            month: monthData.month,
            year: monthData.year,
            key: monthData.key,
            visibleArea
          };
        }
      }
    });
    
    return mostVisible;
  }, [visibleMonths, calculateMonthVisibility]);

  const updateHeader = useCallback((scrollTop: number) => {
    const mostVisible = findMostVisibleMonth();
    
    if (!mostVisible || mostVisible.visibleArea < 100) return;
    
    const newMonthKey = `${mostVisible.year}-${mostVisible.month}`;
    
    if (newMonthKey !== lastVisibleMonth.current) {
      setTimeout(() => {
        setCurrentMonth({ month: mostVisible.month, year: mostVisible.year });
      }, 150);

      lastVisibleMonth.current = newMonthKey;
    }
    
    lastScrollTop.current = scrollTop;
  }, [findMostVisibleMonth]);

  const debouncedUpdateHeader = useCallback((scrollTop: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updateHeader(scrollTop);
    });
  }, [updateHeader]);

  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    debouncedUpdateHeader(target.scrollTop);
  }, [debouncedUpdateHeader]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll, containerRef]);

  useEffect(() => {
    if (visibleMonths.length > 0) {
      const currentMonthData = visibleMonths.find(
        month => month.month === new Date().getMonth() && month.year === new Date().getFullYear()
      ) || visibleMonths[Math.floor(visibleMonths.length / 2)];
      
      if (currentMonthData) {
        setCurrentMonth({ month: currentMonthData.month, year: currentMonthData.year });
        lastVisibleMonth.current = `${currentMonthData.year}-${currentMonthData.month}`;
      }
    }
  }, [visibleMonths]);

  const monthName = useMemo(() => getMonthName(currentMonth.month), [currentMonth.month]);
  


  return (
    <div className="month-header">
      <div className="max-w-4xl mx-auto px-4">
        {monthName} {currentMonth.year}
      </div>
    </div>
  );
};

export default StickyHeader;
