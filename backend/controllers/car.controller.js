const { v4: uuid } = require('uuid');
const Car = require('../models/Car');
const quoteService = require('../services/quote.service');
const fipeService = require('../services/fipe.service');

function isValidPlate(raw) {
  const p = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const old = /^[A-Z]{3}\d{4}$/; // AAA1234
  const mercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/; // ABC1D23
  return old.test(p) || mercosul.test(p);
}

async function list(req, res) {
  const cars = Car.findByUser(req.user.id).map(Car.toPublic);
  res.json(cars);
}

async function create(req, res, next) {
  try {
    const { brand, model, year, plate, color, usageType, hasGarage, fipeValue, brandCode, modelCode, yearCode } =
      req.body;

    if (!isValidPlate(plate)) {
      return res.status(400).json({ error: 'Placa inválida. Use AAA1234 ou ABC1D23.' });
    }

    let value = Number(fipeValue) || 0;
    let fipeCode = null;
    const id = uuid();

    // Prefer FIPE API when codes are provided (most accurate).
    if (brandCode && modelCode && yearCode) {
      try {
        const price = await fipeService.getPrice(brandCode, modelCode, yearCode);
        value = price.value || value;
        fipeCode = price.code || null;
      } catch {
        // If FIPE is offline, we will estimate after creating the record.
      }
    }

    Car.create({
      id,
      userId: req.user.id,
      brand,
      model,
      year: Number(year),
      plate,
      color,
      fipeCode,
      fipeValue: value || 0,
      usageType,
      hasGarage: !!hasGarage,
    });

    // If no FIPE value was provided or fetched, estimate from seed.
    if (!value) {
      value = fipeService.estimateFromSeed(brand, model, Number(year));
      Car.updateFipe(id, value, null);
    }

    res.status(201).json(Car.toPublic(Car.findById(id)));
  } catch (err) {
    next(err);
  }
}

async function getFipeBrands(_req, res, next) {
  try {
    const brands = await fipeService.getBrands();
    res.json(brands);
  } catch (err) {
    next(err);
  }
}

async function getFipeModels(req, res, next) {
  try {
    const models = await fipeService.getModels(req.params.brandCode);
    res.json(models);
  } catch (err) {
    next(err);
  }
}

async function getFipeYears(req, res, next) {
  try {
    const years = await fipeService.getYears(req.params.brandCode, req.params.modelCode);
    res.json(years);
  } catch (err) {
    next(err);
  }
}

async function getFipePrice(req, res, next) {
  try {
    const price = await fipeService.getPrice(
      req.params.brandCode,
      req.params.modelCode,
      req.params.yearCode
    );
    res.json(price);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getFipeBrands, getFipeModels, getFipeYears, getFipePrice };
