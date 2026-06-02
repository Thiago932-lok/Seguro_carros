const { validateCpf } = require('../middleware/validate.middleware');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(validateCpf('52998224725') === true, 'CPF válido');
assert(validateCpf('529.982.247-25') === true, 'CPF formatado');
assert(validateCpf('11111111111') === false, 'CPF inválido');
assert(validateCpf('1234567890') === false, 'CPF incompleto');
console.log('auth.test.js OK');
