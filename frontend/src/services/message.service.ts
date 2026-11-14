import { api } from "@/lib/api";
import type { ConversationsResponse, MessagesResponse } from "@shared/dtos/message.dto";

export class MessageService {

  static async getConversations(): Promise<ConversationsResponse> {

    const { data } = await api.get<ConversationsResponse>(
      '/conversations'
    );

    return data;
  }



  static async getMessages(
    conversationId : number
  ): Promise<MessagesResponse> {

    const { data } = await api.get<MessagesResponse>(
      `/conversations/${conversationId}/messages`
    );

    return data;
  }
}