const db = require('../config/db');

const Claim = {
  create(data) {
    return db
      .prepare(
        `INSERT INTO claims (id, user_id, insurance_id, car_id, type, description, incident_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.id,
        data.userId,
        data.insuranceId,
        data.carId,
        data.type,
        data.description,
        data.incidentDate,
        data.status || 'aberto'
      );
  },

  findByUser(userId) {
    return db
      .prepare(
        `SELECT cl.*, c.plate, c.brand, c.model, i.policy_number
         FROM claims cl
         JOIN cars c ON c.id = cl.car_id
         JOIN insurances i ON i.id = cl.insurance_id
         WHERE cl.user_id = ?
         ORDER BY cl.created_at DESC`
      )
      .all(userId);
  },

  toPublic(row) {
    if (!row) return null;
    return {
      id: row.id,
      type: row.type,
      description: row.description,
      incidentDate: row.incident_date,
      status: row.status,
      plate: row.plate,
      brand: row.brand,
      model: row.model,
      policyNumber: row.policy_number,
      createdAt: row.created_at,
    };
  },
};

module.exports = Claim;
