(async () => {
  try {
    const loginResp = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin1@gmail.com', password: 'Admin123' }),
    });
    const loginData = await loginResp.json();
    console.log('LOGIN', loginData);
    if (!loginData.token) {
      throw new Error('Login failed');
    }
    const statsResp = await fetch('http://localhost:3000/api/stats', {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const statsData = await statsResp.json();
    console.log('STATS', statsData);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();