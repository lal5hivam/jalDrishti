import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  NationalSummaryResponse,
  DistrictStress,
  StateSummary,
  StationAlert,
  StationTimeSeriesResponse,
  CriticalAlertsSummary,
  AlertByType,
  AlertDistributionResponse,
  FutureRiskAnalysis,
  StationListItem,
  ReportMetadata,
  DistrictQueryParams,
  StationQueryParams,
  ReportQueryParams,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('[API Error]', error.message);
        if (error.response) {
          console.error('[API Error Data]', error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  // Summary Endpoints
  async getNationalSummary(): Promise<NationalSummaryResponse> {
    const { data } = await this.client.get('/api/summary/national');
    return data;
  }

  async getDistrictSummary(params?: DistrictQueryParams): Promise<DistrictStress[]> {
    const { data } = await this.client.get('/api/summary/districts', { params });
    return data;
  }

  async getStateSummary(): Promise<StateSummary[]> {
    const { data } = await this.client.get('/api/summary/states');
    return data;
  }

  // Station Endpoints
  async getStationAlerts(params?: StationQueryParams): Promise<StationAlert[]> {
    const { data } = await this.client.get('/api/stations/alerts', { params });
    return data;
  }

  async getStationTimeSeries(stationId: string): Promise<StationTimeSeriesResponse> {
    const { data } = await this.client.get(`/api/stations/${stationId}/timeseries`);
    return data;
  }

  async getStationList(params?: StationQueryParams): Promise<StationListItem[]> {
    const { data } = await this.client.get('/api/stations/list', { params });
    return data;
  }

  // Alert Endpoints
  async getCriticalAlerts(): Promise<CriticalAlertsSummary> {
    const { data } = await this.client.get('/api/alerts/critical');
    return data;
  }

  async getAlertsByType(): Promise<AlertByType[]> {
    const { data } = await this.client.get<AlertDistributionResponse>('/api/alerts/by-type');
    // Transform backend response to array format
    const alerts: AlertByType[] = [];
    if (data.alert_distribution) {
      for (const [alert_type, stats] of Object.entries(data.alert_distribution)) {
        alerts.push({
          alert_type,
          count: stats.count,
          percentage: stats.percentage,
        });
      }
    }
    return alerts;
  }

  async getFutureRisk(horizon: '1y' | '3y' = '1y'): Promise<FutureRiskAnalysis> {
    const { data } = await this.client.get('/api/alerts/future-risk', {
      params: { horizon },
    });
    return data;
  }

  // Report Endpoints
  async downloadReport(reportType: string): Promise<Blob> {
    const { data } = await this.client.get('/api/reports/download', {
      params: { report_type: reportType },
      responseType: 'blob',
    });
    return data;
  }

  async getReportMetadata(): Promise<ReportMetadata[]> {
    const { data } = await this.client.get('/api/reports/metadata');
    return data;
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const { data } = await this.client.get('/health');
    return data;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Export convenience functions
export const api = {
  summary: {
    national: () => apiClient.getNationalSummary(),
    districts: (params?: DistrictQueryParams) => apiClient.getDistrictSummary(params),
    states: () => apiClient.getStateSummary(),
  },
  stations: {
    alerts: (params?: StationQueryParams) => apiClient.getStationAlerts(params),
    timeSeries: (stationId: string) => apiClient.getStationTimeSeries(stationId),
    list: (params?: StationQueryParams) => apiClient.getStationList(params),
  },
  alerts: {
    critical: () => apiClient.getCriticalAlerts(),
    byType: () => apiClient.getAlertsByType(),
    futureRisk: (horizon?: '1y' | '3y') => apiClient.getFutureRisk(horizon),
  },
  reports: {
    download: (reportType: string) => apiClient.downloadReport(reportType),
    metadata: () => apiClient.getReportMetadata(),
  },
  health: () => apiClient.healthCheck(),
};

export default apiClient;
