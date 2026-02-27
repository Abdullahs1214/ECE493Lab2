function outputResult(title, result) {
  const output = document.getElementById('output');
  if (!output) return;
  output.textContent = `${title}\n${JSON.stringify(result, null, 2)}`;
}

function bindForm(id, handler) {
  const form = document.getElementById(id);
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await handler(new FormData(form));
    } catch (error) {
      outputResult(`${id} failed`, { error: error.message });
    }
  });
}

function bindButton(id, handler) {
  const button = document.getElementById(id);
  if (!button) return;
  button.addEventListener('click', async () => {
    try {
      await handler();
    } catch (error) {
      outputResult(`${id} failed`, { error: error.message });
    }
  });
}

async function parseResponse(response) {
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (_err) {
    body = { raw: text };
  }

  return {
    status: response.status,
    ok: response.ok,
    body
  };
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return parseResponse(response);
}

async function getJson(url) {
  const response = await fetch(url, { method: 'GET' });
  return parseResponse(response);
}

bindForm('register-form', async (data) => {
  const payload = {
    email: data.get('email'),
    password: data.get('password')
  };
  outputResult('Register', await postJson('/api/register', payload));
});

bindForm('login-form', async (data) => {
  const payload = {
    email: data.get('email'),
    password: data.get('password')
  };
  outputResult('Login', await postJson('/api/login', payload));
});

bindForm('password-form', async (data) => {
  const payload = {
    currentPassword: data.get('currentPassword'),
    newPassword: data.get('newPassword')
  };
  outputResult('Change Password', await postJson('/api/password', payload));
});

bindForm('submission-form', async (data) => {
  const payload = {
    metadata: {
      title: data.get('title'),
      abstract: data.get('abstract'),
      authors: data.get('authors'),
      keywords: data.get('keywords')
    },
    manuscriptFile: {
      filename: data.get('filename'),
      sizeBytes: Number(data.get('sizeBytes'))
    }
  };
  outputResult('Submit Paper', await postJson('/api/submissions', payload));
});

bindButton('pricing-button', async () => {
  outputResult('View Pricing', await getJson('/api/pricing'));
});

bindForm('payment-form', async (data) => {
  const payload = {
    paymentInformation: {
      cardLast4: data.get('cardLast4'),
      billingName: data.get('billingName')
    }
  };
  outputResult('Pay Registration', await postJson('/api/payments', payload));
});
