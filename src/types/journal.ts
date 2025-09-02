export interface JournalEntry {
  imgUrl: string;
  rating: number;
  categories: string[];
  date: string;
  description: string;
}

export interface JournalEntryWithDate extends Omit<JournalEntry, 'date'> {
  date: Date;
  displayDate: string;
  key?: string;
}
