const fipeConfig = require('../config/fipe');
const seedCars = require('../../database/seeds/cars_seed');

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), fipeConfig.timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error('FIPE API indisponível');
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function getBrands() {
  const url = `${fipeConfig.baseUrl}/${fipeConfig.vehicleType}/marcas`;
  return fetchJson(url);
}

async function getModels(brandCode) {
  const url = `${fipeConfig.baseUrl}/${fipeConfig.vehicleType}/marcas/${brandCode}/modelos`;
  return fetchJson(url);
}

async function getYears(brandCode, modelCode) {
  const url = `${fipeConfig.baseUrl}/${fipeConfig.vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos`;
  return fetchJson(url);
}

async function getPrice(brandCode, modelCode, yearCode) {
  const url = `${fipeConfig.baseUrl}/${fipeConfig.vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`;
  const data = await fetchJson(url);
  const raw = String(data.Valor || '0').replace(/[^\d,]/g, '').replace(',', '.');
  return {
    code: data.CodigoFipe,
    brand: data.Marca,
    model: data.Modelo,
    year: data.AnoModelo,
    fuel: data.Combustivel,
    value: parseFloat(raw) || 0,
    referenceMonth: data.MesReferencia,
  };
}

function estimateFromSeed(brand, model, year) {
  const match = seedCars.find(
    (c) =>
      c.brand.toLowerCase() === String(brand).toLowerCase() &&
      c.model.toLowerCase().includes(String(model).toLowerCase().slice(0, 8))
  );
  if (match) {
    const age = new Date().getFullYear() - year;
    const depreciation = Math.max(0.55, 1 - age * 0.08);
    return Math.round(match.fipeValue * depreciation);
  }
  const base = 45000 + (year - 2015) * 2500;
  return Math.max(25000, Math.round(base));
}

module.exports = {
  getBrands,
  getModels,
  getYears,
  getPrice,
  estimateFromSeed,
};
