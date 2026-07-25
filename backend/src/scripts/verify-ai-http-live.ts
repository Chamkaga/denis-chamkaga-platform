// backend/src/scripts/verify-ai-http-live.ts
// Live HTTP Integration Verification for Public AI Assistant Chat (/api/v1/ai/chat)

import app from '../app';
import { Server } from 'http';

async function verifyLiveHttpEndpoint() {
  console.log('================================================================');
  console.log('🌐 LIVE HTTP ENDPOINT VERIFICATION FOR /api/v1/ai/chat');
  console.log('================================================================\n');

  let server: Server | null = null;
  const PORT = 5005;

  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, description: string) => {
    total++;
    if (condition) {
      console.log(` ✅ PASS [Check ${total}]: ${description}`);
      passed++;
    } else {
      console.error(` ❌ FAIL [Check ${total}]: ${description}`);
      throw new Error(`HTTP Endpoint Verification Failed: ${description}`);
    }
  };

  try {
    // Start local server
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`1. Verification HTTP Server listening on http://localhost:${PORT}`);
        resolve();
      });
    });
    assert(!!server, 'Express App backend server initialized');

    // 2. Health check endpoint
    console.log('\n2. Testing GET /api/health...');
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    assert(healthRes.status === 200, `GET /api/health returned HTTP 200 OK (${healthRes.status})`);

    // 3. Test POST /api/v1/ai/chat endpoint
    console.log('\n3. Testing POST /api/v1/ai/chat SSE endpoint...');
    const chatRes = await fetch(`http://localhost:${PORT}/api/v1/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello! What consulting services does Denis Chamkaga provide?',
        language: 'en',
      }),
    });

    assert(chatRes.status === 200, `POST /api/v1/ai/chat returned HTTP ${chatRes.status} OK`);
    const contentType = chatRes.headers.get('content-type') || '';
    assert(contentType.includes('text/event-stream'), `Response Content-Type is "${contentType}" (Server-Sent Events)`);

    // Read body text stream
    const responseText = await chatRes.text();
    assert(responseText.includes('data:'), 'Response stream contains valid SSE data frames');
    assert(!responseText.includes('temporarily offline'), 'Response stream contains 0 offline fallback messages');

    console.log('\nResponse Stream Snippet:');
    console.log(responseText.substring(0, 300) + '...\n');

    console.log('================================================================');
    console.log(`✅ LIVE HTTP /api/v1/ai/chat ENDPOINT VERIFICATION PASSED: ${passed}/${total}`);
    console.log('================================================================\n');
  } catch (error) {
    console.error('\n❌ LIVE HTTP VERIFICATION FAILED:', error);
    process.exit(1);
  } finally {
    if (server) {
      (server as Server).close();
    }
  }
}

verifyLiveHttpEndpoint();
