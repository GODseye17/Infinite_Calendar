import { parse, format } from 'date-fns';
import type { JournalEntry, JournalEntryWithDate } from '../types/journal';

export function parseJournalDate(dateString: string): Date {
  return parse(dateString, 'dd/MM/yyyy', new Date());
}

export function processJournalEntries(entries: JournalEntry[]): JournalEntryWithDate[] {
  return entries.map(entry => ({
    ...entry,
    date: parseJournalDate(entry.date),
    displayDate: format(parseJournalDate(entry.date), 'MMM dd, yyyy')
  }));
}

export function findJournalEntryForDate(
  entries: JournalEntryWithDate[], 
  targetDate: Date
): JournalEntryWithDate | undefined {
  return entries.find(entry => 
    entry.date.getDate() === targetDate.getDate() &&
    entry.date.getMonth() === targetDate.getMonth() &&
    entry.date.getFullYear() === targetDate.getFullYear()
  );
}

export function getRatingDisplay(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
}
