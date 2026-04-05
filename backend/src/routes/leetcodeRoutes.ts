import { Router } from 'express';
import { passthroughProxy } from '../controllers/leetcodeController';

const router = Router();

// ==========================================
// 🚀 User Details Endpoints
// ==========================================

// These use parameter matching `/:username/...` 
// Express routes match sequentially, so anything explicit like `/daily` MUST be above `/:username`
// to prevent "daily" from being interpreted as a username!

// ==========================================
// ❓ Questions Details Endpoints
// ==========================================
// Must be defined BEFORE :username bounds
router.get('/daily', passthroughProxy);
router.get('/daily/raw', passthroughProxy);
router.get('/select', passthroughProxy);
router.get('/select/raw', passthroughProxy);
router.get('/problems', passthroughProxy);
router.get('/officialSolution', passthroughProxy);

// ==========================================
// 🏆 Contests Endpoints
// ==========================================
router.get('/contests', passthroughProxy);
router.get('/contests/upcoming', passthroughProxy);

// ==========================================
// 🗪 Discussion Endpoints
// ==========================================
router.get('/trendingDiscuss', passthroughProxy);
router.get('/discussTopic/:topicId', passthroughProxy);
router.get('/discussComments/:topicId', passthroughProxy);

// ==========================================
// 👤 Dynamic User Details Endpoints
// ==========================================
// These endpoints will catch dynamically based on the provided username.

router.get('/:username', passthroughProxy);                    // Profile
router.get('/:username/profile', passthroughProxy);            // Full Profile
router.get('/:username/badges', passthroughProxy);             // Badges
router.get('/:username/solved', passthroughProxy);             // Solved
router.get('/:username/contest', passthroughProxy);            // Contest
router.get('/:username/contest/history', passthroughProxy);    // Contest History
router.get('/:username/submission', passthroughProxy);         // Submission (supports ?limit=N)
router.get('/:username/acSubmission', passthroughProxy);       // Accepted Submission 
router.get('/:username/calendar', passthroughProxy);           // Calendar (supports ?year=YYYY)
router.get('/:username/skill', passthroughProxy);              // Skill Stats
router.get('/:username/language', passthroughProxy);           // Lang Stats
router.get('/:username/progress', passthroughProxy);           // Question Progress

export default router;
