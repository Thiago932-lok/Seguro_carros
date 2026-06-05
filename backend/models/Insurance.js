const db = require('../config/db');

const Insurance = {
  create(data) {
    return db
      .prepare(
        `INSERT INTO insurances (id, user_id, car_id, policy_number, covered_value, monthly_premium, franchise, status, valid_from, valid_until)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.id,
        data.userId,
        data.carId,
        data.policyNumber,
        data.coveredValue,
        data.monthlyPremium,
        data.franchise,
        data.status || 'ativo',
        data.validFrom,
        data.validUntil
      );
  },

  findActiveByUser(userId) {
    return db
      .prepare(
        `SELECT i.*, c.brand, c.model, c.plate, c.year
         FROM insurances i
         JOIN cars c ON c.id = i.car_id
         WHERE i.user_id = ? AND i.status IN ('ativo', 'pendente_vistoria')
         ORDER BY i.created_at DESC`
      )
      .all(userId);
  },

  findByIdAndUser(id, userId) {
    return db.prepare('SELECT * FROM insurances WHERE id = ? AND user_id = ?').get(id, userId);
  },

  toPublic(row) {
    if (!row) return null;
    return {
      id: row.id,
      carId: row.car_id,
      policyNumber: row.policy_number,
      coveredValue: row.covered_value,
      monthlyPremium: row.monthly_premium,
      franchise: row.franchise,
      status: row.status,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      brand: row.brand,
      model: row.model,
      plate: row.plate,
      year: row.year,
    };
  },
};

module.exports = Insurance;
