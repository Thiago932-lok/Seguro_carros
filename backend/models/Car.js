const db = require('../config/db');

const Car = {
  create(data) {
    return db
      .prepare(
        `INSERT INTO cars (id, user_id, brand, model, year, plate, color, fipe_code, fipe_value, usage_type, has_garage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.id,
        data.userId,
        data.brand,
        data.model,
        data.year,
        data.plate.toUpperCase(),
        data.color || null,
        data.fipeCode || null,
        data.fipeValue,
        data.usageType || 'particular',
        data.hasGarage ? 1 : 0
      );
  },

  findByUser(userId) {
    return db.prepare('SELECT * FROM cars WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  },

  findById(id) {
    return db.prepare('SELECT * FROM cars WHERE id = ?').get(id);
  },

  findByIdAndUser(id, userId) {
    return db.prepare('SELECT * FROM cars WHERE id = ? AND user_id = ?').get(id, userId);
  },

  updateFipe(id, fipeValue, fipeCode) {
    return db
      .prepare('UPDATE cars SET fipe_value = ?, fipe_code = ? WHERE id = ?')
      .run(fipeValue, fipeCode || null, id);
  },

  toPublic(row) {
    if (!row) return null;
    return {
      id: row.id,
      brand: row.brand,
      model: row.model,
      year: row.year,
      plate: row.plate,
      color: row.color,
      fipeCode: row.fipe_code,
      fipeValue: row.fipe_value,
      usageType: row.usage_type,
      hasGarage: !!row.has_garage,
      createdAt: row.created_at,
    };
  },
};

module.exports = Car;
