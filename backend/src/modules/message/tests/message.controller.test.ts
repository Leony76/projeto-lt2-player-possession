
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MessageController } from "../message.controller.js";
import { MessageService } from "../message.service.js";

import type { Request, Response } from "express";

vi.mock("../message.service.js", () => ({
  MessageService: {
    get: vi.fn(),
  },
}));

describe("MessageController.get", () => {
  const userId = 1;
  const conversationId = 10;

  const messagesMock = [
    {
      id: 100,
      content: "Hello!",
      senderId: userId,
      conversationId,
      createdAt: new Date(),
    },
  ];

  let req: Request;
  let res: Response;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      authUserId: String(userId),
      params: {
        conversationId: String(conversationId),
      },
    } as unknown as Request;

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
  });

  it("should return conversation messages with status 200", async () => {
    vi.mocked(MessageService.get)
      .mockResolvedValue(messagesMock as never);

    await MessageController.get(req, res);

    expect(MessageService.get)
      .toHaveBeenCalledWith(userId, conversationId);

    expect(res.status)
      .toHaveBeenCalledWith(200);

    expect(res.json)
      .toHaveBeenCalledWith({
        messages: messagesMock,
      });
  });

  it("should convert request parameters to numbers", async () => {
    req.authUserId = "25" as never;
    req.params.conversationId = "50";

    vi.mocked(MessageService.get)
      .mockResolvedValue([] as never);

    await MessageController.get(req, res);

    expect(MessageService.get)
      .toHaveBeenCalledWith(25, 50);
  });

  it("should return an empty messages array when there are no messages", async () => {
    vi.mocked(MessageService.get)
      .mockResolvedValue([] as never);

    await MessageController.get(req, res);

    expect(res.json)
      .toHaveBeenCalledWith({
        messages: [],
      });
  });
});
