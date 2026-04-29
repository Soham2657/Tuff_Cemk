import api from './api';

export const adminService = {
  getAnnouncements: async () => {
    const response = await api.get('/admin/announcement');
    return response.data;
  },
  createAnnouncement: async (announcementData) => {
    const response = await api.post('/admin/announcement', announcementData);
    return response.data;
  },
  deleteAnnouncement: async (id) => {
    const response = await api.delete(`/admin/announcement/${id}`);
    return response.data;
  },
  getApplications: async () => {
    const response = await api.get('/applications');
    return response.data;
  },
  updateApplication: async (id, statusData) => {
    const response = await api.put(`/applications/${id}`, statusData);
    return response.data;
  }
};
