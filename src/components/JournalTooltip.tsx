import React from 'react';
import type { JournalEntryWithDate } from '../types/journal';

interface JournalTooltipProps {
  entry: JournalEntryWithDate;
  isVisible: boolean;
  position: { x: number; y: number };
}

const JournalTooltip: React.FC<JournalTooltipProps> = ({ entry, isVisible, position }) => {
  if (!isVisible || window.innerWidth <= 768) return null;

  return (
    <div
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={entry.imgUrl}
          alt="Entry"
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
          loading="lazy"
        />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800">{entry.displayDate}</div>
          <div className="text-xs text-yellow-500 mt-1">
            {'★'.repeat(Math.floor(entry.rating))}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-2">
        {entry.description.length > 100
          ? entry.description.substring(0, 100) + '...'
          : entry.description
        }
      </p>

      {entry.categories && entry.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.categories.slice(0, 2).map(category => (
            <span
              key={category}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalTooltip;
