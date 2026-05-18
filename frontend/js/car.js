async function loadCars(selectId) {
  const cars = await api('/cars');
  const select = document.getElementById(selectId);
  if (!select) return cars;

  select.innerHTML = '<option value="">Selecione o veículo</option>';
  cars.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.brand} ${c.model} (${c.plate}) - ${formatMoney(c.fipeValue)}`;
    select.appendChild(opt);
  });
  return cars;
}

async function loadFipeBrands() {
  const brandSelect = document.getElementById('fipe-brand');
  if (!brandSelect) return;

  try {
    const brands = await api('/cars/fipe/brands');
    brandSelect.innerHTML = '<option value="">Marca (FIPE)</option>';
    brands.slice(0, 30).forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b.codigo;
      opt.textContent = b.nome;
      brandSelect.appendChild(opt);
    });
  } catch {
    brandSelect.innerHTML = '<option value="">FIPE offline - informe valor manual</option>';
  }
}

async function onBrandChange() {
  const code = document.getElementById('fipe-brand')?.value;
  const modelSelect = document.getElementById('fipe-model');
  if (!code || !modelSelect) return;

  try {
    const data = await api(`/cars/fipe/brands/${code}/models`);
    const models = data.modelos || [];
    modelSelect.innerHTML = '<option value="">Modelo</option>';
    models.slice(0, 40).forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m.codigo;
      opt.textContent = m.nome;
      modelSelect.appendChild(opt);
    });
  } catch {
    modelSelect.innerHTML = '<option value="">Erro ao carregar modelos</option>';
  }
}

async function handleCarSubmit(e) {
  e.preventDefault();
  const alert = document.getElementById('alert');
  hideAlert(alert);

  const body = {
    brand: document.getElementById('brand').value,
    model: document.getElementById('model').value,
    year: document.getElementById('year').value,
    plate: document.getElementById('plate').value,
    color: document.getElementById('color').value,
    usageType: document.getElementById('usage').value,
    hasGarage: document.getElementById('garage').checked,
    fipeValue: document.getElementById('fipe-value').value || undefined,
    brandCode: document.getElementById('fipe-brand')?.value || undefined,
    modelCode: document.getElementById('fipe-model')?.value || undefined,
  };

  try {
    await api('/cars', { method: 'POST', body: JSON.stringify(body) });
    showAlert(alert, 'Veículo cadastrado com sucesso!', 'success');
    e.target.reset();
    if (document.getElementById('cars-list')) await renderCarsList();
  } catch (err) {
    showAlert(alert, err.message);
  }
}

async function renderCarsList() {
  const el = document.getElementById('cars-list');
  if (!el) return;
  const cars = await api('/cars');
  if (!cars.length) {
    el.innerHTML = '<p class="muted">Nenhum veículo cadastrado.</p>';
    return;
  }
  el.innerHTML = cars
    .map(
      (c) => `
    <div class="card">
      <strong>${c.brand} ${c.model} ${c.year}</strong><br>
      Placa: ${c.plate} | FIPE: ${formatMoney(c.fipeValue)}<br>
      Uso: ${c.usageType} | Garagem: ${c.hasGarage ? 'Sim' : 'Não'}
    </div>`
    )
    .join('');
}

document.getElementById('car-form')?.addEventListener('submit', handleCarSubmit);
document.getElementById('fipe-brand')?.addEventListener('change', onBrandChange);

if (document.getElementById('car-form')) {
  requireAuth();
  loadFipeBrands();
  renderCarsList();
}
