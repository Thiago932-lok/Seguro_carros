const User = require('../models/User');

function getProfile(req, res) {
  const user = User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(User.toPublic(user));
}

function updateProfile(req, res) {
  const { name, phone, region } = req.body;
  User.update(req.user.id, { name, phone, region });
  const user = User.findById(req.user.id);
  res.json(User.toPublic(user));
}

module.exports = { getProfile, updateProfile };
