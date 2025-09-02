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

  const calendarDays = useMemo(() => getCalendarDays(month, year), [month, year]);
  const dayHeaders = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);

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
        <div className="month-grid">
          {dayHeaders.map((day) => (
            <div key={day} className="day-header">
              {day.slice(0, 3)}
            </div>
          ))}

          {calendarDays.map((day) => (
            <div key={`${day.date.getTime()}`} className="day-cell">
              <div
                className={`calendar-day ${
                  day.isToday ? 'today' : ''
                } ${
                  day.isCurrentMonth ? '' : 'outside-month'
                } ${
                  day.date.getDay() === 0 || day.date.getDay() === 6 ? 'weekend' : ''
                }`}
                onMouseEnter={(e) => handleDayHover(e, day)}
                onMouseLeave={handleDayLeave}
                onClick={() => handleDayClick(day)}
              >
                <span className="calendar-day-number">
                  {day.dayNumber}
                </span>

                {(() => {
                  const journalEntry = findJournalEntryForDate(journalEntries, day.date);
                  return journalEntry ? (
                    <>
                      <img
                        src={journalEntry.imgUrl.replace('w=150&h=150', 'w=56&h=56')}
                        alt="Entry"
                        className="journal-entry-thumbnail"
                        loading="lazy"
                      />
                      <div className="journal-entry-rating">
                        {'★'.repeat(Math.floor(journalEntry.rating))}
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            </div>
          ))}
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
