import { Prisma } from "@backend/generated/prisma/client.js";
import { prisma } from "@backend/lib/prisma.js";
import { ConversationQueryRow } from "@backend/types/conversationRowQuery.type.js";
import { ConversationsAdvancedFilterKeys } from "@shared/maps/filters/conversations/conversation.filter.js";

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


  public static async getUserConversations(
    userId : number,
    search : string,
    filter : ConversationsAdvancedFilterKeys,
    page   : number,
    limit  : number,
  ): Promise<ConversationQueryRow[]> {
    
    const offset = (page - 1) * limit;

    const orderBy = {
      AZ_CONTACT_NAME: Prisma.sql`
        contact."name" ASC,
        c."updated_at" DESC,
        c."id" DESC
      `,
      ZA_CONTACT_NAME: Prisma.sql`
        contact."name" DESC,
        c."updated_at" DESC,
        c."id" DESC
      `,
      MOST_RECENTS_MESSAGES: Prisma.sql`
        c."updated_at" DESC,
        c."id" DESC
      `,
      LESS_RECENTS_MESSAGES: Prisma.sql`
        c."updated_at" ASC,
        c."id" ASC
      `,
    }[filter];

    return prisma.$queryRaw<ConversationQueryRow[]>(Prisma.sql`
      SELECT
        c."id",
        c."updated_at" AS "updatedAt",

        contact."id" AS "contactId",
        contact."name" AS "contactName",
        contact."profile_image_url" AS "contactProfileImageURL",

        last_message."id" AS "lastMessageId",
        last_message."content" AS "lastMessageContent",
        last_message."sender_id" AS "lastMessageSenderId",
        last_message."created_at" AS "lastMessageCreatedAt",

        (
          SELECT COUNT(*)
          FROM "messages" unread_message
          WHERE
            unread_message."conversation_id" = c."id"
            AND unread_message."sender_id" <> ${userId}
            AND (
              cp_me."last_read_at" IS NULL
              OR unread_message."created_at" > cp_me."last_read_at"
            )
        ) AS "unreadMessagesCount"

      FROM "conversations" c

      INNER JOIN "conversation_participants" cp_me
        ON cp_me."conversation_id" = c."id"
        AND cp_me."user_id" = ${userId}

      INNER JOIN "conversation_participants" cp_contact
        ON cp_contact."conversation_id" = c."id"
        AND cp_contact."user_id" <> ${userId}

      INNER JOIN "users" contact
        ON contact."id" = cp_contact."user_id"

      LEFT JOIN LATERAL (
        SELECT
          m."id",
          m."content",
          m."sender_id",
          m."created_at"
        FROM "messages" m
        WHERE m."conversation_id" = c."id"
        ORDER BY m."created_at" DESC, m."id" DESC
        LIMIT 1
      ) last_message ON TRUE

      WHERE
        POSITION(
          LOWER(${search})
          IN LOWER(contact."name")
        ) > 0

      ORDER BY ${orderBy}

      LIMIT ${limit + 1}
      OFFSET ${offset}
    `);
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