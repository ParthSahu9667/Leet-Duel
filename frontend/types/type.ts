export interface LanguageStat {
  languageName: string;
  problemsSolved: number;
}

export interface ContestHistory {
  contestName: string;
  rating: number;
  ranking: number;
  trend: "up" | "down" | "flat";
  date: string;
}

export interface SubmissionCalendar {
  // Key represents a date 'YYYY-MM-DD', value represents number of active submissions
  [date: string]: number;
}

export interface Badge {
  id: string;
  name: string;
  iconUrl: string;
  category: "Knight" | "Guardian" | "Special" | "Participant";
  creationDate: string;
}

export interface ExpandedUserProfile {
  username: string;
  avatar: string;
  powerScore: number;
  
  // Progress Data
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  
  // Used to calculate max values for progress bars
  totalEasy: number;
  totalMedium: number;
  totalHard: number;

  // Widget specific data
  languages: LanguageStat[];
  contests: ContestHistory[];
  currentRating: number;
  ratingPercentile: number;
  calendar: SubmissionCalendar;
  badges: Badge[];
}
