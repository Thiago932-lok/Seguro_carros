const { v4: uuid } = require('uuid');
const User = require('../models/User');
const Car = require('../models/Car');
const Quote = require('../models/Quote');
const { calculateMonthlyPremium } = require('../utils/calcInsurance');
const fipeService = require('./fipe.service');

function buildQuoteForCar(car, user) {
  const pricing = calculateMonthlyPremium({
    fipeValue: car.fipe_value,
    year: car.year,
    usage: car.usage_type,
    hasGarage: !!car.has_garage,
    region: user.region,
  });

  return {
    fipeValue: car.fipe_value,
    ...pricing,
  };
}

async function simulate(userId, carId) {
  const user = User.findById(userId);
  const car = Car.findByIdAndUser(carId, userId);
  if (!car) throw Object.assign(new Error('Veículo não encontrado'), { status: 404 });

  // If a car was saved without a FIPE value (or legacy value), estimate to avoid wrong quotes.
  if (!car.fipe_value || Number(car.fipe_value) <= 0) {
    const estimated = fipeService.estimateFromSeed(car.brand, car.model, car.year);
    Car.updateFipe(car.id, estimated, car.fipe_code || null);
    car.fipe_value = estimated;
  }

  const result = buildQuoteForCar(car, user);
  const id = uuid();
  Quote.create({
    id,
    userId,
    carId,
    fipeValue: result.fipeValue,
    monthlyPremium: result.monthlyPremium,
    coveredValue: result.coveredValue,
    franchise: result.franchise,
    status: 'pendente',
  });

  return { quoteId: id, ...result, car: Car.toPublic(car) };
}

async function updateCarFipeFromApi(car, brandCode, modelCode, yearCode) {
  try {
    const price = await fipeService.getPrice(brandCode, modelCode, yearCode);
    Car.updateFipe(car.id, price.value, price.code);
    return price.value;
  } catch {
    const estimated = fipeService.estimateFromSeed(car.brand, car.model, car.year);
    Car.updateFipe(car.id, estimated, null);
    return estimated;
  }
}

module.exports = { buildQuoteForCar, simulate, updateCarFipeFromApi };
