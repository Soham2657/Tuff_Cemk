import api from './api';

export const canteenService = {
  getMenu: async () => {
    const response = await api.get('/canteen/menu');
    return response.data;
  },
  searchMenu: async (query) => {
    const response = await api.get('/canteen/menu/search/query', { params: { q: query } });
    return response.data;
  },
  addMenuItem: async (formData) => {
    const response = await api.post('/canteen/menu', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  placeOrder: async (orderData) => {
    const response = await api.post('/canteen/order', orderData);
    return response.data;
  },
  getMyOrders: async () => {
    const response = await api.get('/canteen/my-orders');
    return response.data;
  },
  getAllOrders: async () => {
    const response = await api.get('/canteen/orders');
    return response.data;
  },
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/canteen/order/${id}`, { status });
    return response.data;
  },
  getQueueInfo: async (id) => {
    const response = await api.get(`/canteen/queue/${id}`);
    return response.data;
  }
};
