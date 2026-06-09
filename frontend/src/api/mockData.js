export const isNetworkError = (error) => !error.response

export const mockResponse = (data) => Promise.resolve({ data: { data } })

export const fallbackOnNetworkError = (request, data) =>
  request.catch((error) => {
    if (isNetworkError(error)) return mockResponse(data)
    throw error
  })

export const demoAuth = {
  userId: 1,
  email: 'admin@company.com',
  firstName: 'Demo',
  lastName: 'Admin',
  roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'],
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
  department: 'IT',
}

export const demoDashboard = {
  totalAssets: 248,
  availableAssets: 82,
  assignedAssets: 139,
  underRepair: 14,
  warrantyExpiringIn30Days: 11,
  totalEmployees: 96,
  openMaintenanceRequests: 18,
  highRiskAssets: 9,
  totalPurchaseValue: 18450000,
  totalCurrentValue: 12640000,
  totalDepreciation: 5810000,
}

export const demoAssets = [
  {
    id: 1,
    assetTag: 'AMS-LAP-0001',
    name: 'Dell XPS 15',
    brand: 'Dell',
    model: 'XPS 9570',
    serialNumber: 'SN1234567',
    categoryName: 'Laptop',
    status: 'ASSIGNED',
    departmentName: 'CSE',
    assignedToName: 'Aarav Sharma',
    purchaseCost: 145000,
    warrantyExpiry: '2026-09-30',
  },
  {
    id: 2,
    assetTag: 'AMS-MON-0002',
    name: 'LG UltraFine Monitor',
    brand: 'LG',
    model: '27UP850',
    serialNumber: 'LG998812',
    categoryName: 'Monitor',
    status: 'AVAILABLE',
    departmentName: 'IT',
    assignedToName: null,
    purchaseCost: 42000,
    warrantyExpiry: '2027-01-12',
  },
  {
    id: 3,
    assetTag: 'AMS-PRN-0003',
    name: 'HP LaserJet Pro',
    brand: 'HP',
    model: 'M404dn',
    serialNumber: 'HP778811',
    categoryName: 'Printer',
    status: 'UNDER_REPAIR',
    departmentName: 'Admin',
    assignedToName: null,
    purchaseCost: 31000,
    warrantyExpiry: '2025-12-15',
  },
]

export const demoAssetPage = {
  content: demoAssets,
  totalElements: demoAssets.length,
  totalPages: 1,
  number: 0,
  size: 20,
}

export const demoCategories = [
  { id: 1, name: 'Laptop' },
  { id: 2, name: 'Monitor' },
  { id: 3, name: 'Printer' },
  { id: 4, name: 'Networking' },
]

export const demoDepartments = [
  { id: 1, name: 'IT' },
  { id: 2, name: 'CSE' },
  { id: 3, name: 'Admin' },
  { id: 4, name: 'Finance' },
]

export const demoCharts = {
  category: [
    { name: 'Laptop', value: 94 },
    { name: 'Monitor', value: 61 },
    { name: 'Printer', value: 22 },
    { name: 'Networking', value: 37 },
  ],
  status: [
    { name: 'Available', value: 82 },
    { name: 'Assigned', value: 139 },
    { name: 'Under Repair', value: 14 },
    { name: 'Disposed', value: 13 },
  ],
  health: [
    { name: 'Excellent', value: 76 },
    { name: 'Good', value: 88 },
    { name: 'Average', value: 51 },
    { name: 'Poor', value: 14 },
    { name: 'Critical', value: 9 },
  ],
  department: [
    { name: 'IT', value: 58 },
    { name: 'CSE', value: 72 },
    { name: 'Admin', value: 43 },
    { name: 'Finance', value: 28 },
  ],
}
