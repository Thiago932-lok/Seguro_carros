const db = require('../config/db');

const Quote = {
  create(data) {
    return db
      .prepare(
        `INSERT INTO quotes (id, user_id, car_id, fipe_value, monthly_premium, covered_value, franchise, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.id,
        data.userId,
        data.carId,
        data.fipeValue,
        data.monthlyPremium,
        data.coveredValue,
        data.franchise,
        data.status || 'pendente'
      );
  },

  updateValues(id, userId, data) {
    return db
      .prepare(
        `UPDATE quotes
         SET fipe_value = ?, monthly_premium = ?, covered_value = ?, franchise = ?
         WHERE id = ? AND user_id = ?`
      )
      .run(data.fipeValue, data.monthlyPremium, data.coveredValue, data.franchise, id, userId);
  },

  findByUser(userId) {
    return db
      .prepare(
        `SELECT q.*, c.brand, c.model, c.plate
         FROM quotes q
         JOIN cars c ON c.id = q.car_id
         WHERE q.user_id = ?
         ORDER BY q.created_at DESC`
      )
      .all(userId);
  },

  findByIdAndUser(id, userId) {
    return db.prepare('SELECT * FROM quotes WHERE id = ? AND user_id = ?').get(id, userId);
  },

  updateStatus(id, status) {
    return db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(status, id);
  },

  toPublic(row) {
    if (!row) return null;
    return {
      id: row.id,
      carId: row.car_id,
      fipeValue: row.fipe_value,
      monthlyPremium: row.monthly_premium,
      coveredValue: row.covered_value,
      franchise: row.franchise,
      status: row.status,
      brand: row.brand,
      model: row.model,
      plate: row.plate,
      createdAt: row.created_at,
    };
  },
};

module.exports = Quote;
