async function runSimulation() {
  const alert = document.getElementById('alert');
  const carId = document.getElementById('car-select')?.value;
  hideAlert(alert);

  if (!carId) {
    showAlert(alert, 'Selecione um veículo');
    return;
  }

  try {
    const data = await api('/quotes/simulate', {
      method: 'POST',
      body: JSON.stringify({ carId }),
    });

    document.getElementById('quote-result')?.classList.remove('hidden');
    document.getElementById('monthly-price').textContent = formatMoney(data.monthlyPremium);
    document.getElementById('covered-value').textContent = formatMoney(data.coveredValue);
    document.getElementById('franchise-value').textContent = formatMoney(data.franchise);
    document.getElementById('fipe-display').textContent = formatMoney(data.fipeValue);
    document.getElementById('last-quote-id').value = data.quoteId;
  } catch (err) {
    showAlert(alert, err.message);
  }
}

async function contractInsurance() {
  const alert = document.getElementById('alert');
  const quoteId = document.getElementById('last-quote-id')?.value;
  if (!quoteId) {
    showAlert(alert, 'Faça uma cotação primeiro');
    return;
  }

  try {
    await api('/insurances/contract', {
      method: 'POST',
      body: JSON.stringify({ quoteId }),
    });
    showAlert(alert, 'Proteção contratada! Redirecionando...', 'success');
    setTimeout(() => (window.location.href = '/pages/meu-seguro.html'), 1500);
  } catch (err) {
    showAlert(alert, err.message);
  }
}

async function initQuotePage() {
  if (!requireAuth()) return;
  await loadCars('car-select');
  document.getElementById('btn-simulate')?.addEventListener('click', runSimulation);
  document.getElementById('btn-contract')?.addEventListener('click', contractInsurance);
}

initQuotePage();
