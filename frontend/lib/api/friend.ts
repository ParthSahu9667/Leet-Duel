import { api } from './axios';

/**
 * Fetches the logged-in user's friend list from the backend.
 * @returns An array of LeetCode usernames.
 */
export const getFriendsAPI = async (): Promise<string[]> => {
  try {
    const response = await api.get('/friends');
    return response.data.friends || [];
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

/**
 * Updates the logged-in user's friend list in the backend.
 * @param friends Array of LeetCode usernames
 * @returns The updated array of usernames.
 */
export const updateFriendsAPI = async (friends: string[]): Promise<string[]> => {
  try {
    const response = await api.put('/friends', { friends });
    return response.data.friends || [];
  } catch (error) {
    console.error('Error updating friends:', error);
    throw error;
  }
};
