let currentPaymentId = null;

function formatCpfDisplay(cpf) {
  const d = String(cpf || '').replace(/\D/g, '');
  if (d.length !== 11) return cpf || '—';
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatMonthRef(ref) {
  if (!ref) return '—';
  const [y, m] = ref.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[Number(m) - 1] || m}/${y}`;
}

function openModal() {
  document.getElementById('boleto-modal')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('boleto-modal')?.classList.add('hidden');
  document.body.style.overflow = '';
  currentPaymentId = null;
}

function switchTab(tab) {
  document.querySelectorAll('.payment-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll('.payment-panel').forEach((p) => {
    p.classList.toggle('active', p.id === `panel-${tab}`);
  });
}

async function openBoleto(paymentId) {
  try {
    const data = await api(`/payments/${paymentId}`);
    currentPaymentId = paymentId;

    document.getElementById('boleto-amount').textContent = formatMoney(data.amount);
    document.getElementById('boleto-payer').textContent = data.payer?.name || '—';
    document.getElementById('boleto-cpf').textContent = formatCpfDisplay(data.payer?.cpf);
    document.getElementById('boleto-policy').textContent = data.policyNumber || '—';
    document.getElementById('boleto-vehicle').textContent = data.vehicle
      ? `${data.vehicle.brand} ${data.vehicle.model} — ${data.vehicle.plate}`
      : '—';
    document.getElementById('boleto-ref').textContent = formatMonthRef(data.referenceMonth);
    document.getElementById('boleto-due').textContent = data.dueDate || '—';
    document.getElementById('boleto-number').textContent = data.boleto?.nossoNumero || '—';
    document.getElementById('boleto-barcode').textContent = data.boleto?.barcode || '—';
    document.getElementById('pix-code').value = data.boleto?.pixCode || '';

    switchTab('pix');
    openModal();
  } catch (err) {
    alert(err.message);
  }
}

async function confirmPayment(method) {
  if (!currentPaymentId) return;
  try {
    const res = await api(`/payments/${currentPaymentId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ method }),
    });
    closeModal();
    alert(res.message || 'Pagamento confirmado!');
    loadPayments();
  } catch (err) {
    alert(err.message);
  }
}

function downloadBoletoPdf() {
  const content = document.getElementById('boleto-content');
  if (!content) return;
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>Boleto MobiSeguros</title>
    <style>body{font-family:Arial,sans-serif;padding:2rem;max-width:700px;margin:0 auto}
    h1{color:#0a4d26}table{width:100%;border-collapse:collapse;margin:1rem 0}
    td{padding:0.5rem;border-bottom:1px solid #ddd;font-size:14px}
    .barcode{font-family:monospace;letter-spacing:2px;margin:1rem 0;padding:1rem;border:1px dashed #ccc}
    </style></head><body>
    <h1>MobiSeguros — Boleto de Mensalidade</h1>
    ${content.innerHTML}
    <p style="margin-top:2rem;font-size:12px;color:#666">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
    </body></html>
  `);
  win.document.close();
  win.print();
}

async function loadPayments() {
  if (!requireAuth()) return;
  renderSidebar('/pages/pagamentos.html');

  const data = await api('/payments');
  const tbody = document.getElementById('payments-body');
  if (!tbody) return;

  const statusLabels = { pendente: 'Pendente', pago: 'Pago', atrasado: 'Atrasado' };

  tbody.innerHTML = data.payments.length
    ? data.payments
        .map(
          (p) => `
    <tr>
      <td>${formatMonthRef(p.referenceMonth)}</td>
      <td><strong>${formatMoney(p.amount)}</strong></td>
      <td>${p.dueDate}</td>
      <td><span class="badge badge-${p.status}">${statusLabels[p.status] || p.status}</span></td>
      <td>
        ${
          p.status === 'pendente'
            ? `<button class="btn btn-primary btn-sm" data-pay="${p.id}">Pagar</button>`
            : `<span class="muted">${p.paidAt ? `Pago em ${p.paidAt.slice(0, 10)}` : '—'}</span>`
        }
      </td>
    </tr>`
        )
        .join('')
    : '<tr><td colspan="5" class="muted">Nenhuma mensalidade encontrada. Contrate uma proteção primeiro.</td></tr>';

  tbody.querySelectorAll('[data-pay]').forEach((btn) => {
    btn.addEventListener('click', () => openBoleto(btn.dataset.pay));
  });

  document.getElementById('summary-paid').textContent = data.summary.paid;
  document.getElementById('summary-pending').textContent = data.summary.pending;
  const next = data.summary?.nextDue;
  document.getElementById('summary-next').textContent = next
    ? `${next.dueDate} — ${formatMoney(next.amount)}`
    : '—';
}

document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('modal-backdrop')?.addEventListener('click', closeModal);

document.querySelectorAll('.payment-tab').forEach((tab) => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

document.getElementById('btn-copy-pix')?.addEventListener('click', async () => {
  const code = document.getElementById('pix-code')?.value;
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
    alert('Código PIX copiado!');
  } catch {
    document.getElementById('pix-code')?.select();
    document.execCommand('copy');
    alert('Código PIX copiado!');
  }
});

document.getElementById('btn-pay-pix')?.addEventListener('click', () => confirmPayment('pix'));
document.getElementById('btn-pay-boleto')?.addEventListener('click', () => confirmPayment('boleto'));
document.getElementById('btn-pay-card')?.addEventListener('click', () => confirmPayment('card'));
document.getElementById('btn-download-boleto')?.addEventListener('click', downloadBoletoPdf);

loadPayments();
