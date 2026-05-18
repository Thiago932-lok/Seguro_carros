const Payment = require('../models/Payment');
const paymentService = require('../services/payment.service');

function list(req, res) {
  const payments = Payment.findByUser(req.user.id).map(Payment.toPublic);
  const summary = {
    total: payments.length,
    paid: payments.filter((p) => p.status === 'pago').length,
    pending: payments.filter((p) => p.status === 'pendente').length,
    nextDue: payments.find((p) => p.status === 'pendente'),
  };
  res.json({ payments, summary });
}

async function pay(req, res, next) {
  try {
    const result = await paymentService.processPayment(req.params.id, req.user.id);
    res.json({ message: 'Pagamento confirmado', payment: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, pay };
