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
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calcCheck = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += parseInt(digits[i], 10) * (len + 1 - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return calcCheck(9) === parseInt(digits[9], 10) && calcCheck(10) === parseInt(digits[10], 10);
}

module.exports = { validateBody, validateCpf };
