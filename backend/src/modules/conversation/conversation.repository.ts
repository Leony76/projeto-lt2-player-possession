import { Prisma } from "@backend/generated/prisma/client.js";
import { prisma } from "@backend/lib/prisma.js";

export class ConversationRepository {

  public static async findParticipantByConversationAndUserId(
    conversationId : number,
    userId         : number,
  ) {
    return await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    }); 
  }



  public static async getUserConversations(userId: number) {
    return await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },

      include: {
        participants: {
          where: {
            userId: {
              not: userId,
            },
          },
          select: {
            user: {
              select: {
                id: true,
                name: true,
                profileImageURL: true,
              },
            },
          },
        },

        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
          },
        },
      },

      orderBy: {
        updatedAt: 'desc',
      },
    });
  }



  public static async findByIdAndUserId(
    conversationId : number,
    userId         : number,
  ) {
    return await prisma.conversation.findFirst({
      where: {
        id: conversationId,

        participants: {
          some: {
            userId,
          },
        },
      },

      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }



  public static async markAsRead(
    conversationId : number,
    userId         : number,
  ) {
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });
  }



  public static async findConversationForUser(
    tx             : Prisma.TransactionClient,
    conversationId : number,
    userId         : number,
  ) {
    return tx.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          where: {
            userId: { not: userId },
          },
          select: {
            user: {
              select: {
                id: true,
                name: true,
                profileImageURL: true,
              },
            },
          },
        },
      },
    });
  }



  public static async findConversationBetweenUsers(
    tx          : Prisma.TransactionClient,
    userId      : number,
    recipientId : number,
  ) {
    return tx.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { userId },
            },
          },
          {
            participants: {
              some: { userId: recipientId },
            },
          },
        ],
      },
    });
  }



  public static async create(
    tx          : Prisma.TransactionClient,
    userId      : number,
    recipientId : number,
  ) {
    return tx.conversation.create({
      data: {
        participants: {
          create: [
            { userId },
            { userId: recipientId },
          ],
        },
      },
    });
  }



  public static async update(
    tx             : Prisma.TransactionClient,
    conversationId : number,
  ) {
    return tx.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
      },
    });
  }
}