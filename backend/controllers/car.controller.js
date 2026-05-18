const { v4: uuid } = require('uuid');
const Car = require('../models/Car');
const quoteService = require('../services/quote.service');
const fipeService = require('../services/fipe.service');

async function list(req, res) {
  const cars = Car.findByUser(req.user.id).map(Car.toPublic);
  res.json(cars);
}

async function create(req, res, next) {
  try {
    const { brand, model, year, plate, color, usageType, hasGarage, fipeValue, brandCode, modelCode, yearCode } =
      req.body;

    let value = Number(fipeValue) || 0;
    const id = uuid();

    Car.create({
      id,
      userId: req.user.id,
      brand,
      model,
      year: Number(year),
      plate,
      color,
      fipeValue: value || 1,
      usageType,
      hasGarage: !!hasGarage,
    });

    const car = Car.findById(id);
    if (brandCode && modelCode && yearCode) {
      value = await quoteService.updateCarFipeFromApi(car, brandCode, modelCode, yearCode);
    } else if (!value) {
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

module.exports = { list, create, getFipeBrands, getFipeModels };
