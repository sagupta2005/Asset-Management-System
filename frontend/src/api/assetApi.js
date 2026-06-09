import axiosClient from './axiosClient'
import { demoAssetPage, demoAssets, demoCategories, fallbackOnNetworkError } from './mockData'

export const assetApi = {
  getAll: (params) => fallbackOnNetworkError(axiosClient.get('/assets', { params }), demoAssetPage),
  getById: (id) => {
    const asset = demoAssets.find((item) => String(item.id) === String(id)) || demoAssets[0]
    return fallbackOnNetworkError(axiosClient.get(`/assets/${id}`), asset)
  },
  getByTag: (tag) => axiosClient.get(`/assets/tag/${tag}`),
  create: (data) => axiosClient.post('/assets', data),
  update: (id, data) => axiosClient.put(`/assets/${id}`, data),
  delete: (id) => axiosClient.delete(`/assets/${id}`),
  uploadImage: (id, file) => {
    const fd = new FormData(); fd.append('file', file)
    return axiosClient.post(`/assets/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getMovements: (id, params) => axiosClient.get(`/assets/${id}/movements`, { params }),
  getCategories: () => fallbackOnNetworkError(axiosClient.get('/assets/categories'), demoCategories),
  getStatusCounts: () => axiosClient.get('/assets/status-counts'),
}
