import api from './api';

export const eventService = {
  getEvents: async () => {
    const response = await api.get('/events');
    return response.data;
  },
  searchEvents: async (query) => {
    const response = await api.get('/events/search/query', { params: { q: query } });
    return response.data;
  },
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  createEvent: async (formData) => {
    const response = await api.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  registerForEvent: async (id) => {
    const response = await api.post(`/events/${id}/register`);
    return response.data;
  },
  getMyEvents: async () => {
    const response = await api.get('/events/my');
    return response.data;
  },
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  }
};
