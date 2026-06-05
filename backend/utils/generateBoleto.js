function generateBarcode(paymentId, amount) {
  const base = String(paymentId).replace(/-/g, '').slice(0, 12).padEnd(12, '0');
  const cents = String(Math.round(Number(amount) * 100)).padStart(10, '0');
  return `23793.38128 ${base.slice(0, 5)}.${base.slice(5, 10)} ${cents.slice(0, 5)}.${cents.slice(5)} 1 999900000${cents}`;
}

function generatePixCode(paymentId, amount, policyNumber) {
  const payload = `00020126580014BR.GOV.BCB.PIX0136${paymentId}520400005303986540${Number(amount).toFixed(2)}5802BR5925MobiSeguros Protecao6009Teresina62070503***6304`;
  const hash = paymentId.replace(/-/g, '').slice(0, 4).toUpperCase();
  return `${payload}${hash}${String(policyNumber || '').slice(-4)}`;
}

function generateNossoNumero(paymentId) {
  return String(paymentId).replace(/-/g, '').slice(0, 10).toUpperCase();
}

module.exports = { generateBarcode, generatePixCode, generateNossoNumero };
