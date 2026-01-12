import api from '../lib/api';

export const contentService = {
  // Get all content
  getAll: async (type?: string) => {
    const params = type ? `?type=${type}` : '';
    const response = await api.get(`/content${params}`);
    return response.data;
  },

  // Get content by ID
  getById: async (id: string) => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },

  // Create new content
  create: async (contentData: {
    title: string;
    description: string;
    type: string;
    imageUrl?: string;
    documentUrl?: string;
    tags?: string[];
  }) => {
    const response = await api.post('/content', contentData);
    return response.data;
  },

  // Update content
  update: async (id: string, contentData: {
    title?: string;
    description?: string;
    type?: string;
    imageUrl?: string;
    documentUrl?: string;
    tags?: string[];
    published?: boolean;
  }) => {
    const response = await api.patch(`/content/${id}`, contentData);
    return response.data;
  },

  // Delete content
  delete: async (id: string) => {
    const response = await api.delete(`/content/${id}`);
    return response.data;
  },
};
