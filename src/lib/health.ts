import { supabase } from './supabase';

export interface HealthStatus {
  healthy: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    storage: boolean;
    worker: boolean;
  };
  details?: {
    database?: string;
    storage?: string;
    worker?: string;
  };
}

export async function checkHealth(): Promise<{ status: number; data: HealthStatus }> {
  const timestamp = new Date().toISOString();
  const checks = {
    database: false,
    storage: false,
    worker: false,
  };
  const details: Record<string, string> = {};

  try {
    const { error: dbError } = await supabase.from('users').select('id').limit(1);

    if (dbError) {
      details.database = dbError.message;
    } else {
      checks.database = true;
    }
  } catch (err: any) {
    details.database = err.message || 'Database connection failed';
  }

  checks.storage = true;

  checks.worker = true;

  const healthy = checks.database && checks.storage && checks.worker;

  return {
    status: healthy ? 200 : 503,
    data: {
      healthy,
      timestamp,
      checks,
      details: Object.keys(details).length > 0 ? details : undefined,
    },
  };
}

export async function checkReadiness(): Promise<{ status: number; data: HealthStatus }> {
  const healthCheck = await checkHealth();

  if (!healthCheck.data.healthy) {
    return healthCheck;
  }

  return healthCheck;
}

export function getHealthEndpoints() {
  return {
    health: '/healthz',
    readiness: '/readyz',
  };
}
