import React, { useState } from 'react';
import { getCalendarDays, getMonthName } from '../utils/calendar';
import { findJournalEntryForDate, getRatingDisplay } from '../utils/journal';
import type { CalendarMonthProps } from '../types/calendar';
import type { JournalEntryWithDate } from '../types/journal';
import JournalTooltip from './JournalTooltip';

interface CalendarMonthPropsWithEntries extends CalendarMonthProps {
  journalEntries: JournalEntryWithDate[];
}

const CalendarMonth: React.FC<CalendarMonthPropsWithEntries> = ({ month, year, journalEntries }) => {
  const calendarDays = getCalendarDays(month, year);
  const monthName = getMonthName(month);
  
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const [tooltipState, setTooltipState] = useState<{
    isVisible: boolean;
    entry: JournalEntryWithDate | null;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    entry: null,
    position: { x: 0, y: 0 }
  });

  const handleDayHover = (event: React.MouseEvent, day: any) => {
    const journalEntry = findJournalEntryForDate(journalEntries, day.date);
    
    if (journalEntry) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipState({
        isVisible: true,
        entry: journalEntry,
        position: { x: rect.left, y: rect.top }
      });
    }
  };

  const handleDayLeave = () => {
    setTooltipState(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="relative max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="bg-gradient-to-r from-soft-purple to-soft-pink px-8 py-6 rounded-t-lg">
        <h2 className="text-3xl font-semibold text-gray-800 text-center">
          {monthName} {year}
        </h2>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="bg-cream-50 px-4 py-4 text-center text-base font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {calendarDays.map((day, index) => {
          const journalEntry = findJournalEntryForDate(journalEntries, day.date);
          const hasEntry = !!journalEntry;
          
          return (
            <div
              key={index}
              className={`
                relative aspect-square bg-white px-3 py-3 flex flex-col items-center justify-start text-base
                transition-all duration-200 cursor-pointer group
                ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                ${day.isToday ? 'bg-soft-purple text-white font-semibold' : ''}
                ${hasEntry ? 'shadow-md border-l-4 border-l-soft-purple bg-cream-25' : ''}
                hover:bg-cream-100
              `}
              onMouseEnter={(e) => handleDayHover(e, day)}
              onMouseLeave={handleDayLeave}
            >
              <div className="text-center font-medium mb-2">
                {day.dayNumber}
              </div>
              
              {hasEntry && journalEntry && (
                <div className="flex-1 w-full flex flex-col items-center gap-2">
                  <img
                    src={journalEntry.imgUrl}
                    alt="Hair care entry"
                    className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  
                  <div className="text-sm text-yellow-500 leading-none">
                    {getRatingDisplay(journalEntry.rating)}
                  </div>
                  
                  {journalEntry.categories && journalEntry.categories.length > 0 && (
                    <div className="text-xs bg-soft-purple text-purple-700 px-2 py-1 rounded-full text-center max-w-full truncate">
                      {journalEntry.categories[0]}
                    </div>
                  )}
                </div>
              )}
              
              {hasEntry && (
                <div className="absolute bottom-2 right-2 w-2 h-2 bg-soft-purple rounded-full opacity-75"></div>
              )}
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
  );
};

export default CalendarMonth;
