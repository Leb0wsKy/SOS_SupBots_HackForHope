import express from 'express';
import {
  getAllVillages,
  getVillageById,
  createVillage,
  updateVillage,
  getVillageStatistics
} from '../controllers/villageController.js';
import { protect } from '../middleware/auth.js';
import { requireLevel3, checkRole } from '../middleware/roles.js';
import { logAudit } from '../middleware/auditLog.js';

const router = express.Router();

router.use(protect);

// Get all villages (all authenticated users)
router.get('/', getAllVillages);

// Get village by ID
router.get('/:id', getVillageById);

// Get village statistics
router.get('/:id/statistics', getVillageStatistics);

// Create village (Level 3 only)
router.post('/', requireLevel3, logAudit('CREATE_SIGNALEMENT', 'Village'), createVillage);

// Update village (Level 3 only)
router.put('/:id', requireLevel3, logAudit('UPDATE_SIGNALEMENT', 'Village'), updateVillage);

export default router;
