async function loadDashboard() {
  if (!requireAuth()) return;
  renderSidebar('/pages/dashboard.html');

  const [cars, insurances, payments] = await Promise.all([
    api('/cars'),
    api('/insurances'),
    api('/payments'),
  ]);

  document.getElementById('stat-cars').textContent = cars.length;
  document.getElementById('stat-insurance').textContent = insurances.length ? 'Ativo' : 'Sem proteção';
  document.getElementById('stat-premium').textContent = insurances[0]
    ? formatMoney(insurances[0].monthlyPremium)
    : '—';
  document.getElementById('stat-covered').textContent = insurances[0]
    ? formatMoney(insurances[0].coveredValue)
    : '—';

  const pending = payments.summary?.pending || 0;
  document.getElementById('stat-pending').textContent = pending;

  const next = payments.summary?.nextDue;
  const nextEl = document.getElementById('next-payment');
  if (nextEl) {
    nextEl.innerHTML = next
      ? `Próximo vencimento: <strong>${next.dueDate}</strong> — ${formatMoney(next.amount)}`
      : 'Nenhuma parcela pendente.';
  }
}

if (document.getElementById('stat-cars')) loadDashboard();
