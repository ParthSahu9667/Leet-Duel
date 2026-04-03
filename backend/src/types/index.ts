export interface LeetCodeStatsResponse {
    solvedProblem?: number;
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
    errors?: any;
}

export interface UserProfileResponse {
    avatar?: string;
    name?: string;
    ranking?: number;
    reputation?: number;
    errors?: any;
}

export interface RankedUser {
    username: string;
    solvedProblem: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    avatar: string;
    name: string;
    ranking: number;
    reputation: number;
    powerScore?: number;
    error: string | null;
}
