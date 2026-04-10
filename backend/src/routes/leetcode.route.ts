import { Router } from 'express';
import { getAggregatedProfile } from '../controllers/leetcodeQuery.controller';

const router = Router();

// ==========================================
// 🚀 User Details Endpoints
// ==========================================

// Aggregated Fast Profile Endpoint via leetcode-query
router.get('/profile/:username', getAggregatedProfile);

export default router;
