import { Request, Response } from 'express';
import { LeetCode } from 'leetcode-query';

const leetcode = new LeetCode();

export const getAggregatedProfile = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        // Fetch user data via LeetCode Query
        const user = await leetcode.user(username as string);

        // If the user doesn't exist or we got an error, handle it gracefully
        if (!user || user.matchedUser === null) {
            return res.status(404).json({ error: `User ${username} not found.` });
        }

        // Fetch contest info
        // The user() call doesn't seem to natively expose contest rating/ranking history in the same fetch
        // We can fetch user_contest_info separately. It might return null for users with no contests.
        let contestInfo = null;
        try {
            contestInfo = await leetcode.user_contest_info(username as string);
        } catch (e) {
            console.warn(`Could not fetch contest info for ${username}`);
        }

        const matchedUser = user.matchedUser;
        const submitStats = matchedUser.submitStats?.acSubmissionNum || [];
        const profileInfo = matchedUser.profile;

        // Calculate solved metrics
        const totalSolved = submitStats.find((s: any) => s.difficulty === 'All')?.count || 0;
        const easySolved = submitStats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
        const mediumSolved = submitStats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
        const hardSolved = submitStats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

        // Contest metrics
        const rating = contestInfo?.userContestRanking?.rating || 0;
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
            totalEasy: 0,
            totalMedium: 0,
            totalHard: 0,
            languages: languages,
            contests: [] as any[], 
            currentRating: Math.floor(rating),
            ratingPercentile: parseFloat(String(contestInfo?.userContestRanking?.topPercentage || "100")),
            calendar: calendarMap,
            badges: (matchedUser.badges || []).map((b: any, index: number) => ({
                id: b.id || String(index),
                name: b.name || b.displayName,
                iconUrl: b.icon || '',
                category: "Participant",
                creationDate: ''
            }))
        };

        // If 'contestInfo.userContestRankingHistory' exists, we could map it to 'contests' array if needed.
        if (contestInfo && contestInfo.userContestRankingHistory) {
             const history = contestInfo.userContestRankingHistory.filter((c: any) => c.attended);
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
