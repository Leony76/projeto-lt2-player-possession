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
}