import { Router } from 'express';
import { getAggregatedProfile } from '../controllers/leetcodeQuery.controller';

const router = Router();

router.get('/profile/:username', getAggregatedProfile);

export default router;
