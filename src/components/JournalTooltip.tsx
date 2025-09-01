import React from 'react';
import type { JournalEntryWithDate } from '../types/journal';

interface JournalTooltipProps {
  entry: JournalEntryWithDate;
  isVisible: boolean;
  position: { x: number; y: number };
}

const JournalTooltip: React.FC<JournalTooltipProps> = ({ entry, isVisible, position }) => {
  if (!isVisible) return null;

  return (
    <div
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <img
          src={entry.imgUrl}
          alt="Hair care"
          className="w-8 h-8 rounded-full object-cover"
          loading="lazy"
        />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800">{entry.displayDate}</div>
          <div className="text-xs text-yellow-500">{'★'.repeat(Math.floor(entry.rating))}</div>
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-3">
        {entry.description}
      </p>
      {entry.categories && entry.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.categories.slice(0, 3).map(category => (
            <span
              key={category}
              className="text-xs bg-soft-purple text-purple-700 px-2 py-1 rounded-full"
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
