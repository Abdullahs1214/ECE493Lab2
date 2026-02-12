function bindForm(id, handler) {
  const form = document.getElementById(id);
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await handler(new FormData(form));
  });
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response.json();
}

bindForm('register-form', async (data) => {
  const payload = {
    email: data.get('email'),
    password: data.get('password')
  };
  console.log(await postJson('/api/register', payload));
});

bindForm('login-form', async (data) => {
  const payload = {
    email: data.get('email'),
    password: data.get('password')
  };
  console.log(await postJson('/api/login', payload));
});

bindForm('password-form', async (data) => {
  const payload = {
    currentPassword: data.get('currentPassword'),
    newPassword: data.get('newPassword')
  };
  console.log(await postJson('/api/password', payload));
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
  console.log(await postJson('/api/submissions', payload));
});
