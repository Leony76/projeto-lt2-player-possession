import { beforeEach, describe, expect, it, vi } from "vitest";
import { Server } from "socket.io";
import { checkSocketRateLimit } from "@backend/middlewares/socketRateLimit.middleware.js";
import { initializeSocket, getIO } from "../socket.server.js";

const mocks = vi.hoisted(() => ({
  serverOn: vi.fn(),
  socketOn: vi.fn(),
  socketJoin: vi.fn(),
  socketLeave: vi.fn(),
  ioTo: vi.fn(),
  ioEmit: vi.fn(),
  messageSend: vi.fn(),
  markAsRead: vi.fn(),
  findParticipant: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("socket.io", () => ({
  Server: vi.fn(function ServerMock() {
    return {
      on: mocks.serverOn,
      to: mocks.ioTo,
    };
  }),
}));

vi.mock("../../message/message.service.js", () => ({
  MessageService: {
    send: mocks.messageSend,
  },
}));

vi.mock("../../conversation/conversation.repository.js", () => ({
  ConversationRepository: {
    markAsRead: mocks.markAsRead,
    findParticipantByConversationAndUserId: mocks.findParticipant,
  },
}));

vi.mock("@backend/middlewares/socketRateLimit.middleware.js", () => ({
  checkSocketRateLimit: mocks.rateLimit,
}));

const userId = 1;
const conversationId = 10;

const messageMock = {
  id: 100,
  content: "Hello!",
  senderId: userId,
  conversationId,
  createdAt: new Date(),
};

const conversationMock = {
  id: conversationId,
  contact: {
    id: 2,
    username: "Player 2",
    profileImageURL: null,
  },
  updatedAt: new Date(),
  lastMessage: messageMock,
  unreadMessagesCount: 0,
};

const sendResultMock = {
  message: messageMock,
  conversation: conversationMock,
  recipientUnreadMessagesCount: 3,
};

let socket: {
  data: { userId: number };
  on: ReturnType<typeof vi.fn>;
  join: ReturnType<typeof vi.fn>;
  leave: ReturnType<typeof vi.fn>;
};

let handlers: Record<string, (...args: any[]) => any>;

let io: any;

const triggerEvent = async (
  event: string,
  ...args: any[]
) => {
  const handler = handlers[event];

  if (!handler) {
    throw new Error(`Event ${event} not registered`);
  }

  return await handler(...args);
};

beforeEach(() => {
  vi.clearAllMocks();

  handlers = {};

  mocks.ioTo.mockReturnValue({
    emit: mocks.ioEmit,
  });

  mocks.rateLimit.mockReturnValue({
    allowed: true,
  });

  socket = {
    data: { userId },
    on: vi.fn((event, callback) => {
      handlers[event] = callback;
    }),
    join: vi.fn(),
    leave: vi.fn(),
  };

  mocks.serverOn.mockImplementation((event, callback) => {
    if (event === "connection") {
      callback(socket);
    }
  });

  io = initializeSocket({} as never);
});

describe("initializeSocket", () => {
  it("should create Socket.IO server with correct configuration", () => {
    expect(Server).toHaveBeenCalledWith(
      expect.anything(),
      {
        cors: {
          origin: process.env.FRONTEND_URL,
          credentials: true,
        },
        maxHttpBufferSize: 64 * 1024,
      },
    );
  });

  it("should register connection event", () => {
    expect(mocks.serverOn)
      .toHaveBeenCalledWith(
        "connection",
        expect.any(Function),
      );
  });

  it("should join user room when socket connects", () => {
    expect(socket.join)
      .toHaveBeenCalledWith(`user:${userId}`);
  });

  it("should register all socket events", () => {
    expect(socket.on).toHaveBeenCalledWith(
      "conversation:leave",
      expect.any(Function),
    );

    expect(socket.on).toHaveBeenCalledWith(
      "conversation:read",
      expect.any(Function),
    );

    expect(socket.on).toHaveBeenCalledWith(
      "message:send",
      expect.any(Function),
    );

    expect(socket.on).toHaveBeenCalledWith(
      "conversation:join",
      expect.any(Function),
    );

    expect(socket.on).toHaveBeenCalledWith(
      "disconnect",
      expect.any(Function),
    );
  });
});

describe("getIO", () => {
  it("should return initialized Socket.IO instance", () => {
    expect(getIO()).toBe(io);
  });
});

describe("conversation:leave", () => {
  it("should leave conversation room", async () => {
    await triggerEvent(
      "conversation:leave",
      conversationId,
    );

    expect(checkSocketRateLimit)
      .toHaveBeenCalledWith(
        userId,
        "conversation:leave",
        20,
        10000,
      );

    expect(socket.leave)
      .toHaveBeenCalledWith(
        `conversation:${conversationId}`,
      );
  });

  it("should not leave room when rate limit is exceeded", async () => {
    mocks.rateLimit.mockReturnValue({
      allowed: false,
    });

    await triggerEvent(
      "conversation:leave",
      conversationId,
    );

    expect(socket.leave).not.toHaveBeenCalled();
  });
});

describe("conversation:read", () => {
  it("should mark conversation as read and emit event", async () => {
    await triggerEvent(
      "conversation:read",
      conversationId,
    );

    expect(mocks.markAsRead)
      .toHaveBeenCalledWith(
        conversationId,
        userId,
      );

    expect(mocks.ioTo)
      .toHaveBeenCalledWith(`user:${userId}`);

    expect(mocks.ioEmit)
      .toHaveBeenCalledWith(
        "conversation:read",
        conversationId,
      );
  });

  it("should not mark conversation as read when rate limit is exceeded", async () => {
    mocks.rateLimit.mockReturnValue({
      allowed: false,
    });

    await triggerEvent(
      "conversation:read",
      conversationId,
    );

    expect(mocks.markAsRead).not.toHaveBeenCalled();
  });

  it("should handle repository errors", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mocks.markAsRead.mockRejectedValue(
      new Error("Database error"),
    );

    await triggerEvent(
      "conversation:read",
      conversationId,
    );

    expect(consoleSpy).toHaveBeenCalled();

    expect(mocks.ioEmit).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe("message:send", () => {
  const payload = {
    content: "Hello!",
    recipientId: 2,
  };

  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();

    mocks.messageSend.mockResolvedValue(
      sendResultMock,
    );
  });

  it("should send message and emit socket events", async () => {
    await triggerEvent(
      "message:send",
      payload,
      callback,
    );

    expect(checkSocketRateLimit)
      .toHaveBeenCalledWith(
        userId,
        "message:send",
        5,
        10000,
      );

    expect(mocks.messageSend)
      .toHaveBeenCalledWith(
        userId,
        payload,
      );

    expect(mocks.ioTo)
      .toHaveBeenCalledWith(
        `conversation:${conversationId}`,
      );

    expect(mocks.ioEmit)
      .toHaveBeenCalledWith(
        "message:new",
        messageMock,
      );

    expect(mocks.ioTo)
      .toHaveBeenCalledWith(`user:${userId}`);

    expect(mocks.ioEmit)
      .toHaveBeenCalledWith(
        "conversation:updated",
        conversationMock,
      );

    expect(mocks.ioTo)
      .toHaveBeenCalledWith("user:2");

    expect(mocks.ioEmit)
      .toHaveBeenCalledWith(
        "conversation:updated",
        {
          ...conversationMock,
          unreadMessagesCount: 3,
        },
      );

    expect(callback).toHaveBeenCalledWith({
      success: true,
      data: {
        message: messageMock,
        conversation: conversationMock,
      },
    });
  });

  it("should return rate limit error through callback", async () => {
    mocks.rateLimit.mockReturnValue({
      allowed: false,
    });

    await triggerEvent(
      "message:send",
      payload,
      callback,
    );

    expect(callback).toHaveBeenCalledWith({
      success: false,
      error: "Too many messages sent at once. Please await a while",
    });

    expect(mocks.messageSend).not.toHaveBeenCalled();
    expect(mocks.ioEmit).not.toHaveBeenCalled();
  });

  it("should return service error through callback", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mocks.messageSend.mockRejectedValue(
      new Error("Message cannot be empty"),
    );

    await triggerEvent(
      "message:send",
      payload,
      callback,
    );

    expect(callback).toHaveBeenCalledWith({
      success: false,
      error: "Message cannot be empty",
    });

    expect(mocks.ioEmit).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should return generic error when thrown value is not an Error", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mocks.messageSend.mockRejectedValue(
      "Unexpected error",
    );

    await triggerEvent(
      "message:send",
      payload,
      callback,
    );

    expect(callback).toHaveBeenCalledWith({
      success: false,
      error: "Unable to send message",
    });

    consoleSpy.mockRestore();
  });

  it("should not fail when callback is not provided", async () => {
    await expect(
      triggerEvent("message:send", payload),
    ).resolves.not.toThrow();
  });

  it("should use conversation contact ID when recipientId is not provided", async () => {
    const payloadWithoutRecipient = {
      content: "Hello!",
      conversationId,
    };

    await triggerEvent(
      "message:send",
      payloadWithoutRecipient,
      callback,
    );

    expect(mocks.ioTo)
      .toHaveBeenCalledWith(
        `user:${conversationMock.contact.id}`,
      );
  });
});

describe("conversation:join", () => {
  it("should join conversation room when user is a participant", async () => {
    mocks.findParticipant.mockResolvedValue({
      id: 1,
    });

    await triggerEvent(
      "conversation:join",
      conversationId,
    );

    expect(mocks.findParticipant)
      .toHaveBeenCalledWith(
        conversationId,
        userId,
      );

    expect(socket.join)
      .toHaveBeenCalledWith(
        `conversation:${conversationId}`,
      );
  });

  it("should not join conversation room when user is not a participant", async () => {
    mocks.findParticipant.mockResolvedValue(null);

    await triggerEvent(
      "conversation:join",
      conversationId,
    );

    expect(socket.join)
      .not.toHaveBeenCalledWith(
        `conversation:${conversationId}`,
      );
  });

  it("should not query participant when rate limit is exceeded", async () => {
    mocks.rateLimit.mockReturnValue({
      allowed: false,
    });

    await triggerEvent(
      "conversation:join",
      conversationId,
    );

    expect(mocks.findParticipant).not.toHaveBeenCalled();
  });

  it("should handle repository errors", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mocks.findParticipant.mockRejectedValue(
      new Error("Database error"),
    );

    await triggerEvent(
      "conversation:join",
      conversationId,
    );

    expect(consoleSpy).toHaveBeenCalled();

    expect(socket.join)
      .not.toHaveBeenCalledWith(
        `conversation:${conversationId}`,
      );

    consoleSpy.mockRestore();
  });
});
