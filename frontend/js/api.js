const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearAuth();
    window.location.href = '/pages/login.html';
    throw new Error(data.error || 'Não autorizado');
  }

  if (!res.ok) {
    const detail = data.fields?.length ? ` (${data.fields.join(', ')})` : '';
    throw new Error((data.error || 'Erro na requisição') + detail);
  }
  return data;
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}

function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function showAlert(el, message, type = 'error') {
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = message;
  el.classList.remove('hidden');
}

function hideAlert(el) {
  if (el) el.classList.add('hidden');
}

function renderSidebar(active) {
  const links = [
    { href: '/pages/dashboard.html', label: 'Painel' },
    { href: '/pages/meu-carro.html', label: 'Meu Carro' },
    { href: '/pages/cotacao.html', label: 'Cotação' },
    { href: '/pages/meu-seguro.html', label: 'Meu Seguro' },
    { href: '/pages/pagamentos.html', label: 'Pagamentos' },
    { href: '/pages/sinistro.html', label: 'Sinistro' },
    { href: '/pages/perfil.html', label: 'Perfil' },
  ];

  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const user = getUser();
  nav.innerHTML = links
    .map((l) => `<a href="${l.href}" class="${active === l.href ? 'active' : ''}">${l.label}</a>`)
    .join('');

  const nameEl = document.getElementById('user-name');
  if (nameEl && user) nameEl.textContent = user.name;
}
