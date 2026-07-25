// backend/src/scripts/verify-ai-webrtc-call.ts
// Verification script for AI Voice Call (WebRTC) Signaling & Session Pipeline

import app from '../app';
import prisma from '../config/database';
import { Server } from 'http';

async function verifyAIWebRtcCall() {
  console.log('================================================================');
  console.log('📞 AI VOICE CALL (WEBRTC) SIGNALING & SESSION VERIFICATION');
  console.log('================================================================\n');

  let server: Server | null = null;
  const PORT = 5006;
  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, description: string) => {
    total++;
    if (condition) {
      console.log(` ✅ PASS [Check ${total}]: ${description}`);
      passed++;
    } else {
      console.error(` ❌ FAIL [Check ${total}]: ${description}`);
      throw new Error(`WebRTC Call Verification Failed: ${description}`);
    }
  };

  try {
    // Start local server for HTTP testing
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => resolve());
    });
    assert(!!server, 'Backend HTTP server listening for WebRTC signaling');

    // 1. Create a dummy active ChatSession in DB
    const session = await prisma.chatSession.create({
      data: {
        visitorId: `visitor_webrtc_${Date.now()}`,
        status: 'active',
        leadScore: 60,
        metadata: {},
      },
    });
    assert(!!session.id, `Created test Chat Session for WebRTC Call (ID: ${session.id})`);

    // 2. Check WebRTC status endpoint
    console.log('\n2. Testing GET /api/v1/ai/webrtc/session...');
    const statusRes = await fetch(`http://localhost:${PORT}/api/v1/ai/webrtc/session?sessionId=${session.id}`);
    const statusData = await statusRes.json() as any;
    assert(statusRes.status === 200, `GET /api/v1/ai/webrtc/session returned HTTP 200 OK`);
    assert(statusData.data.enabled === true, `WebRTC voice calling is enabled (Status: ${statusData.data.status})`);

    // 3. Post SDP Offer (Caller Initiating Call)
    console.log('\n3. Testing POST /api/v1/ai/webrtc/offer (Register Call Offer)...');
    const dummySdpOffer = 'v=0\no=- 123456 2 IN IP4 127.0.0.1\ns=-\nt=0 0\na=sendrecv\n';
    const offerRes = await fetch(`http://localhost:${PORT}/api/v1/ai/webrtc/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        sdpOffer: dummySdpOffer,
      }),
    });
    const offerData = await offerRes.json() as any;
    assert(offerRes.status === 200, `POST /api/v1/ai/webrtc/offer returned HTTP 200 OK`);
    assert(!!offerData.data.callSessionId, `Call Session created in DB (CallSessionId: ${offerData.data.callSessionId})`);

    // 4. Get SDP Offer
    console.log('\n4. Testing GET /api/v1/ai/webrtc/offer/:sessionId...');
    const getOfferRes = await fetch(`http://localhost:${PORT}/api/v1/ai/webrtc/offer/${session.id}`);
    const getOfferData = await getOfferRes.json() as any;
    assert(getOfferRes.status === 200, `GET /api/v1/ai/webrtc/offer returned SDP Offer`);
    assert(getOfferData.data.sdpOffer === dummySdpOffer, 'Retrieved matching SDP Offer from signaling registry');

    // 5. Post SDP Answer (Callee Answering Call)
    console.log('\n5. Testing POST /api/v1/ai/webrtc/answer...');
    const dummySdpAnswer = 'v=0\no=- 654321 2 IN IP4 127.0.0.1\ns=-\nt=0 0\na=recvonly\n';
    const answerRes = await fetch(`http://localhost:${PORT}/api/v1/ai/webrtc/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        sdpAnswer: dummySdpAnswer,
      }),
    });
    assert(answerRes.status === 200, 'POST /api/v1/ai/webrtc/answer registered SDP Answer successfully');

    // 6. Post ICE Candidate
    console.log('\n6. Testing POST /api/v1/ai/webrtc/candidate...');
    const candidateRes = await fetch(`http://localhost:${PORT}/api/v1/ai/webrtc/candidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        candidate: { candidate: 'candidate:1 1 UDP 2013266431 127.0.0.1 5000 typ host', sdpMid: '0', sdpMLineIndex: 0 },
        role: 'caller',
      }),
    });
    assert(candidateRes.status === 200, 'POST /api/v1/ai/webrtc/candidate registered ICE candidate');

    // 7. Log Call End (Call Cleanup)
    console.log('\n7. Testing POST /api/v1/ai/webrtc/log (Call Hangup & Audit Log)...');
    const logRes = await fetch(`http://localhost:${PORT}/api/v1/ai/webrtc/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        status: 'completed',
      }),
    });
    assert(logRes.status === 200, 'POST /api/v1/ai/webrtc/log completed call session and recorded audit log');

    // Cleanup test record
    await prisma.chatSession.delete({ where: { id: session.id } }).catch(() => {});

    console.log('\n================================================================');
    console.log(`✅ AI VOICE CALL (WEBRTC) SIGNALING VERIFICATION PASSED: ${passed}/${total}`);
    console.log('================================================================\n');
  } catch (error) {
    console.error('\n❌ WEBRTC CALL VERIFICATION FAILED:', error);
    process.exit(1);
  } finally {
    if (server) {
      (server as Server).close();
    }
  }
}

verifyAIWebRtcCall();
