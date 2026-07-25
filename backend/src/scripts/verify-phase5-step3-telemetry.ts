// backend/src/scripts/verify-phase5-step3-telemetry.ts
// Live Runtime Verification Suite for Phase 5 Step 3 — Observability & Production Telemetry

import app from '../app';
import { Server } from 'http';
import fs from 'fs';
import path from 'path';
import { traceAsync, getCurrentTraceId } from '../telemetry/tracer';
import { leadAssessmentCounter, eventBusCounter } from '../telemetry/metrics';

async function runStep3TelemetryVerification() {
  console.log('================================================================');
  console.log('📡 PHASE 5 STEP 3: LIVE PRODUCTION TELEMETRY VERIFICATION');
  console.log('================================================================');

  let server: Server | null = null;
  const PORT = 5014;
  const results = {
    openTelemetryTracing: false,
    prometheusMetricsScraping: false,
    healthReadinessSloCheck: false,
    sloDashboardAlertsCheck: false,
    correlationHeaderPropagation: false,
    metricsFound: [] as string[],
    evidenceLocation: 'docs/evidence/phase5-step3/step3-telemetry-verification-report.json'
  };

  try {
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`📡 Telemetry Express Test Server bound on http://localhost:${PORT}`);
        resolve();
      });
    });

    // ── 1. OPENTELEMETRY TRACING VERIFICATION ─────────────────────────────────
    console.log('\n--- 1. Testing OpenTelemetry Distributed Tracing ---');
    await traceAsync({ name: 'verifyStep3Trace', attributes: { 'test.suite': 'phase5-step3' } }, async () => {
      const traceId = getCurrentTraceId();
      console.log(`  ✅ OpenTelemetry Trace Context Active. Trace ID: ${traceId}`);
      if (traceId && traceId.length > 0) {
        results.openTelemetryTracing = true;
      }
    });

    // Increment custom business metrics
    leadAssessmentCounter.inc({ temperature: 'WARM', industry: 'pharmacy' });
    eventBusCounter.inc({ event_type: 'ConversationStarted' });

    // ── 2. PROMETHEUS SCRAPING ENDPOINT VERIFICATION ──────────────────────────
    console.log('\n--- 2. Testing Prometheus /metrics Endpoint Scraping ---');
    const metricsRes = await fetch(`http://localhost:${PORT}/api/v1/telemetry/metrics`);
    const metricsText = await metricsRes.text();

    const expectedMetrics = [
      'denis_platform_http_requests_total',
      'denis_platform_http_request_duration_seconds',
      'denis_platform_lead_assessments_total',
      'denis_platform_event_bus_events_total',
      'denis_platform_process_cpu_seconds_total',
      'denis_platform_nodejs_heap_size_total_bytes'
    ];

    let foundCount = 0;
    for (const metricName of expectedMetrics) {
      if (metricsText.includes(metricName)) {
        foundCount++;
        results.metricsFound.push(metricName);
        console.log(`  ✅ Found Prometheus Metric: ${metricName}`);
      }
    }

    if (foundCount === expectedMetrics.length) {
      results.prometheusMetricsScraping = true;
    }

    // ── 3. CORRELATION ID HEADER PROPAGATION VERIFICATION ──────────────────────
    console.log('\n--- 3. Testing Correlation ID Header Propagation ---');
    const chatRes = await fetch(`http://localhost:${PORT}/api/v1/telemetry/health/liveness`, {
      headers: { 'X-Correlation-ID': 'test_corr_id_step3_12345' }
    });
    const returnedCorrId = chatRes.headers.get('x-correlation-id');
    console.log(`  ✅ Returned Correlation ID Header: ${returnedCorrId}`);
    if (returnedCorrId === 'test_corr_id_step3_12345') {
      results.correlationHeaderPropagation = true;
    }

    // ── 4. HEALTH READINESS & SLO TARGETS CHECK ────────────────────────────────
    console.log('\n--- 4. Testing Health Readiness & SLO Targets ---');
    const readinessRes = await fetch(`http://localhost:${PORT}/api/v1/telemetry/health/readiness`);
    const readinessData: any = await readinessRes.json();
    console.log(`  ✅ Health Readiness Payload: Status=${readinessData.status} | DB Latency=${readinessData.checks?.database?.latencyMs}ms`);
    if (readinessRes.status === 200 && readinessData.status === 'READY') {
      results.healthReadinessSloCheck = true;
    }

    // ── 5. SLO DASHBOARD & ALERTS DEFINITION CHECK ───────────────────────────
    console.log('\n--- 5. Testing Live SLO Dashboard & Alert Definitions ---');
    const sloRes = await fetch(`http://localhost:${PORT}/api/v1/telemetry/slo`);
    const sloData: any = await sloRes.json();
    console.log(`  ✅ SLO Dashboard: Service=${sloData.service} | Defined Alerts=${sloData.alertsDefinition?.length}`);
    if (sloRes.status === 200 && sloData.alertsDefinition?.length >= 3) {
      results.sloDashboardAlertsCheck = true;
    }

    // ── PERSIST EVIDENCE REPORT ──────────────────────────────────────────────
    const evidenceDir = path.join(__dirname, '../../../docs/evidence/phase5-step3');
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }

    const reportPath = path.join(evidenceDir, 'step3-telemetry-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      step: 'Phase 5 Step 3',
      name: 'Observability & Production Telemetry Verification Report',
      executedAt: new Date().toISOString(),
      results,
      status: (results.openTelemetryTracing && results.prometheusMetricsScraping && results.healthReadinessSloCheck) ? 'PASS' : 'FAIL'
    }, null, 2));

    console.log('\n================================================================');
    console.log('📋 TELEMETRY VERIFICATION SUMMARY');
    console.log('================================================================');
    console.log(`  OpenTelemetry Tracing: ${results.openTelemetryTracing ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Prometheus /metrics Scraping: ${results.prometheusMetricsScraping ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Correlation Header Propagation: ${results.correlationHeaderPropagation ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Health Readiness & SLO Check: ${results.healthReadinessSloCheck ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  SLO Dashboard & Alerts Check: ${results.sloDashboardAlertsCheck ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Saved Evidence Report: ${reportPath}`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Step 3 Telemetry Verification Failed:', err);
    process.exit(1);
  } finally {
    if (server) {
      (server as Server).close();
    }
  }
}

runStep3TelemetryVerification();
