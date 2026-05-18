const Quote = require('../models/Quote');
const quoteService = require('../services/quote.service');

async function simulate(req, res, next) {
  try {
    const result = await quoteService.simulate(req.user.id, req.body.carId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

function list(req, res) {
  const quotes = Quote.findByUser(req.user.id).map(Quote.toPublic);
  res.json(quotes);
}

module.exports = { simulate, list };
