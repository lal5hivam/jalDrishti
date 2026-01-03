import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  NationalSummaryResponse,
  DistrictStress,
  StateSummary,
  StationAlert,
  StationTimeSeriesResponse,
  CriticalAlertsSummary,
  AlertByType,
  FutureRiskAnalysis,
  StationListItem,
  ReportMetadata,
  DistrictQueryParams,
  StationQueryParams,
} from '@/types/api';

// Query keys
export const queryKeys = {
  national: ['national-summary'] as const,
  districts: (params?: DistrictQueryParams) => ['districts', params] as const,
  states: ['states'] as const,
  stationAlerts: (params?: StationQueryParams) => ['station-alerts', params] as const,
  stationTimeSeries: (stationId: string) => ['station-timeseries', stationId] as const,
  stationList: (params?: StationQueryParams) => ['station-list', params] as const,
  criticalAlerts: ['critical-alerts'] as const,
  alertsByType: ['alerts-by-type'] as const,
  futureRisk: (horizon: '1y' | '3y') => ['future-risk', horizon] as const,
  reportMetadata: ['report-metadata'] as const,
};

// Summary Hooks
export function useNationalSummary(): UseQueryResult<NationalSummaryResponse> {
  return useQuery({
    queryKey: queryKeys.national,
    queryFn: api.summary.national,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDistrictSummary(
  params?: DistrictQueryParams
): UseQueryResult<DistrictStress[]> {
  return useQuery({
    queryKey: queryKeys.districts(params),
    queryFn: () => api.summary.districts(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useStateSummary(): UseQueryResult<StateSummary[]> {
  return useQuery({
    queryKey: queryKeys.states,
    queryFn: api.summary.states,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Station Hooks
export function useStationAlerts(
  params?: StationQueryParams
): UseQueryResult<StationAlert[]> {
  return useQuery({
    queryKey: queryKeys.stationAlerts(params),
    queryFn: () => api.stations.alerts(params),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useStationTimeSeries(
  stationId: string,
  enabled: boolean = true
): UseQueryResult<StationTimeSeriesResponse> {
  return useQuery({
    queryKey: queryKeys.stationTimeSeries(stationId),
    queryFn: () => api.stations.timeSeries(stationId),
    enabled: enabled && !!stationId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useStationList(
  params?: StationQueryParams
): UseQueryResult<StationListItem[]> {
  return useQuery({
    queryKey: queryKeys.stationList(params),
    queryFn: () => api.stations.list(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Alert Hooks
export function useCriticalAlerts(): UseQueryResult<CriticalAlertsSummary> {
  return useQuery({
    queryKey: queryKeys.criticalAlerts,
    queryFn: api.alerts.critical,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAlertsByType(): UseQueryResult<AlertByType[]> {
  return useQuery({
    queryKey: queryKeys.alertsByType,
    queryFn: api.alerts.byType,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useFutureRisk(horizon: '1y' | '3y' = '1y'): UseQueryResult<FutureRiskAnalysis> {
  return useQuery({
    queryKey: queryKeys.futureRisk(horizon),
    queryFn: () => api.alerts.futureRisk(horizon),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Report Hooks
export function useReportMetadata(): UseQueryResult<ReportMetadata[]> {
  return useQuery({
    queryKey: queryKeys.reportMetadata,
    queryFn: api.reports.metadata,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
