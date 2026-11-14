import type { Request, Response } from 'express';
import { ConversationService } from './conversation.service.js';

export class ConversationController {

  public static async getConversations(
    req: Request,
    res: Response,
  ) {
    const userId = Number(req.authUserId!);

    const conversations = await ConversationService.getConversations(userId);

    return res.status(200).json({
      conversations,
    });
  }



  public static async getMessages(
    req: Request,
    res: Response,
  ) {
    const userId = Number(req.authUserId!);
    const conversationId = Number(req.params.conversationId);

    const messages = await ConversationService.getMessages(
      userId,
      conversationId,
    );

    return res.status(200).json({
      messages,
    });
  }
}