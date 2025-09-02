import React from 'react';

const CalendarSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="month-grid animate-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="day-header">
            <div className="h-3 bg-gray-300 rounded w-8 mx-auto"></div>
          </div>
        ))}

        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="day-cell">
            <div className="flex items-start justify-start p-2">
              <div className="h-4 w-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-7 w-7 bg-gray-300 rounded-full ml-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarSkeleton;
