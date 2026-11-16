
import { Prisma } from "@backend/generated/prisma/client.js";
import { prisma } from "@backend/lib/prisma.js";

export class MessageRepository {

  public static async create(
    tx             : Prisma.TransactionClient,
    content        : string,
    conversationId : number,
    senderId       : number,
  ) {
    return tx.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
    });
  }



  public static async countRecipientUnreadMessages(
    tx             : Prisma.TransactionClient,
    conversationId : number,
    recipientId    : number,
  ) {
    const participant = await tx.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: recipientId,
        },
      },
      select: {
        lastReadAt: true,
      },
    });

    return tx.message.count({
      where: {
        conversationId,
        senderId: { not: recipientId },
        ...(participant?.lastReadAt
          ? {
              createdAt: {
                gt: participant.lastReadAt,
              },
            }
          : {}),
      },
    });
  }



  public static async getMessages(
    conversationId : number,
    userId         : number,
    cursor        ?: number,
    take = 30,
  ) {
    return prisma.message.findMany({
      where: {
        conversationId,
        conversation: {
          participants: {
            some: { userId },
          },
        },
      },
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImageURL: true,
          },
        },
      },
    });
  }



  public static async countUnreadMessages(
    conversationId : number,
    userId         : number,
  ) {
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      select: {
        lastReadAt: true,
      },
    });

    if (!participant) return 0;

    return prisma.message.count({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        ...(participant.lastReadAt
          ? {
              createdAt: {
                gt: participant.lastReadAt,
              },
            }
          : {}),
      },
    });
  }
}
