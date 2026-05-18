const db = require('../config/db');

const Payment = {
  create(data) {
    return db
      .prepare(
        `INSERT INTO payments (id, user_id, insurance_id, amount, due_date, status, reference_month)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.id,
        data.userId,
        data.insuranceId,
        data.amount,
        data.dueDate,
        data.status || 'pendente',
        data.referenceMonth
      );
  },

  findByUser(userId) {
    return db
      .prepare(
        `SELECT p.*, i.policy_number
         FROM payments p
         JOIN insurances i ON i.id = p.insurance_id
         WHERE p.user_id = ?
         ORDER BY p.due_date DESC`
      )
      .all(userId);
  },

  findByIdAndUser(id, userId) {
    return db.prepare('SELECT * FROM payments WHERE id = ? AND user_id = ?').get(id, userId);
  },

  markPaid(id) {
    return db
      .prepare(`UPDATE payments SET status = 'pago', paid_at = datetime('now') WHERE id = ?`)
      .run(id);
  },

  toPublic(row) {
    if (!row) return null;
    return {
      id: row.id,
      insuranceId: row.insurance_id,
      policyNumber: row.policy_number,
      amount: row.amount,
      dueDate: row.due_date,
      paidAt: row.paid_at,
      status: row.status,
      referenceMonth: row.reference_month,
    };
  },
};

module.exports = Payment;
