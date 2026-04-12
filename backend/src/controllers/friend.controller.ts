import { Request, Response } from 'express';
import FriendGroup from '../models/friend.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getFriends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const friendGroup = await FriendGroup.findOne({ user: userId });
    
    if (friendGroup) {
      res.status(200).json({ friends: friendGroup.friends });
    } else {
      res.status(200).json({ friends: [] });
    }
  } catch (error) {
    console.error('Error in getFriends:', error);
    res.status(500).json({ message: 'Server error retrieving friends list' });
  }
};

export const updateFriends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { friends } = req.body;

    if (!Array.isArray(friends)) {
      res.status(400).json({ message: 'Friends must be an array of strings' });
      return;
    }

    // Upsert the FriendGroup document (create if it doesn't exist)
    const friendGroup = await FriendGroup.findOneAndUpdate(
      { user: userId },
      { $set: { friends, user: userId } },
      { returnDocument: 'after', upsert: true }
    );

    res.status(200).json({ message: 'Friends updated successfully', friends: friendGroup.friends });
  } catch (error) {
    console.error('Error in updateFriends:', error);
    res.status(500).json({ message: 'Server error updating friends list' });
  }
};
