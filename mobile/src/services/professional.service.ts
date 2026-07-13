import { api } from './api';

export const getRecommendedProfessionals = async (type: string) => {
  const { data } = await api.get(`/professionals/recommend?type=${type}`);
  return data;
};

export const contactProfessional = async (professionalId: string, documentId?: string) => {
  const { data } = await api.post('/professionals/contact', { professionalId, documentId });
  return data;
};
