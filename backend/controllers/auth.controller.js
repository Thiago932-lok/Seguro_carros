const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const User = require('../models/User');
const { validateCpf } = require('../middleware/validate.middleware');
const emailService = require('../services/email.service');

async function register(req, res, next) {
  try {
    const { name, cpf, email, password, phone, region } = req.body;
    const cpfClean = String(cpf).replace(/\D/g, '');

    if (!validateCpf(cpfClean)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }
    if (User.findByEmail(email)) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    if (User.findByCpf(cpfClean)) {
      return res.status(409).json({ error: 'CPF já cadastrado' });
    }

    const id = uuid();
    const passwordHash = await bcrypt.hash(password, 10);
    User.create({ id, name, cpf: cpfClean, email, phone, passwordHash, region });
    await emailService.sendWelcome(email, name);

    const token = jwt.sign(
      { id, email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Cadastro realizado',
      token,
      user: User.toPublic(User.findById(id)),
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: User.toPublic(user) });
  } catch (err) {
    next(err);
  }
}

function logout(_req, res) {
  res.json({ message: 'Logout realizado (remova o token no cliente)' });
}

module.exports = { register, login, logout };
