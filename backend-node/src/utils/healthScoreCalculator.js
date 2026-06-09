/**
 * Health Score Calculator.
 *
 * Multi-factor scoring model:
 *  - Age Score      (30%) — how old vs useful life
 *  - Maintenance    (25%) — frequency of maintenance
 *  - Repair Cost    (20%) — total repair cost vs purchase cost
 *  - Downtime       (15%) — total downtime hours
 *  - Warranty       (10%) — warranty status
 *
 * Final Score: 0 (critical) → 100 (excellent)
 */

/**
 * Determine health level from score.
 */
function getHealthLevel(score) {
  if (score >= 85) return 'EXCELLENT';
  if (score >= 70) return 'GOOD';
  if (score >= 50) return 'AVERAGE';
  if (score >= 30) return 'POOR';
  return 'CRITICAL';
}

/**
 * Determine risk level from score.
 */
function getRiskLevel(score) {
  if (score >= 60) return 'LOW';
  if (score >= 35) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Calculate health score for an asset.
 *
 * @param {Date|string|null} purchaseDate
 * @param {number} usefulLife             - Years
 * @param {number} maintenanceCount       - Total maintenance requests
 * @param {number} repairCost             - Total repair costs
 * @param {number} purchaseCost           - Original purchase cost
 * @param {number} downtimeHours          - Total downtime hours
 * @param {Date|string|null} warrantyExpiry
 * @returns {{ healthScore, healthLevel, riskLevel, riskScore, ageScore, maintenanceScore, repairCostScore, downtimeScore, warrantyScore }}
 */
function calculate(purchaseDate, usefulLife, maintenanceCount, repairCost, purchaseCost, downtimeHours, warrantyExpiry) {
  const life = parseInt(usefulLife) || 5;

  // ─── Age Score (0-100) ────────────────────────────────────────
  let ageScore = 100;
  if (purchaseDate) {
    const purchaseD = purchaseDate instanceof Date ? purchaseDate : new Date(purchaseDate);
    if (!isNaN(purchaseD.getTime())) {
      const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
      const yearsElapsed = (Date.now() - purchaseD) / msPerYear;
      const ageRatio = Math.min(yearsElapsed / life, 1.5);
      ageScore = Math.max(0, 100 - (ageRatio * 100 * (2 / 3)));
    }
  }

  // ─── Maintenance Score (0-100) ────────────────────────────────
  // More maintenance = lower score. Penalise >5 incidents heavily.
  const mCount = parseInt(maintenanceCount) || 0;
  let maintenanceScore = 100;
  if (mCount > 0) {
    maintenanceScore = Math.max(0, 100 - (mCount * 10));
  }

  // ─── Repair Cost Score (0-100) ────────────────────────────────
  // High repair cost relative to purchase cost = lower score
  const totalRepair = parseFloat(repairCost) || 0;
  const purchaseCostF = parseFloat(purchaseCost) || 1;
  let repairCostScore = 100;
  if (totalRepair > 0 && purchaseCostF > 0) {
    const ratio = Math.min(totalRepair / purchaseCostF, 1);
    repairCostScore = Math.max(0, 100 - (ratio * 100));
  }

  // ─── Downtime Score (0-100) ───────────────────────────────────
  // Each 10h of downtime reduces score by 5 points
  const downtime = parseFloat(downtimeHours) || 0;
  const downtimeScore = Math.max(0, 100 - (downtime / 10) * 5);

  // ─── Warranty Score (0-100) ───────────────────────────────────
  let warrantyScore = 50; // Unknown/no warranty = neutral
  if (warrantyExpiry) {
    const expiryD = warrantyExpiry instanceof Date ? warrantyExpiry : new Date(warrantyExpiry);
    if (!isNaN(expiryD.getTime())) {
      const daysLeft = (expiryD - Date.now()) / (24 * 60 * 60 * 1000);
      if (daysLeft > 365) warrantyScore = 100;
      else if (daysLeft > 180) warrantyScore = 80;
      else if (daysLeft > 90)  warrantyScore = 60;
      else if (daysLeft > 0)   warrantyScore = 30;
      else warrantyScore = 0; // Expired
    }
  }

  // ─── Weighted Final Score ─────────────────────────────────────
  const healthScore =
    (ageScore * 0.30) +
    (maintenanceScore * 0.25) +
    (repairCostScore * 0.20) +
    (downtimeScore * 0.15) +
    (warrantyScore * 0.10);

  const finalScore = parseFloat(Math.min(100, Math.max(0, healthScore)).toFixed(1));

  // Risk score is inverse
  const riskScore = parseFloat((100 - finalScore).toFixed(1));

  return {
    healthScore: finalScore,
    healthLevel: getHealthLevel(finalScore),
    riskLevel: getRiskLevel(finalScore),
    riskScore,
    ageScore: parseFloat(ageScore.toFixed(1)),
    maintenanceScore: parseFloat(maintenanceScore.toFixed(1)),
    repairCostScore: parseFloat(repairCostScore.toFixed(1)),
    downtimeScore: parseFloat(downtimeScore.toFixed(1)),
    warrantyScore: parseFloat(warrantyScore.toFixed(1)),
  };
}

module.exports = { calculate, getHealthLevel, getRiskLevel };
