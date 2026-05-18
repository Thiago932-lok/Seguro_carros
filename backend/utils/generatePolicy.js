function generatePolicyNumber() {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
  return `SEG-${year}-${seq}`;
}

module.exports = { generatePolicyNumber };
