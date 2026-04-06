import { ExpandedUserProfile, SubmissionCalendar } from "../../types/type";

export async function fetchLeetCodeProfile(username: string): Promise<ExpandedUserProfile> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const BASE = `${API_URL}/api/leetcode/profile/${username}`;

  try {
    const res = await fetch(BASE);
    
    if (!res.ok) {
        console.error(`Failed to fetch profile for ${username}: ${res.statusText}`);
        return getEmptyProfile(username);
    }
    
    const data = await res.json();
    return data as ExpandedUserProfile;
  } catch (err: any) {
    console.error(`Error fetching profile for ${username}:`, err);
    return getEmptyProfile(username);
  }
}

function getEmptyProfile(username: string): ExpandedUserProfile {
    return {
        username: username,
        avatar: 'https://assets.leetcode.com/users/default_avatar.jpg',
        powerScore: 0,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        totalEasy: 0,
        totalMedium: 0,
        totalHard: 0,
        languages: [],
        contests: [],
        currentRating: 0,
        ratingPercentile: 100,
        calendar: {},
        badges: []
    };
}
