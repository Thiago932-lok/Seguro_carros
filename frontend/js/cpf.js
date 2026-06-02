function cleanCpf(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatCpf(value) {
  const d = cleanCpf(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function validateCpfClient(cpf) {
  const digits = cleanCpf(cpf);
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

function bindCpfInput(input) {
  if (!input || input.dataset.cpfBound === 'true') return;
  input.dataset.cpfBound = 'true';
  input.setAttribute('inputmode', 'numeric');
  input.setAttribute('maxlength', '14');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('placeholder', '000.000.000-00');

  input.addEventListener('input', () => {
    const end = input.selectionEnd;
    const prevLen = input.value.length;
    input.value = formatCpf(input.value);
    const diff = input.value.length - prevLen;
    const pos = Math.max(0, Math.min(input.value.length, (end ?? prevLen) + diff));
    input.setSelectionRange(pos, pos);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindCpfInput(document.getElementById('cpf'));
});
