
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@backend/lib/prisma.js";
import type { SendMessagePayload } from "@shared/dtos/message.dto.js";
import { MessageService } from "../message.service.js";
import { MessageRepository } from "../message.repository.js";
import { ConversationRepository } from "../../conversation/conversation.repository.js";
import { ContactRepository } from "../../contact/contact.repository.js";
import { MessageMapper } from "../message.mapper.js";

const mocks = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  txMock: {},
}));

vi.mock("@backend/lib/prisma.js", () => ({
  prisma: {
    $transaction: mocks.transactionMock,
  },
}));

vi.mock("../message.repository.js", () => ({
  MessageRepository: {
    findByIdAndUserId: vi.fn(),
    create: vi.fn(),
    countRecipientUnreadMessages: vi.fn(),
  },
}));

vi.mock("../../conversation/conversation.repository.js", () => ({
  ConversationRepository: {
    findConversationForUser: vi.fn(),
    findConversationBetweenUsers: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../../contact/contact.repository.js", () => ({
  ContactRepository: {
    findAcceptedContactRelation: vi.fn(),
    findContactById: vi.fn(),
  },
}));

vi.mock("../message.mapper.js", () => ({
  MessageMapper: {
    toContactFormat: vi.fn(),
  },
}));

const userId = 1;
const recipientId = 2;
const conversationId = 10;

const messageMock = {
  id: 100,
  content: "Hello!",
  senderId: userId,
  conversationId,
  createdAt: new Date(),
};

const contactMock = {
  id: recipientId,
  name: "Player 2",
  profileImageURL: null,
};

const contactFormatMock = {
  id: recipientId,
  username: "Player 2",
  profileImageURL: null,
};

const updatedConversationMock = {
  id: conversationId,
  updatedAt: new Date(),
};

const conversationMock = {
  id: conversationId,
  participants: [
    {
      user: contactMock,
    },
  ],
};

const validConversationPayload: SendMessagePayload = {
  content: "  Hello!  ",
  conversationId,
} as SendMessagePayload;

const validRecipientPayload: SendMessagePayload = {
  content: "  Hello!  ",
  recipientId,
} as SendMessagePayload;

beforeEach(() => {
  vi.clearAllMocks();

  mocks.transactionMock.mockImplementation(
    async (callback: (tx: unknown) => unknown) =>
      callback(mocks.txMock),
  );

  vi.mocked(MessageMapper.toContactFormat)
    .mockReturnValue(contactFormatMock);

  vi.mocked(MessageRepository.create)
    .mockResolvedValue(messageMock as never);

  vi.mocked(MessageRepository.countRecipientUnreadMessages)
    .mockResolvedValue(3);

  vi.mocked(ConversationRepository.update)
    .mockResolvedValue(updatedConversationMock as never);
});

describe("MessageService.get", () => {
  it("should return conversation messages", async () => {
    const messages = [
      messageMock,
      {
        ...messageMock,
        id: 101,
        content: "Another message",
      },
    ];

    vi.mocked(MessageRepository.findByIdAndUserId)
      .mockResolvedValue({
        messages,
      } as never);

    const result = await MessageService.get(
      userId,
      conversationId,
    );

    expect(result).toEqual(messages);

    expect(MessageRepository.findByIdAndUserId)
      .toHaveBeenCalledWith(conversationId, userId);
  });

  it("should throw APIError when conversation ID is invalid", async () => {
    await expect(
      MessageService.get(userId, 0),
    ).rejects.toMatchObject({
      message: "Invalid conversation ID",
    });

    expect(MessageRepository.findByIdAndUserId)
      .not.toHaveBeenCalled();
  });

  it("should throw APIError when conversation ID is negative", async () => {
    await expect(
      MessageService.get(userId, -1),
    ).rejects.toMatchObject({
      message: "Invalid conversation ID",
    });

    expect(MessageRepository.findByIdAndUserId)
      .not.toHaveBeenCalled();
  });

  it("should throw APIError when conversation ID is not an integer", async () => {
    await expect(
      MessageService.get(userId, 1.5),
    ).rejects.toMatchObject({
      message: "Invalid conversation ID",
    });

    expect(MessageRepository.findByIdAndUserId)
      .not.toHaveBeenCalled();
  });

  it("should throw APIError when conversation is not found", async () => {
    vi.mocked(MessageRepository.findByIdAndUserId)
      .mockResolvedValue(null as never);

    await expect(
      MessageService.get(userId, conversationId),
    ).rejects.toMatchObject({
      message: "Conversation not found",
    });
  });
});

describe("MessageService.send - validations", () => {
  it("should reject an empty message", async () => {
    const payload = {
      content: "   ",
      conversationId,
    } as SendMessagePayload;

    await expect(
      MessageService.send(userId, payload),
    ).rejects.toMatchObject({
      message: "Message cannot be empty",
    });

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should reject a message longer than 1000 characters", async () => {
    const payload = {
      content: "a".repeat(1001),
      conversationId,
    } as SendMessagePayload;

    await expect(
      MessageService.send(userId, payload),
    ).rejects.toMatchObject({
      message: "Message length cap is 1000 characters",
    });

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should reject when neither conversationId nor recipientId is provided", async () => {
    const payload = {
      content: "Hello!",
    } as SendMessagePayload;

    await expect(
      MessageService.send(userId, payload),
    ).rejects.toMatchObject({
      message: "Provide exactly one conversation identifier",
    });

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should reject when both conversationId and recipientId are provided", async () => {
    const payload = {
      content: "Hello!",
      conversationId,
      recipientId,
    } as SendMessagePayload;

    await expect(
      MessageService.send(userId, payload),
    ).rejects.toMatchObject({
      message: "Provide exactly one conversation identifier",
    });

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("MessageService.send - existing conversation", () => {
  it("should send a message to an existing conversation", async () => {
    vi.mocked(ConversationRepository.findConversationForUser)
      .mockResolvedValue(conversationMock as never);

    const result = await MessageService.send(
      userId,
      validConversationPayload,
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    expect(ConversationRepository.findConversationForUser)
      .toHaveBeenCalledWith(
        mocks.txMock,
        conversationId,
        userId,
      );

    expect(MessageRepository.create)
      .toHaveBeenCalledWith(
        mocks.txMock,
        "Hello!",
        conversationId,
        userId,
      );

    expect(MessageRepository.countRecipientUnreadMessages)
      .toHaveBeenCalledWith(
        mocks.txMock,
        conversationId,
        recipientId,
      );

    expect(ConversationRepository.update)
      .toHaveBeenCalledWith(
        mocks.txMock,
        conversationId,
      );

    expect(MessageMapper.toContactFormat)
      .toHaveBeenCalledWith(contactMock);

    expect(result).toEqual({
      message: messageMock,
      recipientUnreadMessagesCount: 3,
      conversation: {
        id: conversationId,
        contact: contactFormatMock,
        updatedAt: updatedConversationMock.updatedAt,
        lastMessage: messageMock,
        unreadMessagesCount: 0,
      },
    });
  });

  it("should reject when user is not a conversation participant", async () => {
    vi.mocked(ConversationRepository.findConversationForUser)
      .mockResolvedValue(null as never);

    await expect(
      MessageService.send(userId, validConversationPayload),
    ).rejects.toMatchObject({
      message: "Not a conversation participant",
    });

    expect(MessageRepository.create).not.toHaveBeenCalled();
    expect(ConversationRepository.update).not.toHaveBeenCalled();
  });

  it("should reject when conversation has no contact", async () => {
    vi.mocked(ConversationRepository.findConversationForUser)
      .mockResolvedValue({
        id: conversationId,
        participants: [],
      } as never);

    await expect(
      MessageService.send(userId, validConversationPayload),
    ).rejects.toMatchObject({
      message: "Conversation contact not found",
    });

    expect(MessageRepository.create).not.toHaveBeenCalled();
  });
});

describe("MessageService.send - recipient", () => {
  beforeEach(() => {
    vi.mocked(ContactRepository.findAcceptedContactRelation)
      .mockResolvedValue({} as never);

    vi.mocked(ContactRepository.findContactById)
      .mockResolvedValue(contactMock as never);
  });

  it("should reject when user tries to message themselves", async () => {
    const payload = {
      content: "Hello!",
      recipientId: userId,
    } as SendMessagePayload;

    await expect(
      MessageService.send(userId, payload),
    ).rejects.toMatchObject({
      message: "Cannot message yourself",
    });

    expect(ContactRepository.findAcceptedContactRelation)
      .not.toHaveBeenCalled();
  });

  it("should reject when recipient is not an accepted contact", async () => {
    vi.mocked(ContactRepository.findAcceptedContactRelation)
      .mockResolvedValue(null as never);

    await expect(
      MessageService.send(userId, validRecipientPayload),
    ).rejects.toMatchObject({
      message: "You can only message your contacts",
    });

    expect(ConversationRepository.findConversationBetweenUsers)
      .not.toHaveBeenCalled();

    expect(MessageRepository.create).not.toHaveBeenCalled();
  });

  it("should send a message using an existing conversation", async () => {
    vi.mocked(ConversationRepository.findConversationBetweenUsers)
      .mockResolvedValue({
        id: conversationId,
      } as never);

    const result = await MessageService.send(
      userId,
      validRecipientPayload,
    );

    expect(ContactRepository.findAcceptedContactRelation)
      .toHaveBeenCalledWith(
        mocks.txMock,
        userId,
        recipientId,
      );

    expect(ConversationRepository.findConversationBetweenUsers)
      .toHaveBeenCalledWith(
        mocks.txMock,
        userId,
        recipientId,
      );

    expect(ConversationRepository.create)
      .not.toHaveBeenCalled();

    expect(MessageRepository.create)
      .toHaveBeenCalledWith(
        mocks.txMock,
        "Hello!",
        conversationId,
        userId,
      );

    expect(MessageRepository.countRecipientUnreadMessages)
      .toHaveBeenCalledWith(
        mocks.txMock,
        conversationId,
        recipientId,
      );

    expect(ContactRepository.findContactById)
      .toHaveBeenCalledWith(mocks.txMock, recipientId);

    expect(result).toEqual({
      message: messageMock,
      recipientUnreadMessagesCount: 3,
      conversation: {
        id: conversationId,
        contact: contactFormatMock,
        updatedAt: updatedConversationMock.updatedAt,
        lastMessage: messageMock,
        unreadMessagesCount: 0,
      },
    });
  });

  it("should create a conversation when one does not exist", async () => {
    vi.mocked(ConversationRepository.findConversationBetweenUsers)
      .mockResolvedValue(null as never);

    vi.mocked(ConversationRepository.create)
      .mockResolvedValue({
        id: conversationId,
      } as never);

    await MessageService.send(userId, validRecipientPayload);

    expect(ConversationRepository.create)
      .toHaveBeenCalledWith(
        mocks.txMock,
        userId,
        recipientId,
      );

    expect(MessageRepository.create)
      .toHaveBeenCalledWith(
        mocks.txMock,
        "Hello!",
        conversationId,
        userId,
      );

    expect(ConversationRepository.update)
      .toHaveBeenCalledWith(
        mocks.txMock,
        conversationId,
      );
  });

  it("should reject when recipient does not exist", async () => {
    vi.mocked(ConversationRepository.findConversationBetweenUsers)
      .mockResolvedValue({
        id: conversationId,
      } as never);

    vi.mocked(ContactRepository.findContactById)
      .mockResolvedValue(null as never);

    await expect(
      MessageService.send(userId, validRecipientPayload),
    ).rejects.toMatchObject({
      message: "Recipient not found",
    });

    expect(MessageRepository.create).toHaveBeenCalled();
    expect(ConversationRepository.update).toHaveBeenCalled();
  });
});
