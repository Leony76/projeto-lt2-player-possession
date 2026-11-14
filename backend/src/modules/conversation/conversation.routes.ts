import { requireAuth } from '@backend/middlewares/auth.middleware.js';
import { Router } from 'express';
import { ConversationController } from './conversation.controller.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  ConversationController.getConversations
);

router.get(
  '/:conversationId/messages',
  requireAuth,
  ConversationController.getMessages
);

export default router;