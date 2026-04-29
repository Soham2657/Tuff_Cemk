import api from './api';

export const profileService = {
  getMyProfile: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },
  upsertMyProfile: async (profileData) => {
    const response = await api.put('/profile/me', profileData);
    console.log('upsertMyProfile response status:', response.status);
    console.log('upsertMyProfile response data:', response.data);
    
    // Handle both 200 with JSON body and 204 No Content
    return response.data || {};
  },
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    // Do NOT set Content-Type header for FormData; let axios handle it
    const response = await api.put('/profile/me/picture', formData);
    console.log('uploadProfilePicture response status:', response.status);
    console.log('uploadProfilePicture response data:', response.data);
    
    return response.data || {};
  },
};
