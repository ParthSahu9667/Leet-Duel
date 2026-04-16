import { Request, Response } from 'express';
import { fetchLeetCodeData } from '../utils/leetcode.graphql';

export const getAggregatedProfile = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        // Fetch user data via GraphQL
        const data = await fetchLeetCodeData(username as string);

        if (!data || !data.matchedUser) {
            return res.status(404).json({ error: `User ${username} not found.` });
        }

        const matchedUser = data.matchedUser;
        const submitStats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
        const profileInfo = matchedUser.profile;

        // Calculate solved metrics
        const totalSolved = submitStats.find((s: any) => s.difficulty === 'All')?.count || 0;
        const easySolved = submitStats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
        const mediumSolved = submitStats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
        const hardSolved = submitStats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

        // Get total question counts
        const allQuestions = data.allQuestionsCount || [];
        const totalEasy = allQuestions.find((q: any) => q.difficulty === 'Easy')?.count || 0;
        const totalMedium = allQuestions.find((q: any) => q.difficulty === 'Medium')?.count || 0;
        const totalHard = allQuestions.find((q: any) => q.difficulty === 'Hard')?.count || 0;

        // Contest metrics
        const contestInfo = data.userContestRanking;
        const rating = contestInfo?.rating || 0;
        const powerScore = Math.floor(rating * 1.5 + totalSolved * 5);
        // Calendar Parsing (SubmissionCalendar is a string like "{\"1712217600\": 2}")
        let calendarMap: Record<string, number> = {};
        if (matchedUser.submissionCalendar) {
            try {
                const parsedCal = JSON.parse(matchedUser.submissionCalendar);
                Object.keys(parsedCal).forEach((ts) => {
                    const dateStr = new Date(parseInt(ts) * 1000).toISOString().split('T')[0];
                    calendarMap[dateStr] = (calendarMap[dateStr] || 0) + parsedCal[ts];
                });
            } catch (e) {
                 console.warn(`Failed to parse submission calendar for ${username}`);
            }
        }

        // We can optionally use GraphQL directly if we absolutely need languageStats specifically, 
        // because `user` query in `leetcode-query` might not fetch language stats.
        // For now, we omit language stats or provide a default empty array. The frontend can handle it.
        const languages: any[] = []; 

        const aggregatedResult = {
            username: matchedUser.githubUrl ? username : username,
            avatar: profileInfo?.userAvatar || 'https://assets.leetcode.com/users/default_avatar.jpg',
            powerScore: powerScore,
            totalSolved: totalSolved,
            easySolved: easySolved,
            mediumSolved: mediumSolved,
            hardSolved: hardSolved,
            totalEasy,
            totalMedium,
            totalHard,
            languages: languages,
            contests: [] as any[], 
            currentRating: Math.floor(rating),
            ratingPercentile: parseFloat(String(contestInfo?.topPercentage || "100")),
            calendar: calendarMap,
            badges: (matchedUser.badges || []).map((b: any, index: number) => ({
                id: b.id || String(index),
                name: b.displayName || b.name,
                iconUrl: b.icon || '',
                category: "Participant",
                creationDate: ''
            }))
        };

        // If 'data.userContestRankingHistory' exists, we could map it to 'contests' array if needed.
        if (data.userContestRankingHistory) {
             const history = data.userContestRankingHistory.filter((c: any) => c.attended);
             aggregatedResult.contests = history.map((c: any) => ({
                 contestName: c.contest?.title || 'Contest',
                 rating: Math.floor(c.rating || 0),
                 ranking: c.ranking || 0,
                 trend: 'flat', // Hard to compute trend here without comparing to previous, default to flat
                 date: ''
             })).reverse().slice(0, 10); // recent 10 contests
        }

        return res.json(aggregatedResult);
    } catch (error: any) {
        console.error(`[GraphQL Error] against ${req.params.username}:`, error.message);
        return res.status(500).json({ error: 'Failed to contact LeetCode GraphQL service.' });
    }
};
