import express from 'express';
import {
  createWorkflow,
  getWorkflow,
  updateWorkflowStage,
  generateDPEReport,
  classifySignalement,
  addWorkflowNote,
  getMyWorkflows
} from '../controllers/workflowController.js';
import { protect } from '../middleware/auth.js';
import { requireLevel2 } from '../middleware/roles.js';
import { logAudit } from '../middleware/auditLog.js';

const router = express.Router();

// All workflow routes require Level 2 or higher
router.use(protect);
router.use(requireLevel2);

// Get my workflows (dashboard)
router.get('/my-workflows', logAudit('VIEW_SIGNALEMENT'), getMyWorkflows);

// Get workflow by signalement ID
router.get('/:signalementId', logAudit('VIEW_SIGNALEMENT'), getWorkflow);

// Create workflow
router.post('/', logAudit('CREATE_WORKFLOW', 'Workflow'), createWorkflow);

// Update workflow stage
router.put('/:workflowId/stage', logAudit('UPDATE_WORKFLOW', 'Workflow'), updateWorkflowStage);

// Generate DPE report with AI
router.post('/:workflowId/generate-dpe', logAudit('GENERATE_REPORT', 'Workflow'), generateDPEReport);

// Classify signalement
router.put('/:workflowId/classify', logAudit('CLASSIFY_SIGNALEMENT', 'Workflow'), classifySignalement);

// Add note
router.post('/:workflowId/notes', logAudit('UPDATE_WORKFLOW', 'Workflow'), addWorkflowNote);

export default router;
