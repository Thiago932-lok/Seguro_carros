/**
 * Precificação proteção veicular (somente carros).
 * Base: % mensal sobre valor FIPE + ajustes por perfil do veículo.
 */

function getBaseRate(fipeValue) {
  if (fipeValue <= 30000) return 0.004;
  if (fipeValue <= 60000) return 0.0035;
  if (fipeValue <= 100000) return 0.003;
  return 0.0025;
}

function yearAdjustment(year) {
  const current = new Date().getFullYear();
  const age = current - year;
  if (age <= 5) return -0.05;
  if (age <= 10) return 0;
  return 0.1;
}

function usageAdjustment(usage) {
  if (usage === 'comercial') return 0.15;
  if (usage === 'app') return 0.12;
  return 0;
}

function garageAdjustment(hasGarage) {
  return hasGarage ? -0.08 : 0;
}

function regionAdjustment(region) {
  const highRisk = ['RJ', 'SP', 'BA', 'PE', 'CE'];
  if (highRisk.includes(String(region || '').toUpperCase())) return 0.1;
  return 0;
}

function calculateMonthlyPremium({
  fipeValue,
  year,
  usage = 'particular',
  hasGarage = false,
  region = 'SP',
  coveragePercent = 100,
}) {
  const value = Number(fipeValue) || 0;
  if (value <= 0) {
    return {
      monthlyPremium: 0,
      coveredValue: 0,
      franchise: 0,
      breakdown: {},
    };
  }

  const baseRate = getBaseRate(value);
  let multiplier =
    1 +
    yearAdjustment(Number(year)) +
    usageAdjustment(usage) +
    garageAdjustment(hasGarage) +
    regionAdjustment(region);

  multiplier = Math.max(0.7, Math.min(multiplier, 1.5));

  const monthlyPremium = Math.round(value * baseRate * multiplier * 100) / 100;
  const coveredValue = Math.round(value * (coveragePercent / 100) * 100) / 100;
  const franchise = Math.round(coveredValue * 0.05 * 100) / 100;

  return {
    monthlyPremium,
    coveredValue,
    franchise,
    breakdown: {
      fipeValue: value,
      baseRatePercent: baseRate * 100,
      multiplier,
      coveragePercent,
    },
  };
}

module.exports = {
  getBaseRate,
  calculateMonthlyPremium,
};
