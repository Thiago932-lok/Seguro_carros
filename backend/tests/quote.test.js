const { calculateMonthlyPremium } = require('../utils/calcInsurance');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const result = calculateMonthlyPremium({
  fipeValue: 50000,
  year: 2022,
  usage: 'particular',
  hasGarage: true,
  region: 'SP',
});

assert(result.monthlyPremium > 0, 'mensalidade deve ser positiva');
assert(result.coveredValue === 50000, 'cobertura 100% FIPE');
console.log('quote.test.js OK — mensalidade:', result.monthlyPremium);
