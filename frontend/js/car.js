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
    brands.forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b.codigo;
      opt.textContent = b.nome;
      brandSelect.appendChild(opt);
    });
  } catch {
    brandSelect.innerHTML = '<option value="">FIPE offline - informe valor manual</option>';
  }
}

function setSelectDisabled(selectEl, disabled, placeholder) {
  if (!selectEl) return;
  selectEl.disabled = !!disabled;
  if (placeholder) selectEl.innerHTML = `<option value="">${placeholder}</option>`;
}

async function onBrandChange() {
  const code = document.getElementById('fipe-brand')?.value;
  const modelSelect = document.getElementById('fipe-model');
  const yearSelect = document.getElementById('fipe-year');
  setSelectDisabled(modelSelect, true, code ? 'Carregando modelos...' : 'Selecione a marca');
  setSelectDisabled(yearSelect, true, 'Selecione o modelo');
  if (!code || !modelSelect) return;

  try {
    const data = await api(`/cars/fipe/brands/${code}/models`);
    const models = data.modelos || [];
    modelSelect.innerHTML = '<option value="">Selecione o modelo</option>';
    models.forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m.codigo;
      opt.textContent = m.nome;
      modelSelect.appendChild(opt);
    });
    modelSelect.disabled = false;
  } catch {
    modelSelect.innerHTML = '<option value="">Erro ao carregar modelos</option>';
    modelSelect.disabled = true;
  }
}

async function onModelChange() {
  const brandCode = document.getElementById('fipe-brand')?.value;
  const modelCode = document.getElementById('fipe-model')?.value;
  const yearSelect = document.getElementById('fipe-year');
  setSelectDisabled(yearSelect, true, modelCode ? 'Carregando anos...' : 'Selecione o modelo');
  if (!brandCode || !modelCode || !yearSelect) return;

  try {
    const years = await api(`/cars/fipe/brands/${brandCode}/models/${modelCode}/years`);
    yearSelect.innerHTML = '<option value="">Selecione o ano</option>';
    years.forEach((y) => {
      const opt = document.createElement('option');
      opt.value = y.codigo;
      opt.textContent = y.nome;
      yearSelect.appendChild(opt);
    });
    yearSelect.disabled = false;
  } catch {
    yearSelect.innerHTML = '<option value="">Erro ao carregar anos</option>';
    yearSelect.disabled = true;
  }
}

function fillManualFieldsFromFipe() {
  const brandName = document.getElementById('fipe-brand')?.selectedOptions?.[0]?.textContent;
  const modelName = document.getElementById('fipe-model')?.selectedOptions?.[0]?.textContent;
  const yearName = document.getElementById('fipe-year')?.selectedOptions?.[0]?.textContent;

  if (brandName && brandName !== 'Marca (FIPE)') document.getElementById('brand').value = brandName;
  if (modelName && modelName !== 'Selecione o modelo') document.getElementById('model').value = modelName;
  if (yearName && yearName !== 'Selecione o ano') {
    const year = parseInt(String(yearName).match(/\d{4}/)?.[0] || '', 10);
    if (year) document.getElementById('year').value = String(year);
  }
}

function normalizePlate(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7);
}

function isValidPlate(value) {
  const p = normalizePlate(value);
  return /^[A-Z]{3}\d{4}$/.test(p) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(p);
}

async function onYearChange() {
  const brandCode = document.getElementById('fipe-brand')?.value;
  const modelCode = document.getElementById('fipe-model')?.value;
  const yearCode = document.getElementById('fipe-year')?.value;
  const fipeValueInput = document.getElementById('fipe-value');
  if (!fipeValueInput) return;

  fipeValueInput.disabled = false;
  fipeValueInput.readOnly = false;

  if (!brandCode || !modelCode || !yearCode) return;

  try {
    const price = await api(`/cars/fipe/brands/${brandCode}/models/${modelCode}/years/${yearCode}/price`);
    if (price?.value && Number(price.value) > 0) {
      fipeValueInput.value = String(price.value);
      fipeValueInput.readOnly = true;
      fipeValueInput.disabled = false;
    }
  } catch {
    // Keep manual enabled.
  }
}

async function handleCarSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const alert = document.getElementById('alert');
  hideAlert(alert);

  if (!document.querySelector('input[name="color"]:checked')) {
    showAlert(alert, 'Selecione a cor do veículo.');
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const plate = normalizePlate(document.getElementById('plate').value);
  document.getElementById('plate').value = plate;
  if (!isValidPlate(plate)) {
    showAlert(alert, 'Placa inválida. Use AAA1234 ou ABC1D23.');
    return;
  }

  // If FIPE was selected, auto-fill manual fields for consistency.
  if (document.getElementById('fipe-year')?.value) fillManualFieldsFromFipe();

  const body = {
    brand: document.getElementById('brand').value.trim(),
    model: document.getElementById('model').value.trim(),
    year: document.getElementById('year').value,
    plate,
    color: document.querySelector('input[name="color"]:checked')?.value,
    usageType: document.getElementById('usage').value,
    hasGarage: document.getElementById('garage').checked,
    fipeValue: document.getElementById('fipe-value').value || undefined,
    brandCode: document.getElementById('fipe-brand')?.value || undefined,
    modelCode: document.getElementById('fipe-model')?.value || undefined,
    yearCode: document.getElementById('fipe-year')?.value || undefined,
  };

  try {
    await api('/cars', { method: 'POST', body: JSON.stringify(body) });
    showAlert(alert, 'Veículo cadastrado com sucesso!', 'success');
    e.target.reset();
    setSelectDisabled(document.getElementById('fipe-model'), true, 'Selecione a marca');
    setSelectDisabled(document.getElementById('fipe-year'), true, 'Selecione o modelo');
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
  const usageLabels = { particular: 'Particular', comercial: 'Comercial', app: 'Aplicativo' };
  el.innerHTML = cars
    .map(
      (c) => `
    <article class="vehicle-card">
      <div class="vehicle-icon">🚗</div>
      <div>
        <strong>${c.brand} ${c.model} ${c.year}</strong>
        <div class="vehicle-meta">
          <span>Placa: <strong>${c.plate}</strong></span>
          <span>Cor: ${c.color || '—'}</span>
          <span>FIPE: ${formatMoney(c.fipeValue)}</span>
        </div>
        <div style="margin-top:0.5rem">
          <span class="vehicle-tag">${usageLabels[c.usageType] || c.usageType}</span>
          ${c.hasGarage ? '<span class="vehicle-tag">Garagem</span>' : ''}
        </div>
      </div>
    </article>`
    )
    .join('');
}

document.getElementById('car-form')?.addEventListener('submit', handleCarSubmit);
document.getElementById('fipe-brand')?.addEventListener('change', onBrandChange);
document.getElementById('fipe-model')?.addEventListener('change', onModelChange);
document.getElementById('fipe-year')?.addEventListener('change', onYearChange);
document.getElementById('plate')?.addEventListener('input', (e) => {
  e.target.value = normalizePlate(e.target.value);
});

if (document.getElementById('car-form')) {
  requireAuth();
  loadFipeBrands();
  renderCarsList();
}
