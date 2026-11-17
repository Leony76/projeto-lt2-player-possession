import type { Request, Response } from 'express';
import { ConversationService } from './conversation.service.js';
import { GetConversationsQuery } from '@shared/schemas/conversation.schema.js';

export class ConversationController {

  public static async get(
    req: Request,
    res: Response,
  ) {
    const userId = Number(req.authUserId);
    const query = res.locals.validatedData as GetConversationsQuery;

    const result = await ConversationService.getConversations(
      userId,
      query,
    );

    return res.status(200).json(result);
  }
}