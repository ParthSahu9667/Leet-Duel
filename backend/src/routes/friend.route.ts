import express from 'express';
import { getFriends, updateFriends } from '../controllers/friend.controller';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply JWT verification middleware to all friend routes
router.use(verifyJWT);

// GET /api/friends - Retrieve the user's friend list
router.get('/', getFriends);

// PUT /api/friends - Update the user's friend list
router.put('/', updateFriends);

export default router;
