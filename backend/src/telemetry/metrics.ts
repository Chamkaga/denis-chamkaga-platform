// backend/src/telemetry/metrics.ts
// Enterprise Prometheus Metrics Registry for Denis Business Platform

import client from 'prom-client';

// Initialize default Node.js process metrics (CPU, Memory, Event Loop, GC)
client.collectDefaultMetrics({ prefix: 'denis_platform_' });

export const prometheusRegistry = client.register;

// 1. HTTP Request Counter
export const httpRequestCounter = new client.Counter({
  name: 'denis_platform_http_requests_total',
  help: 'Total number of HTTP requests processed by backend API',
  labelNames: ['method', 'route', 'status_code']
});

// 2. HTTP Request Latency Histogram (SLA Buckets)
export const httpRequestDurationHistogram = new client.Histogram({
  name: 'denis_platform_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0]
});

// 3. AI Orchestrator Latency Histogram
export const aiOrchestratorLatencyHistogram = new client.Histogram({
  name: 'denis_platform_ai_orchestrator_latency_seconds',
  help: 'AI Orchestrator message processing duration in seconds',
  labelNames: ['intent', 'confidence_tier'],
  buckets: [0.1, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0]
});

// 4. PostgreSQL Query Latency Histogram
export const postgresQueryLatencyHistogram = new client.Histogram({
  name: 'denis_platform_postgres_query_duration_seconds',
  help: 'PostgreSQL database query execution duration in seconds',
  labelNames: ['query_type'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5]
});

// 5. Lead Assessments Counter
export const leadAssessmentCounter = new client.Counter({
  name: 'denis_platform_lead_assessments_total',
  help: 'Total leads processed and intelligence scores calculated',
  labelNames: ['temperature', 'industry']
});

// 6. EventBus Published Events Counter
export const eventBusCounter = new client.Counter({
  name: 'denis_platform_event_bus_events_total',
  help: 'Total events published to EventBus',
  labelNames: ['event_type']
});

export const aiGenerationCounter = new client.Counter({
  name: 'denis_platform_ai_generations_total',
  help: 'AI generation outcomes separated by provider, model, and mode',
  labelNames: ['provider', 'model', 'mode', 'error_code']
});

export const aiStageDurationHistogram = new client.Histogram({
  name: 'denis_platform_ai_stage_duration_seconds',
  help: 'Mary orchestration stage duration',
  labelNames: ['stage'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20]
});
