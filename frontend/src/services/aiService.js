import api from './api';

export const aiService = {
  sendMessage: async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  },
};