// backend/src/scripts/verify-admin-auth.ts
// Verification script for Admin Console Authentication & Session Lifecycle

import app from '../app';
import { Server } from 'http';

async function verifyAdminAuth() {
  console.log('================================================================');
  console.log('🔑 ADMIN CONSOLE AUTHENTICATION & SESSION VERIFICATION');
  console.log('================================================================\n');

  let server: Server | null = null;
  const PORT = 5007;
  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, description: string) => {
    total++;
    if (condition) {
      console.log(` ✅ PASS [Check ${total}]: ${description}`);
      passed++;
    } else {
      console.error(` ❌ FAIL [Check ${total}]: ${description}`);
      throw new Error(`Auth Verification Failed: ${description}`);
    }
  };

  try {
    // 1. Start HTTP Server
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => resolve());
    });
    assert(!!server, 'Backend HTTP server running on port 5007');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@denischamkaga.com';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Denis@Platform2025';

    // 2. Test POST /api/v1/auth/login
    console.log(`\n2. Testing POST /api/v1/auth/login with ${adminEmail}...`);
    const loginRes = await fetch(`http://localhost:${PORT}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
    });

    const loginData = await loginRes.json() as any;
    assert(loginRes.status === 200, `POST /api/v1/auth/login returned HTTP 200 OK`);
    assert(loginData.success === true, 'Response body success is true');
    assert(!!loginData.data.accessToken, 'Access Token (JWT) issued');
    assert(!!loginData.data.refreshToken, 'Refresh Token issued');
    assert(loginData.data.user.email === adminEmail, `Authenticated user email matches (${adminEmail})`);
    assert(loginData.data.user.role === 'super_admin', `Authenticated user role is super_admin`);

    const { accessToken, refreshToken } = loginData.data;

    // 3. Test GET /api/v1/auth/me with Bearer Token
    console.log('\n3. Testing GET /api/v1/auth/me (Authenticated Session)...');
    const meRes = await fetch(`http://localhost:${PORT}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const meData = await meRes.json() as any;
    assert(meRes.status === 200, 'GET /api/v1/auth/me returned HTTP 200 OK');
    assert(meData.data.email === adminEmail, 'Session verified via Bearer token');

    // 4. Test POST /api/v1/auth/refresh
    console.log('\n4. Testing POST /api/v1/auth/refresh (Token Rotation)...');
    const refreshRes = await fetch(`http://localhost:${PORT}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const refreshData = await refreshRes.json() as any;
    assert(refreshRes.status === 200, 'POST /api/v1/auth/refresh returned HTTP 200 OK');
    assert(!!refreshData.data.accessToken, 'Rotated Access Token generated successfully');

    console.log('\n================================================================');
    console.log(`✅ ADMIN CONSOLE AUTHENTICATION VERIFICATION PASSED: ${passed}/${total}`);
    console.log('================================================================\n');
  } catch (error) {
    console.error('\n❌ AUTHENTICATION VERIFICATION FAILED:', error);
    process.exit(1);
  } finally {
    if (server) {
      (server as Server).close();
    }
  }
}

verifyAdminAuth();
