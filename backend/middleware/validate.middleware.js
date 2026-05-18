function validateBody(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter(
      (f) => req.body[f] === undefined || req.body[f] === ''
    );
    if (missing.length) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes',
        fields: missing,
      });
    }
    next();
  };
}

function validateCpf(cpf) {
  const digits = String(cpf).replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(digits[9], 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(digits[10], 10);
}

module.exports = { validateBody, validateCpf };
