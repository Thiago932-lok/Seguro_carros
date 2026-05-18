const { generatePolicyNumber } = require('../utils/generatePolicy');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const policy = generatePolicyNumber();
assert(policy.startsWith('SEG-'), 'formato apólice');
console.log('insurance.test.js OK —', policy);
