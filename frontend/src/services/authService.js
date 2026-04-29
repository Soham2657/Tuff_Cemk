import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      const user = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: String(response.data.role || 'Student').trim().toLowerCase(),
        profilePicture: response.data.profilePicture || '',
        collegeRollNo: response.data.collegeRollNo || '',
        department: response.data.department || '',
        universityRollNo: response.data.universityRollNo || '',
        year: response.data.year || ''
      };
      localStorage.setItem('user', JSON.stringify(user));
      return { ...response.data, user };
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      const user = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: String(response.data.role || 'Student').trim().toLowerCase(),
        profilePicture: response.data.profilePicture || '',
        collegeRollNo: response.data.collegeRollNo || '',
        department: response.data.department || '',
        universityRollNo: response.data.universityRollNo || '',
        year: response.data.year || ''
      };
      localStorage.setItem('user', JSON.stringify(user));
      return { ...response.data, user };
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  }
};
