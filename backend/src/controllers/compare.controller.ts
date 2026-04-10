import { Request, Response } from 'express';
import { getMultipleUsersStats } from '../services/leetcode.service';
import { calculatePowerScore } from '../utils/scoringAlgorithm.util';
import { RankedUser } from '../types/index.type';

export const compareUsers = async (req: Request, res: Response) => {
    const usersStr = req.query.users as string;

    if (!usersStr) {
        return res.status(400).json({ error: 'Please provide a comma-separated list of users.' });
    }

    const usernameList = usersStr.split(',').map(u => u.trim()).filter(u => u.length > 0);

    if (usernameList.length === 0) {
        return res.status(400).json({ error: 'Invalid user list.' });
    }

    try {
        const stats: RankedUser[] = await getMultipleUsersStats(usernameList);

        const rankedUsers = stats.map(user => {
            if (user.error) {
                return { ...user, powerScore: -1 };
            }
            const powerScore = calculatePowerScore(user.easySolved, user.mediumSolved, user.hardSolved);
            return {
                ...user,
                powerScore
            };
        });

        // Sort descending by power score
        rankedUsers.sort((a, b) => (b.powerScore || -1) - (a.powerScore || -1));

        return res.json(rankedUsers);

    } catch (error) {
        console.error('Error in compareUsers:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
