const BRAZILIAN_UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

function populateRegionSelect(selectEl, selected) {
  const sel = typeof selectEl === 'string' ? document.getElementById(selectEl) : selectEl;
  if (!sel) return;
  sel.innerHTML = BRAZILIAN_UFS.map((uf) => `<option value="${uf}">${uf}</option>`).join('');
  if (selected) sel.value = selected;
}

document.addEventListener('DOMContentLoaded', () => {
  const region = document.getElementById('region');
  if (!region?.hasAttribute('data-auto-region')) return;
  populateRegionSelect(region, 'SP');
});
