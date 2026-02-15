import express from 'express';
import { getHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';
import { requireLevel1 } from '../middleware/roles.js';

const router = express.Router();

// All history routes require authentication + Level 1 or higher
router.use(protect);
router.use(requireLevel1);

// GET /api/history?page=1&limit=30&action=CREATE_SIGNALEMENT&startDate=&endDate=
router.get('/', getHistory);

export default router;
