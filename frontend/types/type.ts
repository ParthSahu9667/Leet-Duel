import { ReactNode } from "react";

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

export interface RankedUser {
  username: string;
  avatar: string;
  powerScore?: number;
  solvedProblem: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  avgQuestionsPerDay?: number;
  error: string | null;
}

export interface LeaderboardTableProps {
  users: RankedUser[];
  onRemoveUser: (username: string) => void;
}

export interface WidgetProps {
  user: ExpandedUserProfile;
}

export interface CardTiltInnerProps {
  children: ReactNode;
  className?: string;
  senstivity?: number;
}

export interface SearchBarProps {
  usernames: string[];
  setUsernames: React.Dispatch<React.SetStateAction<string[]>>;
  onSearch: (users: string) => void;
  isLoading: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  hue: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
  maxLife: number;
  hue: number;
}

export interface CustomDropdownProps {
  value: number | string;
  options: { label: string; value: number | string }[];
  onChange: (val: any) => void;
}