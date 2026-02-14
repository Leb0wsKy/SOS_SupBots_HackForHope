import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

// Registration is disabled - all accounts must be created by administrators
// Use the seed script or create users directly in the database
router.post('/login', login);

export default router;
