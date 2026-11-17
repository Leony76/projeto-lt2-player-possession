import { requireAuth } from '@backend/middlewares/auth.middleware.js';
import { Router } from 'express';
import { MessageController } from './message.controller.js';

const router = Router();

router.get(
  '/:conversationId',
  requireAuth,
  MessageController.get
);

export default router;