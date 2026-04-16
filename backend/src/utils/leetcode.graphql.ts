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
      submissionCalendar
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

export const PROBLEM_LIST_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
      total: totalNum
      questions: data {
        difficulty
        title
        titleSlug
        isPaidOnly
      }
    }
  }
`;

export async function fetchProblemsList(difficulty: 'EASY' | 'MEDIUM' | 'HARD', limit: number, skip: number) {
  try {
    const res = await axios.post(
      LEETCODE_GRAPHQL,
      {
        query: PROBLEM_LIST_QUERY,
        variables: { categorySlug: '', limit, skip, filters: { difficulty } }
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    return res.data?.data?.problemsetQuestionList;
  } catch (error: any) {
    console.error(`LeetCode fetch problems error:`, error.message);
    throw error;
  }
}

export const PROBLEM_DETAIL_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      title
      titleSlug
      content
      difficulty
      topicTags {
        name
        slug
      }
      codeSnippets {
        lang
        langSlug
        code
      }
    }
  }
`;

export async function fetchProblemDetails(titleSlug: string) {
  try {
    const res = await axios.post(
      LEETCODE_GRAPHQL,
      {
        query: PROBLEM_DETAIL_QUERY,
        variables: { titleSlug }
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    return res.data?.data?.question;
  } catch (error: any) {
    console.error(`LeetCode fetch problem detail error:`, error.message);
    throw error;
  }
}

export const RECENT_SUBMISSIONS_QUERY = `
  query recentSubmissions($username: String!, $limit: Int!) {
    recentSubmissionList(username: $username, limit: $limit) {
      title
      titleSlug
      timestamp
      statusDisplay
    }
  }
`;

export async function fetchRecentSubmissions(username: string, limit: number) {
  try {
    const res = await axios.post(
      LEETCODE_GRAPHQL,
      {
        query: RECENT_SUBMISSIONS_QUERY,
        variables: { username, limit }
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );
    return res.data?.data?.recentSubmissionList || [];
  } catch (error: any) {
    throw error;
  }
}

