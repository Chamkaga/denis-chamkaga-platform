// backend/src/services/metrics.service.ts
// Standardized Prometheus-Compatible Metrics Collector Service

export class MetricsService {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  incCounter(metricName: string, value: number = 1) {
    const current = this.counters.get(metricName) || 0;
    this.counters.set(metricName, current + value);
  }

  setGauge(metricName: string, value: number) {
    this.gauges.set(metricName, value);
  }

  observeHistogram(metricName: string, value: number) {
    const list = this.histograms.get(metricName) || [];
    list.push(value);
    this.histograms.set(metricName, list);
  }

  startTimer(metricName: string) {
    const start = Date.now();
    return () => {
      const elapsed = Date.now() - start;
      this.observeHistogram(metricName, elapsed);
      return elapsed;
    };
  }

  getMetricsSummary() {
    const countersObj: Record<string, number> = {};
    this.counters.forEach((v, k) => (countersObj[k] = v));

    const gaugesObj: Record<string, number> = {};
    this.gauges.forEach((v, k) => (gaugesObj[k] = v));

    return {
      counters: countersObj,
      gauges: gaugesObj,
      timestamp: new Date().toISOString()
    };
  }
}

export const metricsService = new MetricsService();
