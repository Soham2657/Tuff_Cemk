import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { chatWithAssistant } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', protect, chatWithAssistant);

export default router;