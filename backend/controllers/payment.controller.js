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

function getOne(req, res, next) {
  try {
    const details = paymentService.getPaymentDetails(req.params.id, req.user.id);
    res.json(details);
  } catch (err) {
    next(err);
  }
}

async function pay(req, res, next) {
  try {
    const method = req.body?.method || 'pix';
    const result = await paymentService.processPayment(req.params.id, req.user.id, method);
    const messages = {
      pix: 'Pagamento PIX confirmado com sucesso!',
      boleto: 'Pagamento via boleto confirmado!',
      card: 'Pagamento com cartão confirmado!',
    };
    res.json({ message: messages[method] || 'Pagamento confirmado', payment: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, pay };
