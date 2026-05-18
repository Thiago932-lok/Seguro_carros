const { validateCpf } = require('../middleware/validate.middleware');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(validateCpf('52998224725') === true, 'CPF válido');
assert(validateCpf('11111111111') === false, 'CPF inválido');
console.log('auth.test.js OK');
