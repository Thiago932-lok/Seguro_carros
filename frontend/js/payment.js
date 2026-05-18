async function loadPayments() {
  if (!requireAuth()) return;
  renderSidebar('/pages/pagamentos.html');

  const data = await api('/payments');
  const tbody = document.getElementById('payments-body');
  if (!tbody) return;

  tbody.innerHTML = data.payments
    .map(
      (p) => `
    <tr>
      <td>${p.referenceMonth}</td>
      <td>${formatMoney(p.amount)}</td>
      <td>${p.dueDate}</td>
      <td><span class="badge badge-${p.status}">${p.status}</span></td>
      <td>
        ${
          p.status === 'pendente'
            ? `<button class="btn btn-primary btn-sm" data-pay="${p.id}">Pagar</button>`
            : p.paidAt || '—'
        }
      </td>
    </tr>`
    )
    .join('');

  tbody.querySelectorAll('[data-pay]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await api(`/payments/${btn.dataset.pay}/pay`, { method: 'POST' });
        loadPayments();
      } catch (err) {
        alert(err.message);
      }
    });
  });

  document.getElementById('summary-paid').textContent = data.summary.paid;
  document.getElementById('summary-pending').textContent = data.summary.pending;
}

loadPayments();
