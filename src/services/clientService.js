import api from './api';

export const clientService = {
  getClients: async () => {
    const response = await api.get('/clients');
    return response.data;
  },
  
  getClientById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },
  
  createClient: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },
  
  updateClient: async (id, clientData) => {
    const response = await api.patch(`/clients/${id}`, clientData);
    return response.data;
  },
  
  deleteClient: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  }
};
