async function handleLogin(e) {
  e.preventDefault();
  const alert = document.getElementById('alert');
  hideAlert(alert);
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    window.location.href = '/pages/dashboard.html';
  } catch (err) {
    showAlert(alert, err.message);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const form = e.target;
  const alert = document.getElementById('alert');
  hideAlert(alert);

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const cpf = cleanCpf(document.getElementById('cpf').value);
  if (cpf.length !== 11) {
    showAlert(alert, 'Informe o CPF completo com 11 dígitos.');
    return;
  }
  if (!validateCpfClient(cpf)) {
    showAlert(alert, 'CPF inválido. Verifique os números informados.');
    return;
  }

  const body = {
    name: document.getElementById('name').value.trim(),
    cpf,
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    phone: document.getElementById('phone').value.trim(),
    region: document.getElementById('region').value,
  };

  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setToken(data.token);
    setUser(data.user);
    window.location.href = '/pages/meu-carro.html';
  } catch (err) {
    showAlert(alert, err.message);
  }
}

function logout() {
  clearAuth();
  window.location.href = '/pages/login.html';
}

document.getElementById('login-form')?.addEventListener('submit', handleLogin);
document.getElementById('register-form')?.addEventListener('submit', handleRegister);
document.getElementById('btn-logout')?.addEventListener('click', logout);
