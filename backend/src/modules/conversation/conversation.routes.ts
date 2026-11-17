import { requireAuth } from '@backend/middlewares/auth.middleware.js';
import { Router } from 'express';
import { ConversationController } from './conversation.controller.js';
import { getConversationsQuerySchema } from '@shared/schemas/conversation.schema.js';
import { validate } from '@backend/middlewares/validate.middleware.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  validate(getConversationsQuerySchema, "query"),
  ConversationController.get
);

export default router;