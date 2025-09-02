import React from 'react';

const CalendarSkeleton: React.FC = () => {
  return (
    <div className="relative max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 rounded-t-lg">
        <div className="h-8 sm:h-10 md:h-12 bg-gray-300 rounded w-48 mx-auto"></div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center"
          >
            <div className="h-4 sm:h-5 md:h-6 bg-gray-300 rounded w-full"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={i}
            className="relative bg-white px-1 sm:px-2 md:px-3 py-1 sm:py-2 md:py-3 flex flex-col items-center justify-start"
            style={{
              minHeight: '60px',
              aspectRatio: '1',
              minWidth: '44px'
            }}
          >
            <div className="h-4 sm:h-5 md:h-6 bg-gray-200 rounded w-6 sm:w-8 md:w-10 mb-1 sm:mb-2"></div>
            <div className="h-6 sm:h-8 md:h-10 w-6 sm:w-8 md:h-10 bg-gray-200 rounded-lg mb-1 sm:mb-2"></div>
            <div className="h-3 sm:h-4 w-8 sm:w-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarSkeleton;
