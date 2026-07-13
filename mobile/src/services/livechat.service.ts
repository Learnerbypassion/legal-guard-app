import { api } from './api';

export const getLiveChatHistory = async (recipientId: string, page = 1, limit = 50) => {
  const { data } = await api.get(`/livechat/history/${recipientId}`, {
    params: { page, limit },
  });
  return data;
};

export const getConversations = async () => {
  const { data } = await api.get('/livechat/conversations');
  return data;
};
