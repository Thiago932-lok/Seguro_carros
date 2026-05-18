const { v4: uuid } = require('uuid');
const Claim = require('../models/Claim');
const Insurance = require('../models/Insurance');

function list(req, res) {
  res.json(Claim.findByUser(req.user.id).map(Claim.toPublic));
}

function create(req, res) {
  const { insuranceId, type, description, incidentDate } = req.body;
  const insurance = Insurance.findByIdAndUser(insuranceId, req.user.id);
  if (!insurance) return res.status(404).json({ error: 'Apólice não encontrada' });

  const id = uuid();
  Claim.create({
    id,
    userId: req.user.id,
    insuranceId,
    carId: insurance.car_id,
    type,
    description,
    incidentDate,
  });

  res.status(201).json({
    message: 'Sinistro registrado. Nossa equipe entrará em contato.',
    claim: Claim.toPublic(Claim.findByUser(req.user.id)[0]),
  });
}

module.exports = { list, create };
