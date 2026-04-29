import api from './api';

export const clubService = {
  getClubs: async () => {
    const response = await api.get('/clubs');
    return response.data;
  },
  searchClubs: async (query) => {
    const response = await api.get('/clubs/search/query', { params: { q: query } });
    return response.data;
  },
  getClubById: async (id) => {
    const response = await api.get(`/clubs/${id}`);
    return response.data;
  },
  createClub: async (formData) => {
    const response = await api.post('/clubs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  leaveClub: async (id) => {
    const response = await api.post(`/clubs/${id}/leave`);
    return response.data;
  },
  deleteClub: async (id) => {
    const response = await api.delete(`/clubs/${id}`);
    return response.data;
  },
  applyToClub: async (clubId, applicationData) => {
    const response = await api.post(`/applications/${clubId}`, applicationData);
    return response.data;
  }
};
