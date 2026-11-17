import { Request, Response } from "express";
import { MessageService } from "./message.service.js";

export class MessageController {

  public static async get(
    req : Request,
    res : Response,
  ) {
    const userId = Number(req.authUserId!);
    const conversationId = Number(req.params.conversationId);

    const messages = await MessageService.get(
      userId,
      conversationId,
    );

    return res.status(200).json({
      messages,
    });
  }
}