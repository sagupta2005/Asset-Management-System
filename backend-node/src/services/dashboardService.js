const { fn, col, literal } = require('sequelize');
const {
  Asset, Employee, Vendor, MaintenanceRequest,
  AssetHealthScore, WarrantyTracking, DepreciationRecord,
} = require('../models');

/**
 * Dashboard Service.
 * Aggregates KPI stats, distributions for the main dashboard.
 */

async function getStats() {
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    total, available, assigned, underRepair, disposed,
    totalEmployees, totalVendors, openMaintenance,
    highRisk, warrantyExpiring30,
    purchaseSum, currentSum,
  ] = await Promise.all([
    Asset.count({ where: { isActive: true } }),
    Asset.count({ where: { isActive: true, status: 'AVAILABLE' } }),
    Asset.count({ where: { isActive: true, status: 'ASSIGNED' } }),
    Asset.count({ where: { isActive: true, status: 'UNDER_REPAIR' } }),
    Asset.count({ where: { isActive: true, status: 'DISPOSED' } }),
    Employee.count({ where: { isActive: true } }),
    Vendor.count({ where: { isActive: true } }),
    MaintenanceRequest.count({ where: { status: ['OPEN', 'IN_PROGRESS'] } }),
    AssetHealthScore.count({ where: { riskLevel: 'HIGH' } }),
    WarrantyTracking.count({
      where: {
        expiryDate: {
          [require('sequelize').Op.between]: [
            today.toISOString().split('T')[0],
            thirtyDaysLater.toISOString().split('T')[0],
          ],
        },
      },
    }),
    Asset.findOne({
      attributes: [[fn('SUM', col('purchaseCost')), 'total']],
      where: { isActive: true },
      raw: true,
    }),
    Asset.findOne({
      attributes: [[fn('SUM', col('currentValue')), 'total']],
      where: { isActive: true },
      raw: true,
    }),
  ]);

  const totalPurchaseValue = parseFloat(purchaseSum?.total || 0);
  const totalCurrentValue = parseFloat(currentSum?.total || 0);

  // Count expired warranties
  const expiredWarranty = await Asset.count({
    where: {
      warrantyExpiry: { [require('sequelize').Op.lt]: today.toISOString().split('T')[0] },
      isActive: true,
    },
  });

  return {
    totalAssets: total,
    availableAssets: available,
    assignedAssets: assigned,
    underRepair,
    disposedAssets: disposed,
    expiredWarranty,
    highRiskAssets: highRisk,
    totalPurchaseValue,
    totalCurrentValue,
    totalDepreciation: parseFloat((totalPurchaseValue - totalCurrentValue).toFixed(2)),
    totalEmployees,
    totalVendors,
    openMaintenanceRequests: openMaintenance,
    warrantyExpiringIn30Days: warrantyExpiring30,
  };
}

async function getCategoryDistribution() {
  const { AssetCategory } = require('../models');
  const results = await Asset.findAll({
    attributes: ['categoryId', [fn('COUNT', col('Asset.id')), 'value']],
    include: [{ model: AssetCategory, as: 'category', attributes: ['name'] }],
    where: { isActive: true },
    group: ['categoryId', 'category.id'],
    raw: true,
  });
  return results.map(r => ({
    name: r['category.name'] || 'Unknown',
    value: parseInt(r.value),
  }));
}

async function getDepartmentDistribution() {
  const { Department } = require('../models');
  const results = await Asset.findAll({
    attributes: ['departmentId', [fn('COUNT', col('Asset.id')), 'value']],
    include: [{ model: Department, as: 'department', attributes: ['name'], required: false }],
    where: { isActive: true },
    group: ['departmentId', 'department.id'],
    raw: true,
  });
  return results.map(r => ({
    name: r['department.name'] || 'Unassigned',
    value: parseInt(r.value),
  }));
}

async function getStatusDistribution() {
  const statuses = ['AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'DISPOSED'];
  const counts = await Promise.all(
    statuses.map(status => Asset.count({ where: { isActive: true, status } }))
  );
  return statuses.map((name, i) => ({ name, value: counts[i] }));
}

async function getHealthDistribution() {
  const levels = ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'CRITICAL'];
  const counts = await Promise.all(
    levels.map(level => AssetHealthScore.count({ where: { healthLevel: level } }))
  );
  return levels.map((name, i) => ({ name, value: counts[i] }));
}

module.exports = { getStats, getCategoryDistribution, getDepartmentDistribution, getStatusDistribution, getHealthDistribution };
