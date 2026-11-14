import { prisma } from "@backend/lib/prisma.js";

export class MessageRepository {

  public static async create(
    content        : string,
    conversationId : number,
    senderId       : number,
  ) {
    return prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id              : true,
            name            : true,
            profileImageURL : true,
          },
        },
      },
    });
  };



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
        cursor : { id: cursor },
        skip   : 1,
      }),

      orderBy: { createdAt: 'desc' },

      include: {
        sender: {
          select: {
            id              : true,
            name            : true,
            profileImageURL : true,
          },
        },
      },
    });
  }
}