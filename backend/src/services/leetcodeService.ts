import axios from 'axios';
import { LeetCodeStatsResponse, UserProfileResponse, RankedUser } from '../types';

const BASE_URL = process.env.LEETCODE_API_BASE_URL || 'https://alfa-leetcode-api.onrender.com';

export const fetchUserStats = async (username: string): Promise<RankedUser> => {
    try {
        const [statsResponse, profileResponse] = await Promise.all([
            axios.get<LeetCodeStatsResponse>(`${BASE_URL}/${username}/solved`).catch(() => null),
            axios.get<UserProfileResponse>(`${BASE_URL}/${username}`).catch(() => null)
        ]);
        
        let statsData = statsResponse ? statsResponse.data : {};
        let profileData = profileResponse ? profileResponse.data : {};

        if (statsData.errors || profileData.errors) {
            return { 
                username, 
                solvedProblem: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
                avatar: '', name: '', ranking: 0, reputation: 0,
                error: `User ${username} not found.` 
            };
        }

        return {
            username,
            solvedProblem: statsData.solvedProblem || 0,
            easySolved: statsData.easySolved || 0,
            mediumSolved: statsData.mediumSolved || 0,
            hardSolved: statsData.hardSolved || 0,
            avatar: profileData.avatar || '',
            name: profileData.name || username,
            ranking: profileData.ranking || 0,
            reputation: profileData.reputation || 0,
            error: null
        };
    } catch (error: any) {
        console.error(`Error fetching data for ${username}:`, error.message);
        return {
            username,
            solvedProblem: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
            avatar: '', name: '', ranking: 0, reputation: 0,
            error: `Failed to fetch data for ${username}`
        };
    }
};

export const getMultipleUsersStats = async (usernames: string[]): Promise<RankedUser[]> => {
    const promises = usernames.map(username => fetchUserStats(username));
    return Promise.all(promises);
};
