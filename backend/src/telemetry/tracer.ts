// backend/src/telemetry/tracer.ts
// OpenTelemetry Distributed Tracing Module for Denis Business Platform

import { trace, context, Span, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { v4 as uuidv4 } from 'uuid';

const TRACER_NAME = 'denis-platform-ai-tracer';
const tracer = trace.getTracer(TRACER_NAME, '1.0.0');

export interface SpanOptions {
  name: string;
  correlationId?: string;
  attributes?: Record<string, string | number | boolean>;
}

export async function traceAsync<T>(
  options: SpanOptions,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const spanName = options.name;
  const span = tracer.startSpan(spanName, {
    kind: SpanKind.INTERNAL,
    attributes: {
      'service.name': 'denis-platform-backend',
      'correlation.id': options.correlationId || uuidv4(),
      ...options.attributes
    }
  });

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error?.message || 'Trace execution failed'
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}

export function getCurrentTraceId(): string {
  const currentSpan = trace.getSpan(context.active());
  if (currentSpan) {
    return currentSpan.spanContext().traceId;
  }
  return uuidv4();
}
