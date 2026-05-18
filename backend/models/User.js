const db = require('../config/db');

const User = {
  create({ id, name, cpf, email, phone, passwordHash, region }) {
    return db
      .prepare(
        `INSERT INTO users (id, name, cpf, email, phone, password_hash, region)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(id, name, cpf, email, phone || null, passwordHash, region || 'SP');
  },

  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findByCpf(cpf) {
    return db.prepare('SELECT * FROM users WHERE cpf = ?').get(cpf);
  },

  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  update(id, { name, phone, region }) {
    return db
      .prepare(
        `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone),
         region = COALESCE(?, region) WHERE id = ?`
      )
      .run(name, phone, region, id);
  },

  toPublic(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      cpf: row.cpf,
      email: row.email,
      phone: row.phone,
      region: row.region,
      createdAt: row.created_at,
    };
  },
};

module.exports = User;
