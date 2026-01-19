import { useState, useEffect } from 'react';
import { DashboardMetrics, HiringMetrics } from '@/types';
import { mockDashboardMetrics, mockHiringMetrics } from '@/data/mockData';

const METRICS_STORAGE_KEY = 'dashboard_metrics';
const HIRING_STORAGE_KEY = 'hiring_metrics';

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => {
    const stored = localStorage.getItem(METRICS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return mockDashboardMetrics;
      }
    }
    return mockDashboardMetrics;
  });

  const [hiringMetrics, setHiringMetrics] = useState<HiringMetrics>(() => {
    const stored = localStorage.getItem(HIRING_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return mockHiringMetrics;
      }
    }
    return mockHiringMetrics;
  });

  useEffect(() => {
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem(HIRING_STORAGE_KEY, JSON.stringify(hiringMetrics));
  }, [hiringMetrics]);

  const updateMetrics = (newMetrics: Partial<DashboardMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  const updateHiringMetrics = (newMetrics: Partial<HiringMetrics>) => {
    setHiringMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  return {
    metrics,
    hiringMetrics,
    updateMetrics,
    updateHiringMetrics,
    setMetrics,
    setHiringMetrics
  };
}
