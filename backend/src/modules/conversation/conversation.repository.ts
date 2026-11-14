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



  public static async findAllByUserId(userId: number) {

    return prisma.conversation.findMany({
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
        },
      },

      orderBy: {
        updatedAt: 'desc',
      },
    });
  }



  public static async findByIdAndUserId(
    conversationId: number,
    userId: number,
  ) {

    return prisma.conversation.findFirst({
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