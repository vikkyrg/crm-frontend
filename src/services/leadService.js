import api from './api';

export const leadService = {
  getLeads: async () => {
    const response = await api.get('/leads');
    return response.data;
  },
  
  getLeadById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },
  
  createLead: async (data) => {
    const response = await api.post('/leads', data);
    return response.data;
  },
  
  updateLeadStatus: async (id, status) => {
    const response = await api.patch(`/leads/${id}/status`, { status });
    return response.data;
  }
};
