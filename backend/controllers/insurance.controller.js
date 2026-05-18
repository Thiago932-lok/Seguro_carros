const { v4: uuid } = require('uuid');
const Insurance = require('../models/Insurance');
const Quote = require('../models/Quote');
const Car = require('../models/Car');
const User = require('../models/User');
const { generatePolicyNumber } = require('../utils/generatePolicy');
const { calculateMonthlyPremium } = require('../utils/calcInsurance');
const paymentService = require('../services/payment.service');
const emailService = require('../services/email.service');

async function contract(req, res, next) {
  try {
    const { quoteId } = req.body;
    const quote = Quote.findByIdAndUser(quoteId, req.user.id);
    if (!quote) return res.status(404).json({ error: 'Cotação não encontrada' });

    const existing = Insurance.findActiveByUser(req.user.id);
    if (existing.length) {
      return res.status(400).json({ error: 'Você já possui proteção ativa. Cancele antes de contratar outra.' });
    }

    const id = uuid();
    const policyNumber = generatePolicyNumber();
    const validFrom = new Date().toISOString().slice(0, 10);
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    Insurance.create({
      id,
      userId: req.user.id,
      carId: quote.car_id,
      policyNumber,
      coveredValue: quote.covered_value,
      monthlyPremium: quote.monthly_premium,
      franchise: quote.franchise,
      validFrom,
      validUntil: validUntil.toISOString().slice(0, 10),
    });

    Quote.updateStatus(quoteId, 'contratada');
    const payments = paymentService.generateMonthlyPayments({
      userId: req.user.id,
      insuranceId: id,
      monthlyPremium: quote.monthly_premium,
    });

    const user = User.findById(req.user.id);
    await emailService.sendPolicy(user.email, policyNumber);

    res.status(201).json({
      insurance: Insurance.toPublic(
        Insurance.findActiveByUser(req.user.id).find((i) => i.id === id)
      ),
      payments,
    });
  } catch (err) {
    next(err);
  }
}

function list(req, res) {
  const items = Insurance.findActiveByUser(req.user.id).map(Insurance.toPublic);
  res.json(items);
}

async function preview(req, res) {
  const { carId } = req.query;
  const car = Car.findByIdAndUser(carId, req.user.id);
  if (!car) return res.status(404).json({ error: 'Veículo não encontrado' });
  const user = User.findById(req.user.id);
  const pricing = calculateMonthlyPremium({
    fipeValue: car.fipe_value,
    year: car.year,
    usage: car.usage_type,
    hasGarage: !!car.has_garage,
    region: user.region,
  });
  res.json({ car: Car.toPublic(car), ...pricing });
}

module.exports = { contract, list, preview };
