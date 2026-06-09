const { Asset, DepreciationRecord, AssetCategory } = require('../models');
const { calculate, getCurrentFinancialYear } = require('../utils/depreciationCalculator');
const { ResourceNotFoundError } = require('../middleware/errorHandler');
const { PagedResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Depreciation Service.
 */

async function calculateForAsset(assetId, currentUserId) {
  const asset = await Asset.findByPk(assetId, {
    include: [{ model: AssetCategory, as: 'category' }],
  });
  if (!asset) throw new ResourceNotFoundError('Asset', 'id', assetId);
  if (!asset.purchaseCost || !asset.purchaseDate) {
    throw new Error('Asset missing purchaseCost or purchaseDate for depreciation calculation');
  }

  const usefulLife = asset.category?.usefulLife || 5;
  const result = calculate(asset.purchaseCost, usefulLife, asset.purchaseDate);
  const fy = getCurrentFinancialYear();

  const [record, created] = await DepreciationRecord.findOrCreate({
    where: { assetId, financialYear: fy },
    defaults: {
      assetId,
      financialYear: fy,
      openingValue: asset.purchaseCost,
      depreciationRate: result.depreciationRate,
      depreciationAmt: result.annualDepreciation,
      closingValue: result.currentValue,
      method: 'STRAIGHT_LINE',
      calculatedById: currentUserId,
      calculatedAt: new Date(),
    },
  });

  if (!created) {
    await record.update({
      depreciationAmt: result.annualDepreciation,
      closingValue: result.currentValue,
      calculatedAt: new Date(),
    });
  }

  await asset.update({ currentValue: result.currentValue });

  logger.info(`Depreciation calculated for asset ${asset.assetTag}: FY ${fy}`);
  return toResponse(record, asset);
}

async function bulkCalculate(currentUserId) {
  logger.info('Starting annual depreciation bulk calculation...');
  const assets = await Asset.findAll({
    where: { isActive: true },
    include: [{ model: AssetCategory, as: 'category' }],
  });

  let success = 0, failed = 0;
  for (const asset of assets) {
    if (!asset.purchaseCost || !asset.purchaseDate) { failed++; continue; }
    try {
      await calculateForAsset(asset.id, currentUserId);
      success++;
    } catch (err) {
      logger.warn(`Depreciation failed for ${asset.assetTag}: ${err.message}`);
      failed++;
    }
  }

  logger.info(`Depreciation bulk calc done. Success: ${success}, Failed: ${failed}`);
  return { success, failed };
}

async function getRecords({ assetId, financialYear, page = 0, size = 20 } = {}) {
  const where = {};
  if (assetId) where.assetId = assetId;
  if (financialYear) where.financialYear = financialYear;

  const { count, rows } = await DepreciationRecord.findAndCountAll({
    where,
    include: [{ model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] }],
    order: [['calculatedAt', 'DESC']],
    limit: size,
    offset: page * size,
  });

  return PagedResponse.from(rows.map(r => toResponse(r, r.asset)), count, page, size);
}

function toResponse(r, asset) {
  const obj = r.toJSON ? r.toJSON() : r;
  return {
    id: obj.id,
    assetId: asset?.id || obj.assetId,
    assetTag: asset?.assetTag,
    assetName: asset?.name,
    financialYear: obj.financialYear,
    openingValue: obj.openingValue ? parseFloat(obj.openingValue) : null,
    depreciationRate: obj.depreciationRate ? parseFloat(obj.depreciationRate) : null,
    depreciationAmt: obj.depreciationAmt ? parseFloat(obj.depreciationAmt) : null,
    closingValue: obj.closingValue ? parseFloat(obj.closingValue) : null,
    method: obj.method,
    calculatedAt: obj.calculatedAt,
  };
}

module.exports = { calculateForAsset, bulkCalculate, getRecords, getCurrentFinancialYear };
