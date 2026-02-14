import express from 'express';
import { 
  getAnalytics,
  getHeatmapData,
  getVillageRatings,
  exportData
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { requireLevel3 } from '../middleware/roles.js';
import { logAudit } from '../middleware/auditLog.js';

const router = express.Router();

// All analytics routes require Level 3
router.use(protect);
router.use(requireLevel3);

// Global analytics
router.get('/', logAudit('ACCESS_ANALYTICS'), getAnalytics);

// Heatmap data
router.get('/heatmap', logAudit('ACCESS_ANALYTICS'), getHeatmapData);

// Village ratings
router.get('/village-ratings', logAudit('ACCESS_ANALYTICS'), getVillageRatings);

// Export data
router.get('/export', logAudit('EXPORT_DATA'), exportData);

export default router;
