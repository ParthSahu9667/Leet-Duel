import { RankedUser } from '../types/index.type';
import { fetchLeetCodeData } from '../utils/leetcode.graphql';

export const fetchUserStats = async (username: string): Promise<RankedUser> => {
    try {
        const data = await fetchLeetCodeData(username);

        if (!data || !data.matchedUser) {
            return {
                username,
                solvedProblem: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
                totalEasy: 0, totalMedium: 0, totalHard: 0,
                avatar: '', name: '', ranking: 0, reputation: 0,
                error: `User ${username} not found.`
            };
        }

        const matchedUser = data.matchedUser;
        const profileInfo = matchedUser.profile;
        const submitStats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];

        // Calculate solved metrics
        const totalSolved = submitStats.find((s: any) => s.difficulty === 'All')?.count || 0;
        const easySolved = submitStats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
        const mediumSolved = submitStats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
        const hardSolved = submitStats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

        // Get total questions counts
        const allQuestions = data.allQuestionsCount || [];
        const totalEasy = allQuestions.find((q: any) => q.difficulty === 'Easy')?.count || 0;
        const totalMedium = allQuestions.find((q: any) => q.difficulty === 'Medium')?.count || 0;
        const totalHard = allQuestions.find((q: any) => q.difficulty === 'Hard')?.count || 0;

        let avgQuestionsPerDay = 0;

        // Calculate 30 day avg directly
        if (matchedUser.submissionCalendar) {
            try {
                const parsedCal = JSON.parse(matchedUser.submissionCalendar);
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

                let sum = 0;
                Object.keys(parsedCal).forEach((tsStr) => {
                    const ts = parseInt(tsStr) * 1000;
                    if (ts >= thirtyDaysAgo) {
                        sum += parsedCal[tsStr];
                    }
                });

                avgQuestionsPerDay = sum / 30;
            } catch (e) {
                console.warn(`Failed to parse submission calendar for ${username}`);
            }
        }

        return {
            username: matchedUser.githubUrl ? username : username,
            solvedProblem: totalSolved,
            easySolved: easySolved,
            mediumSolved: mediumSolved,
            hardSolved: hardSolved,
            totalEasy,
            totalMedium,
            totalHard,
            avatar: profileInfo?.userAvatar || '',
            name: profileInfo?.realName || username,
            ranking: profileInfo?.ranking || 0,
            reputation: profileInfo?.reputation || 0,
            avgQuestionsPerDay: parseFloat(avgQuestionsPerDay.toFixed(2)),
            error: null
        };
    } catch (error: any) {
        console.error(`Error fetching data for ${username}:`, error.message);
        return {
            username,
            solvedProblem: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
            totalEasy: 0, totalMedium: 0, totalHard: 0,
            avatar: '', name: '', ranking: 0, reputation: 0,
            error: `Failed to fetch data for ${username}`
        };
    }
};

export const getMultipleUsersStats = async (usernames: string[]): Promise<RankedUser[]> => {
    const promises = usernames.map(username => fetchUserStats(username));
    return Promise.all(promises);
};
