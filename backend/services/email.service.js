/** Stub de envio de e-mail — integrar SMTP em produção */
async function sendWelcome(email, name) {
  console.log(`[email] Boas-vindas para ${name} <${email}>`);
  return { sent: true };
}

async function sendPaymentReminder(email, amount, dueDate) {
  console.log(`[email] Lembrete pagamento R$ ${amount} venc. ${dueDate} -> ${email}`);
  return { sent: true };
}

async function sendPolicy(email, policyNumber) {
  console.log(`[email] Apólice ${policyNumber} enviada para ${email}`);
  return { sent: true };
}

module.exports = { sendWelcome, sendPaymentReminder, sendPolicy };
