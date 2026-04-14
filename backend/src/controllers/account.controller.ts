import { Response } from 'express';
import { LeetCode } from 'leetcode-query';
import User from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';

const leetcode = new LeetCode();

// ─── GET /api/account/me ─────────────────────────────────────────
// Returns the authenticated user's profile, including leetcodeUsername.
export const getAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password -refreshToken');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      leetcodeUsername: user.leetcodeUsername || null,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── POST /api/account/verify-leetcode ───────────────────────────
// Verifies that a LeetCode username exists, then links it to the user.
// Flow: Frontend sends { leetcodeUsername } → we call LeetCode API →
//       if valid, save to User doc → return profile info.
export const verifyLeetCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leetcodeUsername } = req.body;

    if (!leetcodeUsername || typeof leetcodeUsername !== 'string') {
      res.status(400).json({ message: 'Please provide a LeetCode username' });
      return;
    }

    const trimmed = leetcodeUsername.trim();

    // Check if another user already claimed this username
    const existingClaim = await User.findOne({ 
      leetcodeUsername: trimmed, 
      _id: { $ne: req.user?.id } 
    });
    if (existingClaim) {
      res.status(409).json({ message: 'This LeetCode username is already linked to another account.' });
      return;
    }

    // Verify with LeetCode API — call leetcode.user() to check if profile exists
    const lcUser = await leetcode.user(trimmed);

    if (!lcUser || lcUser.matchedUser === null) {
      res.status(404).json({ message: `LeetCode user "${trimmed}" not found. Please check the username.` });
      return;
    }

    // Extract profile info for the response
    const profile = lcUser.matchedUser.profile;
    const submitStats = lcUser.matchedUser.submitStats?.acSubmissionNum || [];
    const totalSolved = submitStats.find((s: any) => s.difficulty === 'All')?.count || 0;

    // Save verified username to the user document
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { leetcodeUsername: trimmed },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      message: 'LeetCode username verified successfully!',
      leetcodeUsername: trimmed,
      leetcodeProfile: {
        avatar: profile?.userAvatar || '',
        realName: profile?.realName || trimmed,
        ranking: profile?.ranking || 0,
        totalSolved,
      },
    });
  } catch (error: any) {
    console.error('verifyLeetCode error:', error.message);
    res.status(500).json({ message: 'Failed to verify LeetCode username. Please try again.' });
  }
};
