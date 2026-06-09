/**
 * Depreciation Calculator.
 * Implements Straight-Line Depreciation method.
 *
 * Formula:
 *   Annual Depreciation = (Purchase Cost - Salvage Value) / Useful Life
 *   Current Value = Purchase Cost - (Annual Depreciation × Years Elapsed)
 *   Rate = (1 / Useful Life) × 100
 */

const SALVAGE_VALUE_RATE = 0.05; // 5% of purchase cost as residual value

/**
 * Calculate straight-line depreciation for an asset.
 *
 * @param {number} purchaseCost  - Original purchase cost
 * @param {number} usefulLife    - Useful life in years
 * @param {Date|string} purchaseDate - Date of purchase
 * @returns {{ currentValue, annualDepreciation, depreciationRate, yearsElapsed, totalDepreciation }}
 */
function calculate(purchaseCost, usefulLife, purchaseDate) {
  const cost = parseFloat(purchaseCost) || 0;
  const life = parseInt(usefulLife) || 5;
  const purchaseD = purchaseDate instanceof Date ? purchaseDate : new Date(purchaseDate);

  if (isNaN(purchaseD.getTime())) {
    throw new Error('Invalid purchase date for depreciation calculation');
  }

  const now = new Date();
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const yearsElapsed = Math.max(0, (now - purchaseD) / msPerYear);

  const salvageValue = cost * SALVAGE_VALUE_RATE;
  const depreciableAmount = cost - salvageValue;
  const annualDepreciation = depreciableAmount / life;
  const depreciationRate = parseFloat(((1 / life) * 100).toFixed(4));

  const totalAccumulated = Math.min(annualDepreciation * yearsElapsed, depreciableAmount);
  const currentValue = Math.max(salvageValue, cost - totalAccumulated);

  return {
    currentValue: parseFloat(currentValue.toFixed(2)),
    annualDepreciation: parseFloat(annualDepreciation.toFixed(2)),
    depreciationRate: depreciationRate,
    yearsElapsed: parseFloat(yearsElapsed.toFixed(2)),
    totalDepreciation: parseFloat(totalAccumulated.toFixed(2)),
    salvageValue: parseFloat(salvageValue.toFixed(2)),
  };
}

/**
 * Get the current Indian financial year string, e.g. "2024-25".
 * Mirrors DepreciationService.getCurrentFinancialYear().
 */
function getCurrentFinancialYear() {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-12
  const year = today.getFullYear();
  const fyStartYear = month >= 4 ? year : year - 1;
  const fyEndYY = String(fyStartYear + 1).slice(-2);
  return `${fyStartYear}-${fyEndYY}`;
}

module.exports = { calculate, getCurrentFinancialYear };
