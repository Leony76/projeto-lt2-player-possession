import { api } from "@/lib/api";
import type { MessagesResponse } from "@shared/dtos/message.dto";

export class MessageService {

  static async get(
    conversationId : number
  ): Promise<MessagesResponse> {

    const { data } = await api.get<MessagesResponse>(
      `/messages/${conversationId}`
    );

    return data;
  }
}