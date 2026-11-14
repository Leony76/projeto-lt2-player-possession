import { prisma } from "@backend/lib/prisma.js";
import { APIError } from "@backend/middlewares/error.middleware.js";
import { InitialChatContact, SendMessagePayload } from "@shared/dtos/message.dto.js";

export class MessageService {

  public static async send(
    userId  : number,
    payload : SendMessagePayload,
  ) {
    const content = payload.content.trim();

    if (!content) {
      throw new APIError(400, 'Message cannot be empty');
    }

    const hasConversationId = payload.conversationId !== undefined;
    const hasRecipientId = payload.recipientId !== undefined;

    if (hasConversationId === hasRecipientId) {
      throw new APIError(400, 'Provide exactly one conversation identifier');
    }

    return prisma.$transaction(async tx => {

      // 1. Envio para uma conversa que já existe.
      if (hasConversationId) {
        const conversationId = payload.conversationId!;

        const conversation = await tx.conversation.findFirst({
          where: {
            id: conversationId,
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
          },
        });

        if (!conversation) {
          throw new APIError(403, 'Not a conversation participant');
        }

        const contact = conversation.participants[0]?.user;

        if (!contact) {
          throw new APIError(404, 'Conversation contact not found');
        }

        const formattedContact: InitialChatContact = {
          id              : contact.id,
          username        : contact.name,
          profileImageURL : contact.profileImageURL,
        };

        const message = await tx.message.create({
          data: {
            conversationId,
            senderId: userId,
            content,
          },
        });

        const recipientParticipant = await tx.conversationParticipant.findUnique({
          where: {
            conversationId_userId: {
              conversationId,
              userId: contact.id,
            },
          },
          select: {
            lastReadAt: true,
          },
        });

        const recipientUnreadMessagesCount = await tx.message.count({
          where: {
            conversationId,
            senderId: {
              not: contact.id,
            },
            ...(recipientParticipant?.lastReadAt
              ? {
                  createdAt: {
                    gt: recipientParticipant.lastReadAt,
                  },
                }
              : {}),
          },
        });

        const updatedConversation = await tx.conversation.update({
          where: {
            id: conversation.id,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        return {
          message,
          conversation: {
            id: updatedConversation.id,
            contact: formattedContact,
            lastMessage: message,
            updatedAt: updatedConversation.updatedAt,
            unreadMessagesCount: 0,
          },
          recipientUnreadMessagesCount,
        };
      }

      // 2. Primeira mensagem para um contato.
      const recipientId = payload.recipientId!;

      if (recipientId === userId) {
        throw new APIError(400, 'Cannot message yourself');
      }

      // 2.1. Verifica se existe uma relação de contato aceita.
      const contactRelation = await tx.contact.findFirst({
        where: {
          status: 'CONTACT',
          OR: [
            {
              requesterId: userId,
              addresseeId: recipientId,
            },
            {
              requesterId: recipientId,
              addresseeId: userId,
            },
          ],
        },
      });

      if (!contactRelation) {
        throw new APIError(403, 'You can only message your contacts');
      }

      // 2.2. Procura uma conversa que tenha os dois usuários.
      const existingConversation = await tx.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: {
                  userId,
                },
              },
            },
            {
              participants: {
                some: {
                  userId: recipientId,
                },
              },
            },
          ],
        },
      });

      // 2.3. Reutiliza a conversa existente ou cria uma nova.
      const conversation = existingConversation
        ? existingConversation
        : await tx.conversation.create({
            data: {
              participants: {
                create: [
                  { userId },
                  { userId: recipientId },
                ],
              },
            },
          })
      ;

      // 2.4. Persiste a primeira mensagem.
      const message = await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          content,
        },
      });

      const recipientParticipant = await tx.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: conversation.id,
            userId: recipientId,
          },
        },
        select: {
          lastReadAt: true,
        },
      });

      const recipientUnreadMessagesCount = await tx.message.count({
        where: {
          conversationId: conversation.id,
          senderId: {
            not: recipientId,
          },
          ...(recipientParticipant?.lastReadAt
            ? {
                createdAt: {
                  gt: recipientParticipant.lastReadAt,
                },
              }
            : {}),
        },
      });

      // Atualiza a data da conversa.
      const updatedConversation = await tx.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      // 2.5. Recupera os dados públicos do destinatário.
      const contact = await tx.user.findUnique({
        where: {
          id: recipientId,
        },
        select: {
          id: true,
          name: true,
          profileImageURL: true,
        },
      });

      if (!contact) {
        throw new APIError(404, 'Recipient not found');
      }

      return {
        message,
        conversation: {
          id                  : updatedConversation.id,
          lastMessage         : message,
          updatedAt           : updatedConversation.updatedAt,
          unreadMessagesCount : recipientUnreadMessagesCount,
          contact : {
            id              : contact.id,
            username        : contact.name,
            profileImageURL : contact.profileImageURL,
          },
        },
      };
    });
  }
}