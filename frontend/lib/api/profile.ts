import { ExpandedUserProfile, SubmissionCalendar } from "../../types/type";

export async function fetchLeetCodeProfile(username: string): Promise<ExpandedUserProfile> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const BASE = `${API_URL}/api/leetcode/${username}`;

  // Fire all proxies concurrently
  const reqs = [
    fetch(`${BASE}`).catch(() => null),
    fetch(`${BASE}/solved`).catch(() => null),
    fetch(`${BASE}/badges`).catch(() => null),
    fetch(`${BASE}/language`).catch(() => null),
    fetch(`${BASE}/contest`).catch(() => null),
    fetch(`${BASE}/calendar`).catch(() => null)
  ];

  const results = await Promise.all(reqs);

  const [profileRes, solvedRes, badgesRes, langRes, contestRes, calendarRes] = await Promise.all(
    results.map(r => r && r.ok ? r.json() : null)
  );

  // Defensive extraction
  const profile = profileRes || {};
  const solved = solvedRes || {};
  const badgeData = badgesRes?.badges || []; 
  const languages = langRes?.language || [];
  const contestInfo = contestRes?.contestParticipation || []; 
  const calendarData = calendarRes?.submissionCalendar || "{}";
  
  const totalSolved = solved.solvedProblem || 0;
  const rating = contestRes?.contestRating || 0;
  const powerScore = Math.floor(rating * 1.5 + totalSolved * 5); 

  let calendarMap: SubmissionCalendar = {};
  try {
     const parsedCal = typeof calendarData === 'string' ? JSON.parse(calendarData) : calendarData;
     Object.keys(parsedCal).forEach(ts => {
        const dateStr = new Date(parseInt(ts) * 1000).toISOString().split('T')[0];
        calendarMap[dateStr] = (calendarMap[dateStr] || 0) + parsedCal[ts];
     });
  } catch (e) {
     console.warn("Calendar parse failed", e);
  }

  const rawContests = Array.isArray(contestInfo) ? contestInfo : [];

  return {
    username: profile.username || username,
    avatar: profile.avatar || 'https://assets.leetcode.com/users/default_avatar.jpg',
    powerScore: powerScore,
    totalSolved: totalSolved,
    easySolved: solved.easySolved || 0,
    mediumSolved: solved.mediumSolved || 0,
    hardSolved: solved.hardSolved || 0,
    totalEasy: 0,
    totalMedium: 0,
    totalHard: 0,
    languages: (Array.isArray(languages) ? languages : []).map(l => ({
        languageName: l.languageName,
        problemsSolved: l.problemsSolved
    })).sort((a,b) => b.problemsSolved - a.problemsSolved).slice(0, 4),
    contests: rawContests.map((c: any) => ({
        contestName: c.contest?.title || 'Contest',
        rating: Math.floor(c.rating || 0),
        ranking: c.ranking || 0,
        trend: (c.trendDirection === 'UP' ? 'up' : c.trendDirection === 'DOWN' ? 'down' : 'flat'),
        date: ''
    })),
    currentRating: Math.floor(contestRes?.contestRating || 0),
    ratingPercentile: parseFloat(contestRes?.contestTopPercentage || "100"),
    calendar: calendarMap,
    badges: badgeData.map((b: any, index: number) => ({
        id: b.id || String(index),
        name: b.name || b.displayName,
        iconUrl: b.icon || '',
        category: "Participant",
        creationDate: ''
    }))
  };
}
