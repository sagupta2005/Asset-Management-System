import axiosClient from './axiosClient'
import {
  demoCharts,
  demoDashboard,
  demoDepartments,
  fallbackOnNetworkError,
} from './mockData'
export { assetApi } from './assetApi'

export const employeeApi = {
  getAll: (params) => axiosClient.get('/employees', { params }),
  getById: (id) => axiosClient.get(`/employees/${id}`),
  create: (data) => axiosClient.post('/employees', data),
  update: (id, data) => axiosClient.put(`/employees/${id}`, data),
  delete: (id) => axiosClient.delete(`/employees/${id}`),
  getAllocations: (id, params) => axiosClient.get(`/employees/${id}/allocations`, { params }),
}

export const allocationApi = {
  getAll: (params) => axiosClient.get('/allocations', { params }),
  getById: (id) => axiosClient.get(`/allocations/${id}`),
  assign: (data) => axiosClient.post('/allocations/assign', data),
  return: (id, notes) => axiosClient.post(`/allocations/${id}/return`, { notes }),
  transfer: (id, data) => axiosClient.post(`/allocations/${id}/transfer`, data),
  getByAsset: (assetId, params) => axiosClient.get(`/allocations/asset/${assetId}`, { params }),
  getByEmployee: (empId, params) => axiosClient.get(`/allocations/employee/${empId}`, { params }),
}

export const vendorApi = {
  getAll: (params) => axiosClient.get('/vendors', { params }),
  getById: (id) => axiosClient.get(`/vendors/${id}`),
  create: (data) => axiosClient.post('/vendors', data),
  update: (id, data) => axiosClient.put(`/vendors/${id}`, data),
  delete: (id) => axiosClient.delete(`/vendors/${id}`),
  addRating: (id, data) => axiosClient.post(`/vendors/${id}/ratings`, data),
}

export const maintenanceApi = {
  getAll: (params) => axiosClient.get('/maintenance', { params }),
  getById: (id) => axiosClient.get(`/maintenance/${id}`),
  create: (data) => axiosClient.post('/maintenance', data),
  update: (id, data) => axiosClient.put(`/maintenance/${id}`, data),
  updateStatus: (id, status) => axiosClient.patch(`/maintenance/${id}/status`, { status }),
  complete: (id, data) => axiosClient.post(`/maintenance/${id}/complete`, data),
  getByAsset: (assetId, params) => axiosClient.get(`/maintenance/asset/${assetId}`, { params }),
}

export const dashboardApi = {
  getStats: () => fallbackOnNetworkError(axiosClient.get('/dashboard/stats'), demoDashboard),
  getCategoryChart: () => fallbackOnNetworkError(axiosClient.get('/dashboard/charts/category'), demoCharts.category),
  getDepartmentChart: () => fallbackOnNetworkError(axiosClient.get('/dashboard/charts/department'), demoCharts.department),
  getStatusChart: () => fallbackOnNetworkError(axiosClient.get('/dashboard/charts/status'), demoCharts.status),
  getHealthChart: () => fallbackOnNetworkError(axiosClient.get('/dashboard/charts/health'), demoCharts.health),
}

export const warrantyApi = {
  getAll: (params) => axiosClient.get('/warranty', { params }),
  getExpiring: (days, params) => axiosClient.get('/warranty/expiring', { params: { days, ...params } }),
  getByAsset: (assetId) => axiosClient.get(`/warranty/asset/${assetId}`),
}

export const depreciationApi = {
  calculate: (assetId) => axiosClient.post(`/depreciation/calculate/${assetId}`),
  calculateAll: () => axiosClient.post('/depreciation/calculate-all'),
  getRecords: (params) => axiosClient.get('/depreciation/records', { params }),
}

export const healthApi = {
  getByAsset: (assetId) => axiosClient.get(`/health/asset/${assetId}`),
  calculateForAsset: (assetId) => axiosClient.post(`/health/calculate/${assetId}`),
  getHighRisk: (params) => axiosClient.get('/health/high-risk', { params }),
}

export const reportApi = {
  downloadAssets: (params) => axiosClient.get('/reports/assets', { params, responseType: 'blob' }),
  downloadMaintenance: (params) => axiosClient.get('/reports/maintenance', { params, responseType: 'blob' }),
  downloadWarranty: (params) => axiosClient.get('/reports/warranty', { params, responseType: 'blob' }),
  downloadDepreciation: (params) => axiosClient.get('/reports/depreciation', { params, responseType: 'blob' }),
}

export const aiApi = {
  chat: (message) => fallbackOnNetworkError(
    axiosClient.post('/ai/chat', { message }),
    { message: `Demo response: backend is offline, but I understood your query: "${message}".` }
  ),
}

export const ocrApi = {
  scan: (file) => {
    const fd = new FormData(); fd.append('file', file)
    return fallbackOnNetworkError(
      axiosClient.post('/ocr/scan', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
      {
        vendorName: 'Demo Vendor',
        invoiceNumber: 'INV-DEMO-001',
        invoiceDate: '2026-06-02',
        purchaseDate: '2026-06-02',
        totalAmount: 145000,
        warrantyPeriod: '36 months',
        assetName: 'Demo Laptop',
        serialNumber: 'DEMO12345',
        extractionConfidence: 92,
      }
    )
  },
}

export const notificationApi = {
  getAll: (params) => axiosClient.get('/notifications', { params }),
  getUnreadCount: () => fallbackOnNetworkError(axiosClient.get('/notifications/unread-count'), 0),
  markAsRead: (id) => axiosClient.patch(`/notifications/${id}/read`),
  markAllRead: () => axiosClient.patch('/notifications/mark-all-read'),
}

export const auditApi = {
  getLogs: (params) => axiosClient.get('/audit-logs', { params }),
}

export const departmentApi = {
  getAll: () => fallbackOnNetworkError(axiosClient.get('/departments'), demoDepartments),
  create: (data) => axiosClient.post('/departments', data),
  update: (id, data) => axiosClient.put(`/departments/${id}`, data),
  delete: (id) => axiosClient.delete(`/departments/${id}`),
}
