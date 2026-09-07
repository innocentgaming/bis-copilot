import { apiClient } from "./client";
import {
  ChatRequest,
  ChatResponseData,
  ConversationDetail,
  MessageDetail,
} from "@/types/chat";
import { PaginatedResponse } from "@/types/api";

export const chatApi = {
  sendMessage(payload: ChatRequest): Promise<ChatResponseData> {
    return apiClient.post<ChatResponseData>("/chat", payload);
  },

  streamMessage(
    payload: ChatRequest,
    onToken: (token: string) => void,
    onFinal: (finalData: ChatResponseData) => void,
    onError: (err: Error) => void
  ): Promise<void> {
    return apiClient.streamChat("/chat/stream", payload, onToken, onFinal, onError);
  },

  getConversations(
    limit = 20,
    offset = 0
  ): Promise<PaginatedResponse<ConversationDetail>> {
    return apiClient.get<PaginatedResponse<ConversationDetail>>(
      `/conversations?limit=${limit}&offset=${offset}`
    );
  },

  getConversation(id: string): Promise<ConversationDetail> {
    return apiClient.get<ConversationDetail>(`/conversations/${id}`);
  },

  getMessages(conversationId: string): Promise<MessageDetail[]> {
    return apiClient.get<MessageDetail[]>(
      `/conversations/${conversationId}/messages`
    );
  },

  deleteConversation(id: string): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(`/conversations/${id}`);
  },

  submitFeedback(payload: {
    message_id: string;
    rating: number; // 1 or -1
    is_correct?: boolean;
    comment?: string;
  }): Promise<{ id: string; message_id: string; rating: number }> {
    return apiClient.post("/feedback", payload);
  },
};
