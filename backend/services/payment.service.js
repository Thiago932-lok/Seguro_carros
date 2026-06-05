const { v4: uuid } = require('uuid');
const Payment = require('../models/Payment');
const { generateBarcode, generatePixCode, generateNossoNumero } = require('../utils/generateBoleto');

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

function getPaymentDetails(paymentId, userId) {
  const row = Payment.findDetailByIdAndUser(paymentId, userId);
  if (!row) throw Object.assign(new Error('Pagamento não encontrado'), { status: 404 });

  return {
    id: row.id,
    amount: row.amount,
    dueDate: row.due_date,
    paidAt: row.paid_at,
    status: row.status,
    referenceMonth: row.reference_month,
    policyNumber: row.policy_number,
    payer: {
      name: row.user_name,
      cpf: row.user_cpf,
      email: row.user_email,
    },
    vehicle: {
      brand: row.brand,
      model: row.model,
      plate: row.plate,
      year: row.year,
      color: row.color,
    },
    boleto: {
      beneficiary: 'MobiSeguros Associação LTDA',
      cnpj: '12.345.678/0001-90',
      nossoNumero: generateNossoNumero(row.id),
      barcode: generateBarcode(row.id, row.amount),
      pixCode: generatePixCode(row.id, row.amount, row.policy_number),
      instructions: 'Não receber após o vencimento. Sujeito a multa e juros.',
    },
  };
}

async function processPayment(paymentId, userId, method = 'pix') {
  const payment = Payment.findByIdAndUser(paymentId, userId);
  if (!payment) throw Object.assign(new Error('Pagamento não encontrado'), { status: 404 });
  if (payment.status === 'pago') throw Object.assign(new Error('Já pago'), { status: 400 });
  Payment.markPaid(paymentId);
  const result = Payment.toPublic(Payment.findByIdAndUser(paymentId, userId));
  return { ...result, method };
}

module.exports = { generateMonthlyPayments, getPaymentDetails, processPayment };
