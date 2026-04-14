import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { getAccount, verifyLeetCode } from '../controllers/account.controller';

const router = express.Router();

// All account routes require authentication
router.get('/me', verifyJWT, getAccount);
router.post('/verify-leetcode', verifyJWT, verifyLeetCode);

export default router;
