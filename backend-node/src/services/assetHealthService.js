const { Asset, AssetHealthScore, MaintenanceRequest } = require('../models');
const { ResourceNotFoundError } = require('../middleware/errorHandler');
const { calculate } = require('../utils/healthScoreCalculator');
const { PagedResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Asset Health Service.
 */

async function calculateForAsset(assetId) {
  const asset = await Asset.findByPk(assetId, {
    include: [{ model: require('../models').AssetCategory, as: 'category' }],
  });
  if (!asset) throw new ResourceNotFoundError('Asset', 'id', assetId);
  return calculateAndSave(asset);
}

async function recalculateAll() {
  logger.info('Starting bulk health score recalculation...');
  const assets = await Asset.findAll({
    where: { isActive: true },
    include: [{ model: require('../models').AssetCategory, as: 'category' }],
  });

  let count = 0;
  for (const asset of assets) {
    try {
      await calculateAndSave(asset);
      count++;
    } catch (err) {
      logger.warn(`Health score failed for asset ${asset.assetTag}: ${err.message}`);
    }
  }
  logger.info(`Health score recalculation complete for ${count} assets`);
}

async function getHealthScore(assetId) {
  let score = await AssetHealthScore.findOne({ where: { assetId } });
  if (!score) {
    await calculateForAsset(assetId);
    score = await AssetHealthScore.findOne({ where: { assetId } });
    if (!score) throw new ResourceNotFoundError('Health Score', 'assetId', assetId);
  }
  return toResponse(score);
}

async function getHighRiskAssets(page = 0, size = 10) {
  const { count, rows } = await AssetHealthScore.findAndCountAll({
    where: { riskLevel: 'HIGH' },
    include: [{ model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] }],
    order: [['healthScore', 'ASC']],
    limit: size,
    offset: page * size,
  });
  return PagedResponse.from(rows.map(toResponse), count, page, size);
}

// ─── Private ─────────────────────────────────────────────────────────────────

async function calculateAndSave(asset) {
  const [{ count: maintenanceCount }, repairCostResult, downtimeResult] = await Promise.all([
    MaintenanceRequest.findAndCountAll({ where: { assetId: asset.id } }),
    MaintenanceRequest.findOne({
      attributes: [[require('sequelize').fn('SUM', require('sequelize').col('actualCost')), 'total']],
      where: { assetId: asset.id },
      raw: true,
    }),
    MaintenanceRequest.findOne({
      attributes: [[require('sequelize').fn('SUM', require('sequelize').col('downtimeHours')), 'total']],
      where: { assetId: asset.id },
      raw: true,
    }),
  ]);

  const repairCost = parseFloat(repairCostResult?.total || 0);
  const downtimeHours = parseFloat(downtimeResult?.total || 0);
  const usefulLife = asset.category?.usefulLife || 5;

  const result = calculate(
    asset.purchaseDate,
    usefulLife,
    maintenanceCount,
    repairCost,
    parseFloat(asset.purchaseCost || 0),
    downtimeHours,
    asset.warrantyExpiry
  );

  // Suggest next maintenance date based on risk
  const nextMaintenanceDays = { HIGH: 30, MEDIUM: 90, LOW: 180 };
  const daysOffset = nextMaintenanceDays[result.riskLevel] || 90;
  const nextMaintenanceDate = new Date();
  nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + daysOffset);

  const recommendations = buildRecommendations(result);

  const [score] = await AssetHealthScore.upsert({
    assetId: asset.id,
    healthScore: result.healthScore,
    healthLevel: result.healthLevel,
    ageScore: result.ageScore,
    maintenanceScore: result.maintenanceScore,
    repairCostScore: result.repairCostScore,
    downtimeScore: result.downtimeScore,
    warrantyScore: result.warrantyScore,
    riskLevel: result.riskLevel,
    riskScore: result.riskScore,
    nextMaintenanceDate: nextMaintenanceDate.toISOString().split('T')[0],
    recommendations,
    calculatedAt: new Date(),
  });

  logger.debug(`Health score for asset ${asset.assetTag}: ${result.healthScore}`);

  const saved = await AssetHealthScore.findOne({
    where: { assetId: asset.id },
    include: [{ model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] }],
  });
  return toResponse(saved);
}

function buildRecommendations(result) {
  const recs = [];
  if (result.ageScore < 40) recs.push('Asset is aging — consider replacement planning.');
  if (result.maintenanceScore < 40) recs.push('High maintenance frequency — review reliability.');
  if (result.repairCostScore < 40) recs.push('Repair costs are high relative to asset value.');
  if (result.downtimeScore < 40) recs.push('Significant downtime recorded — impacts productivity.');
  if (result.warrantyScore < 20) recs.push('Warranty expired — consider extended coverage.');
  if (recs.length === 0) recs.push('Asset is in good condition. Continue regular preventive maintenance.');
  return recs.join(' ');
}

function toResponse(s) {
  const obj = s.toJSON ? s.toJSON() : s;
  return {
    id: obj.id,
    assetId: obj.asset?.id || obj.assetId,
    assetTag: obj.asset?.assetTag,
    assetName: obj.asset?.name,
    healthScore: obj.healthScore ? parseFloat(obj.healthScore) : null,
    healthLevel: obj.healthLevel,
    ageScore: obj.ageScore ? parseFloat(obj.ageScore) : null,
    maintenanceScore: obj.maintenanceScore ? parseFloat(obj.maintenanceScore) : null,
    repairCostScore: obj.repairCostScore ? parseFloat(obj.repairCostScore) : null,
    downtimeScore: obj.downtimeScore ? parseFloat(obj.downtimeScore) : null,
    warrantyScore: obj.warrantyScore ? parseFloat(obj.warrantyScore) : null,
    riskLevel: obj.riskLevel,
    riskScore: obj.riskScore ? parseFloat(obj.riskScore) : null,
    nextMaintenanceDate: obj.nextMaintenanceDate,
    recommendations: obj.recommendations,
    calculatedAt: obj.calculatedAt,
  };
}

module.exports = { calculateForAsset, recalculateAll, getHealthScore, getHighRiskAssets };
