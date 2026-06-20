import axiosClient from './axiosClient'
import { fallbackOnNetworkError } from './mockData'

export const userApi = {
  getAll: (params) => fallbackOnNetworkError(
    axiosClient.get('/users', { params }),
    { content: [], totalPages: 0, totalElements: 0, number: 0, size: 10 }
  ),
  create: (data) => axiosClient.post('/users', data),
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
  delete: (id) => axiosClient.delete(`/users/${id}`),
}
