import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { getCalendarDays, getMonthName } from '../utils/calendar';
import { findJournalEntryForDate, getRatingDisplay } from '../utils/journal';
import { memoryManager } from '../utils/memory';
import type { CalendarMonthProps } from '../types/calendar';
import type { JournalEntryWithDate } from '../types/journal';
import JournalTooltip from './JournalTooltip';
import JournalViewer from './JournalViewer';

interface CalendarMonthPropsWithEntries extends CalendarMonthProps {
  journalEntries: JournalEntryWithDate[];
}

const CalendarMonth: React.FC<CalendarMonthPropsWithEntries> = React.memo(({ month, year, journalEntries }) => {
  const [tooltipState, setTooltipState] = useState<{
    isVisible: boolean;
    entry: JournalEntryWithDate | null;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    entry: null,
    position: { x: 0, y: 0 }
  });

  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    initialEntryIndex: number;
  }>({
    isOpen: false,
    initialEntryIndex: 0
  });

  const calendarDays = useMemo(() => getCalendarDays(month, year), [month, year]);
  const monthName = useMemo(() => getMonthName(month), [month]);
  const dayHeaders = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  const monthEntries = useMemo(() => {
    return journalEntries.filter(entry => {
      const entryMonth = entry.date.getMonth();
      const entryYear = entry.date.getFullYear();
      return entryMonth === month && entryYear === year;
    });
  }, [journalEntries, month, year]);

  useEffect(() => {
    const imageUrls = monthEntries.map(entry => entry.imgUrl);
    if (imageUrls.length > 0) {
      memoryManager.preloadImage(imageUrls[0]);
    }
  }, [monthEntries]);

  const handleDayHover = useCallback((event: React.MouseEvent, day: any) => {
    if (window.innerWidth <= 768) return;
    
    const journalEntry = findJournalEntryForDate(journalEntries, day.date);

    if (journalEntry) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipState({
        isVisible: true,
        entry: journalEntry,
        position: { x: rect.left, y: rect.top }
      });
    }
  }, [journalEntries]);

  const handleDayLeave = useCallback(() => {
    setTooltipState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const handleDayClick = useCallback((day: any) => {
    const journalEntry = findJournalEntryForDate(journalEntries, day.date);
    
    if (journalEntry) {
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      const sortedEntries = [...journalEntries].sort((a, b) => a.date.getTime() - b.date.getTime());
      const entryIndex = sortedEntries.findIndex(entry => 
        entry.date.getTime() === journalEntry.date.getTime()
      );
      
      setViewerState({
        isOpen: true,
        initialEntryIndex: entryIndex >= 0 ? entryIndex : 0
      });
    }
  }, [journalEntries]);

  const closeViewer = useCallback(() => {
    setViewerState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const renderDayCell = useCallback((day: any, index: number) => {
    const journalEntry = findJournalEntryForDate(journalEntries, day.date);
    const hasEntry = !!journalEntry;
    
    return (
      <div
        key={index}
        className={`
          relative bg-white px-1 sm:px-2 md:px-3 py-1 sm:py-2 md:py-3 flex flex-col items-center justify-start
          transition-all duration-200 group touch-manipulation will-change-transform
          ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
          ${day.isToday ? 'bg-soft-purple text-white font-semibold' : ''}
          ${hasEntry ? 'shadow-md border-l-4 border-l-soft-purple bg-cream-25 cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]' : ''}
          ${!hasEntry ? 'hover:bg-cream-100' : ''}
        `}
        style={{
          minHeight: '60px',
          aspectRatio: '1',
          minWidth: '44px'
        }}
        onMouseEnter={(e) => handleDayHover(e, day)}
        onMouseLeave={handleDayLeave}
        onClick={() => handleDayClick(day)}
      >
        <div className="text-center font-medium mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
          {day.dayNumber}
        </div>
        
        {hasEntry && journalEntry && (
          <div className="flex-1 w-full flex flex-col items-center gap-1 sm:gap-2">
            <img
              src={journalEntry.imgUrl.replace('w=150&h=150', 'w=80&h=80')}
              alt="Hair care entry"
              className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg object-cover border-2 border-white shadow-md"
              loading="lazy"
              onLoad={() => {
                memoryManager.preloadImage(journalEntry.imgUrl);
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            
            <div className="text-xs sm:text-sm text-yellow-500 leading-none">
              {getRatingDisplay(journalEntry.rating)}
            </div>
            
            {journalEntry.categories && journalEntry.categories.length > 0 && (
              <div className="text-xs bg-soft-purple text-purple-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-center max-w-full truncate hidden sm:block">
                {journalEntry.categories[0]}
              </div>
            )}
          </div>
        )}
        
        {hasEntry && (
          <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-soft-purple rounded-full opacity-75"></div>
        )}
        
        {hasEntry && (
          <div className="absolute inset-0 border-2 border-transparent rounded-lg group-hover:border-soft-purple transition-colors duration-200 pointer-events-none"></div>
        )}
      </div>
    );
  }, [journalEntries, handleDayHover, handleDayLeave, handleDayClick]);

  return (
    <>
      <div className="relative max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-soft-purple to-soft-pink px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 rounded-t-lg">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 text-center">
            {monthName} {year}
          </h2>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {dayHeaders.map((day) => (
            <div
              key={day}
              className="bg-cream-50 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-xs sm:text-sm md:text-base font-medium text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {calendarDays.map((day, index) => renderDayCell(day, index))}
        </div>

        {tooltipState.entry && (
          <JournalTooltip
            entry={tooltipState.entry}
            isVisible={tooltipState.isVisible}
            position={tooltipState.position}
          />
        )}
      </div>

      <JournalViewer
        isOpen={viewerState.isOpen}
        onClose={closeViewer}
        entries={journalEntries}
        initialEntryIndex={viewerState.initialEntryIndex}
      />
    </>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.month === nextProps.month &&
    prevProps.year === nextProps.year &&
    prevProps.journalEntries === nextProps.journalEntries
  );
});

CalendarMonth.displayName = 'CalendarMonth';

export default CalendarMonth;
