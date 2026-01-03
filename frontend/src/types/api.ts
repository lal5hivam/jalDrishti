// API Response Types matching backend Pydantic models

export interface NationalSummaryResponse {
  total_stations: number;
  stressed_percentage: number;
  average_gavi: number;
  active_critical_alerts: number;
  year: number;
}

export interface DistrictStress {
  state: string;
  district: string;
  total_stations: number;
  avg_gavi: number;
  stressed_ratio: number;
  critical_alerts: number;
  depletion_alerts: number;
  stress_category?: string;
  future_risk_flag?: string;
}

export interface StateSummary {
  state: string;
  total_stations: number;
  avg_gavi: number;
  stressed_percentage: number;
  critical_alerts: number;
  depletion_alerts: number;
  recovery_signals: number;
}

export interface StationAlert {
  station_id: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  year: number;
  gavi: number;
  water_level: number;
  alert: string;
  alert_severity: string;
}

export interface TimeSeriesPoint {
  year: number;
  water_level: number;
  gavi: number;
  alert: string | null;
}

export interface ForecastPoint {
  year: number;
  predicted_water_level: number;
  predicted_gavi: number;
  forecast_alert: string;
  confidence: string;
}

export interface StationTimeSeriesResponse {
  station_id: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  historical: TimeSeriesPoint[];
  forecast: ForecastPoint[];
  baseline: {
    min_water_level: number;
    max_water_level: number;
    avg_water_level: number;
  };
  current_status: {
    latest_year: number;
    latest_gavi: number;
    latest_alert: string;
  };
  explanation: string;
}

export interface TopAffectedDistrict {
  state: string;
  district: string;
  current_critical: number;
  future_critical_1y: number;
  stressed_ratio: number;
  avg_gavi: number;
}

export interface CriticalAlertsSummary {
  current_critical_count: number;
  future_critical_1y: number;
  future_critical_3y: number;
  top_affected_districts: TopAffectedDistrict[];
}

export interface AlertByType {
  alert_type: string;
  count: number;
  percentage: number;
}

export interface AlertDistributionResponse {
  year: number;
  total_stations: number;
  alert_distribution: Record<string, { count: number; percentage: number }>;
}

export interface FutureRiskAnalysis {
  horizon: '1y' | '3y';
  total_stations: number;
  future_alert_distribution: Record<string, { count: number; percentage: number }>;
  top_10_states_at_risk: Record<string, number>;
}

export interface StationListItem {
  station_id: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  latest_gavi: number;
  latest_alert: string;
}

export interface ReportMetadata {
  report_type: string;
  description: string;
  record_count: number;
  last_updated: string;
  available: boolean;
}

// Query Parameters
export interface DistrictQueryParams {
  state?: string;
  min_stressed_ratio?: number;
  sort_by?: 'stressed_ratio' | 'critical_ratio' | 'avg_gavi' | 'total_alerts';
  limit?: number;
}

export interface StationQueryParams {
  state?: string;
  district?: string;
  alert_type?: string;
  limit?: number;
}

export interface ReportQueryParams {
  report_type: 'district_stress' | 'state_summary' | 'station_alerts' | 'critical_alerts' | 'forecast_data';
}

// UI-specific types
export type GAVICategory = 'critical' | 'stressed' | 'watch' | 'safe';

export interface GAVIConfig {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
}

export const GAVI_THRESHOLDS: Record<GAVICategory, GAVIConfig> = {
  critical: {
    min: 0,
    max: 25,
    label: 'Critical',
    color: '#d32f2f',
    description: 'Immediate intervention required',
  },
  stressed: {
    min: 25,
    max: 50,
    label: 'Stressed',
    color: '#f57c00',
    description: 'Close monitoring needed',
  },
  watch: {
    min: 50,
    max: 75,
    label: 'Watch',
    color: '#fbc02d',
    description: 'Stable but declining',
  },
  safe: {
    min: 75,
    max: 100,
    label: 'Safe',
    color: '#388e3c',
    description: 'Healthy groundwater levels',
  },
};

export function getGAVICategory(gavi: number): GAVICategory {
  if (gavi < 25) return 'critical';
  if (gavi < 50) return 'stressed';
  if (gavi < 75) return 'watch';
  return 'safe';
}

export function getGAVIColor(gavi: number): string {
  const category = getGAVICategory(gavi);
  return GAVI_THRESHOLDS[category].color;
}

export const ALERT_CONFIG = {
  CRITICAL_GROUNDWATER: {
    label: 'Critical Groundwater',
    color: '#d32f2f',
    icon: '🔴',
    severity: 'critical',
    description: 'GAVI below 25 - immediate intervention required',
  },
  DEPLETION_WARNING: {
    label: 'Depletion Warning',
    color: '#f57c00',
    icon: '🟠',
    severity: 'high',
    description: 'GAVI below 50 and declining trend',
  },
  SUDDEN_DROP: {
    label: 'Sudden Drop',
    color: '#fbc02d',
    icon: '🟡',
    severity: 'medium',
    description: 'Water level dropped by ≥2m year-over-year',
  },
  RECOVERY_SIGNAL: {
    label: 'Recovery Signal',
    color: '#388e3c',
    icon: '🟢',
    severity: 'low',
    description: 'Water level improved by ≥1m',
  },
  NORMAL: {
    label: 'Normal',
    color: '#9e9e9e',
    icon: '⚪',
    severity: 'none',
    description: 'Station within normal parameters',
  },
  NO_ALERT: {
    label: 'No Alert',
    color: '#9e9e9e',
    icon: '⚪',
    severity: 'none',
    description: 'Station within normal parameters',
  },
} as const;

// Type-safe alert config keys
export type AlertType = keyof typeof ALERT_CONFIG;

// Default fallback for unknown alert types
const DEFAULT_ALERT_CONFIG = {
  label: 'Unknown Alert',
  color: '#757575',
  icon: '⚫',
  severity: 'unknown',
  description: 'Unknown alert type',
} as const;

/**
 * Get alert configuration with automatic fallback for unknown types
 * Production-safe: Never returns undefined
 */
export function getAlertConfig(alertType: string | null | undefined): typeof DEFAULT_ALERT_CONFIG {
  if (!alertType) return DEFAULT_ALERT_CONFIG;
  
  const config = ALERT_CONFIG[alertType as AlertType];
  return config || DEFAULT_ALERT_CONFIG;
}
