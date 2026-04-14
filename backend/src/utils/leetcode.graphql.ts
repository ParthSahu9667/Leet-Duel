import axios from 'axios';

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

// Combined query to get both matchedUser info and allQuestionsCount to determine total possible problems
export const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      username
      githubUrl
      profile {
        ranking
        reputation
        userAvatar
        realName
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    userContestRanking(username: $username) {
      rating
      attendedContestsCount
      topPercentage
    }
    userContestRankingHistory(username: $username) {
      attended
      rating
      ranking
      trendDirection
      contest {
        title
        startTime
      }
    }
  }
`;

export async function fetchLeetCodeData(username: string) {
  if (!username) return null;

  try {
    const res = await axios.post(
      LEETCODE_GRAPHQL,
      {
        query: USER_PROFILE_QUERY,
        variables: { username }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    return res.data?.data;
  } catch (error: any) {
    console.error(`LeetCode fetch error for ${username}:`, error.message);
    throw error;
  }
}
