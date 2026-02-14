import express from 'express';
import {
  createSignalement,
  getSignalements,
  getSignalementById,
  updateSignalement,
  deleteSignalement,
  closeSignalement,
  archiveSignalement,
  assignSignalement
} from '../controllers/signalementController.js';
import { protect } from '../middleware/auth.js';
import { requireLevel1, requireLevel2, requireLevel3 } from '../middleware/roles.js';
import { logAudit } from '../middleware/auditLog.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create signalement with file uploads (Level 1+)
router.post('/', 
  requireLevel1,
  upload.array('attachments', 5),
  logAudit('CREATE_SIGNALEMENT', 'Signalement'),
  createSignalement
);

// Get all signalements (filtered by role)
router.get('/', 
  logAudit('VIEW_SIGNALEMENT'),
  getSignalements
);

// Get signalement by ID
router.get('/:id',
  logAudit('VIEW_SIGNALEMENT'),
  getSignalementById
);

// Update signalement (Level 2+)
router.put('/:id', 
  requireLevel2,
  logAudit('UPDATE_SIGNALEMENT', 'Signalement'),
  updateSignalement
);

// Assign signalement to Level 2 user (Level 2+)
router.put('/:id/assign',
  requireLevel2,
  logAudit('UPDATE_SIGNALEMENT', 'Signalement'),
  assignSignalement
);

// Close signalement (Level 3)
router.put('/:id/close',
  requireLevel3,
  logAudit('CLOSE_SIGNALEMENT', 'Signalement'),
  closeSignalement
);

// Archive signalement (Level 3)
router.put('/:id/archive',
  requireLevel3,
  logAudit('UPDATE_SIGNALEMENT', 'Signalement'),
  archiveSignalement
);

// Delete signalement (Level 3)
router.delete('/:id', 
  requireLevel3,
  logAudit('DELETE_SIGNALEMENT', 'Signalement'),
  deleteSignalement
);

export default router;
