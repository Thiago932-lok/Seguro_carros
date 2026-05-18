const { v4: uuid } = require('uuid');
const Payment = require('../models/Payment');

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function generateMonthlyPayments({ userId, insuranceId, monthlyPremium, months = 12 }) {
  const payments = [];
  const start = new Date();
  for (let i = 0; i < months; i++) {
    const due = addMonths(start, i + 1);
    const ref = due.slice(0, 7);
    const id = uuid();
    Payment.create({
      id,
      userId,
      insuranceId,
      amount: monthlyPremium,
      dueDate: due,
      referenceMonth: ref,
      status: i === 0 ? 'pendente' : 'pendente',
    });
    payments.push({ id, dueDate: due, amount: monthlyPremium, referenceMonth: ref });
  }
  return payments;
}

async function processPayment(paymentId, userId) {
  const payment = Payment.findByIdAndUser(paymentId, userId);
  if (!payment) throw Object.assign(new Error('Pagamento não encontrado'), { status: 404 });
  if (payment.status === 'pago') throw Object.assign(new Error('Já pago'), { status: 400 });
  Payment.markPaid(paymentId);
  return Payment.toPublic(Payment.findByIdAndUser(paymentId, userId));
}

module.exports = { generateMonthlyPayments, processPayment };
