import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { getCalendarDays } from '../utils/calendar';
import { findJournalEntryForDate } from '../utils/journal';
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

  const monthDays = useMemo(() => {
    return getCalendarDays(month, year).filter(d => d.isCurrentMonth);
  }, [month, year]);
  const firstDayOfWeek = useMemo(() => new Date(year, month, 1).getDay(), [month, year]);

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



  return (
    <>
      <div className="max-w-4xl mx-auto fade-in">
        <div className="month-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {monthDays.map((day, index) => {
            const journalEntry = findJournalEntryForDate(journalEntries, day.date);
            const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
            const isActiveMonth = day.date.getMonth() === month && day.date.getFullYear() === year;
            const isSeptember2025 = day.date.getMonth() === 8 && day.date.getFullYear() === 2025;
            return (
              <div 
                key={`${day.date.getTime()}`} 
                className="day-cell"
                style={{ 
                  gridColumnStart: index === 0 ? firstDayOfWeek + 1 : 'auto'
                }}
              >
                <div
                  className={`calendar-day ${
                    day.isToday ? 'today' : ''
                  } ${
                    isWeekend ? 'weekend' : ''
                  }${
                    isSeptember2025 ? 'september-2025' : 'other-month'
                  }
                   ${
                    isActiveMonth ? 'active-month' : 'other-month'
                  }`}
                  onMouseEnter={(e) => handleDayHover(e, day)}
                  onMouseLeave={handleDayLeave}
                  onClick={() => handleDayClick(day)}
                >
                  <span className="calendar-day-number">
                    {day.dayNumber}
                  </span>

                  {journalEntry ? (
                    <>
                      <div className="rating-row">
                        {'★'.repeat(Math.round(journalEntry.rating))}
                      </div>
                      <img
                        src={journalEntry.imgUrl.replace('w=150&h=150', 'w=160&h=160')}
                        alt="Entry"
                        className="grid-entry-image"
                        loading="lazy"
                      />
                      <div className="chip-row">
                        {journalEntry.categories.slice(0, 2).map((cat, idx) => (
                          <div key={`${cat}-${idx}`} className={`chip ${idx === 0 ? 'chip-a' : 'chip-b'}`}>
                            {cat.length <= 2 ? cat : cat.slice(0, 2)}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
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
