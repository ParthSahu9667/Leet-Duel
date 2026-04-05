import { ExpandedUserProfile } from "../types/type";

// Generates a mock 365-day calendar with realistic clustered activity
const generateMockCalendar = () => {
  const calendar: { [date: string]: number } = {};
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split("T")[0];

    // Simulate algorithmic bursts of activity (some weeks active, some flat)
    const isActivePeriod = Math.random() > 0.4;
    if (isActivePeriod) {
      calendar[dateString] = Math.floor(Math.random() * 8) + 1; // 1 to 8 submissions
    } else {
      calendar[dateString] = Math.random() > 0.8 ? 1 : 0; // Occasional single submissions
    }
  }
  return calendar;
};

export const mockUserProfile: ExpandedUserProfile = {
  username: "NeoScripter",
  avatar: "https://assets.leetcode.com/users/avatars/avatar_1701314959.png", // Example realistic avatar
  powerScore: 18450,

  totalSolved: 842,
  easySolved: 310,
  mediumSolved: 442,
  hardSolved: 90,

  totalEasy: 800,
  totalMedium: 1600,
  totalHard: 700,

  languages: [
    { languageName: "C++", problemsSolved: 512 },
    { languageName: "Python", problemsSolved: 210 },
    { languageName: "TypeScript", problemsSolved: 95 },
    { languageName: "Java", problemsSolved: 25 },
  ],

  currentRating: 2154,
  ratingPercentile: 98.2,

  contests: [
    {
      contestName: "Weekly Contest 380",
      rating: 1950,
      ranking: 1205,
      trend: "up",
      date: "2024-01-14",
    },
    {
      contestName: "Biweekly Contest 122",
      rating: 2010,
      ranking: 450,
      trend: "up",
      date: "2024-01-20",
    },
    {
      contestName: "Weekly Contest 381",
      rating: 1980,
      ranking: 2800,
      trend: "down",
      date: "2024-01-21",
    },
    {
      contestName: "Weekly Contest 382",
      rating: 2090,
      ranking: 210,
      trend: "up",
      date: "2024-01-28",
    },
    {
      contestName: "Weekly Contest 383",
      rating: 2154,
      ranking: 125,
      trend: "up",
      date: "2024-02-04",
    },
  ],

  calendar: generateMockCalendar(),

  badges: [
    {
      id: "b1",
      name: "100 Days Badge",
      iconUrl: "https://assets.leetcode.com/medals/100_days_2023.png",
      category: "Special",
      creationDate: "2023-12-01",
    },
    {
      id: "b2",
      name: "Knight",
      iconUrl: "https://leetcode.com/static/images/badges/2022/lg/2022-annual-100.png", // Example asset
      category: "Knight",
      creationDate: "2023-08-15",
    },
    {
      id: "b3",
      name: "Guardian",
      iconUrl: "https://leetcode.com/static/images/badges/dcc-2024-1.png",
      category: "Guardian",
      creationDate: "2024-01-10",
    },
    {
      id: "b4",
      name: "Feb LeetCoding Challenge",
      iconUrl: "https://assets.leetcode.com/static_assets/public/images/badges/dcc-2023-2.png",
      category: "Participant",
      creationDate: "2023-02-28",
    },
  ],
};
