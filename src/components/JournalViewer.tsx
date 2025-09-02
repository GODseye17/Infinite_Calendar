import React, { useState, useEffect, useRef } from 'react';
import { motion, type PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type { JournalEntryWithDate } from '../types/journal';

interface JournalViewerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntryWithDate[];
  initialEntryIndex: number;
}

const JournalViewer: React.FC<JournalViewerProps> = ({ 
  isOpen, 
  onClose, 
  entries, 
  initialEntryIndex 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialEntryIndex);
  const [direction, setDirection] = useState(0);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const xInput = [0, 0, 0];
  const yInput = [0, 0, 0];
  
  const xOutput = useTransform(x, xInput, yInput);
  const yOutput = useTransform(y, yInput, yInput);
  
  const dragEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  const currentEntry = sortedEntries[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialEntryIndex);
  }, [initialEntryIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, currentIndex, sortedEntries.length]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < sortedEntries.length - 1) {
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDragEnd = (_event: any, info: PanInfo) => {
    const threshold = window.innerWidth <= 768 ? 80 : 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0 && currentIndex > 0) {
        goToPrevious();
      } else if (info.offset.x < 0 && currentIndex < sortedEntries.length - 1) {
        goToNext();
      }
    }
    
    if (Math.abs(info.offset.y) > threshold) {
      onClose();
    }
    
    x.set(0);
    y.set(0);
  };

  const handleDragStart = () => {
    if (dragEndTimeout.current) {
      clearTimeout(dragEndTimeout.current);
    }
  };

  const handleDrag = (_event: any, info: PanInfo) => {
    x.set(info.offset.x);
    y.set(info.offset.y);
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < sortedEntries.length - 1;

  if (!isOpen || !currentEntry) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4 safe-area-top safe-area-bottom"
        onClick={onClose}
      >
        <motion.div
          ref={containerRef}
          className="relative w-full max-w-sm sm:max-w-lg md:max-w-2xl max-h-[85vh] sm:max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <motion.div
            key={currentEntry.key || currentIndex}
            initial={{ x: direction * 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ x: xOutput, y: yOutput }}
            className="w-full"
          >
            <div className="relative">
              <img
                src={currentEntry.imgUrl.replace('w=150&h=150', 'w=400&h=300')}
                alt="Hair care entry"
                className="w-full h-48 sm:h-56 md:h-64 object-cover"
                loading="lazy"
              />
              
              <button
                onClick={onClose}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-gray-700 hover:bg-opacity-100 transition-all duration-200 shadow-lg touch-manipulation"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                  {format(currentEntry.date, 'MMMM d, yyyy')}
                </h2>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
                        i < Math.floor(currentEntry.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-xs sm:text-sm text-gray-600">
                    {currentEntry.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {currentEntry.categories && currentEntry.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                  {currentEntry.categories.map((category) => (
                    <span
                      key={category}
                      className="px-2 sm:px-3 py-1 bg-soft-purple text-purple-700 text-xs sm:text-sm rounded-full font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
                {currentEntry.description}
              </p>
            </div>
          </motion.div>

          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-1 sm:gap-2">
              {sortedEntries.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                    index === currentIndex ? 'bg-soft-purple' : 'bg-gray-300'
                  }`}
                  animate={{
                    scale: index === currentIndex ? 1.2 : 1,
                    opacity: index === currentIndex ? 1 : 0.5
                  }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
          </div>

          <div className="absolute inset-y-0 left-0 flex items-center">
            <button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className={`p-2 sm:p-3 rounded-r-lg transition-all duration-200 touch-manipulation ${
                canGoPrevious
                  ? 'bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className={`p-2 sm:p-3 rounded-l-lg transition-all duration-200 touch-manipulation ${
                canGoNext
                  ? 'bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 text-xs sm:text-sm text-white bg-black bg-opacity-50 px-2 sm:px-3 py-1 rounded-full">
            {currentIndex + 1} of {sortedEntries.length}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JournalViewer;
